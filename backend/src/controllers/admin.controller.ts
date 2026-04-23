import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { UserRepository } from '../repositories/user.repository';
import { TemplateRepository } from '../repositories/template.repository';
import { NotificationRepository } from '../repositories/notification.repository';
import { SocketService } from '../services/socket.service';
import logger from '../utils/logger';

export class AdminController {
  private static async notifyActiveHR(payload: any, type: string = 'info'): Promise<void> {
    const hrIds = await UserRepository.findActiveHRIds();
    await NotificationRepository.createManyForUsers({
      userIds: hrIds,
      type,
      payload,
    });
    hrIds.forEach((id) => {
      SocketService.emitToUser(id, 'notification:new', payload);
    });
  }

  // ============ HR ACCOUNT MANAGEMENT ============

  // GET /api/admin/hr-accounts
  static async getHRAccounts(req: Request, res: Response): Promise<void> {
    try {
      const includeInactive = String(req.query.includeInactive || 'false') === 'true';
      const accounts = await UserRepository.findAllByRole('HR', includeInactive);
      res.json(accounts);
    } catch (err: any) {
      logger.error('Get HR accounts error:', err);
      res.status(500).json({ error: 'Echec de la recuperation des comptes RH' });
    }
  }

  // POST /api/admin/hr-accounts
  static async createHRAccount(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password, phone, site } = req.body;
      const normalizedEmail = String(email).trim().toLowerCase();

      const existing = await UserRepository.findByEmail(normalizedEmail);
      if (existing) {
        res.status(409).json({ error: 'E-mail deja utilise' });
        return;
      }

      // Normalize site value to match enum
      let normalizedSite = null;
      if (site) {
        const siteStr = site.toString().toLowerCase();
        if (siteStr === 'bouarada') {
          normalizedSite = 'Bouarada';
        } else if (siteStr === 'zaghouan') {
          normalizedSite = 'Zaghouan';
        } else {
          res.status(400).json({ error: 'Site invalide. Valeurs autorisees : Bouarada ou Zaghouan' });
          return;
        }
      }

      const passwordHash = await AuthService.hashPassword(password);
      const user = await UserRepository.create({
        email: normalizedEmail,
        passwordHash,
        role: 'HR',
        name,
        phone: phone || undefined,
        site: normalizedSite as any,
      });

      logger.info(`Admin created HR account: ${user.email} for site ${normalizedSite}`);

      SocketService.emitToAdmin('admin:hr-account:changed', { action: 'created', userId: user.id });
      SocketService.emitToAdmin('admin:overview:updated', { reason: 'hr-account-created' });

      res.status(201).json({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        site: user.site,
        createdAt: user.createdAt,
      });
    } catch (err: any) {
      logger.error('Create HR account error:', err);
      res.status(500).json({ error: 'Echec de la creation du compte RH' });
    }
  }

  // PATCH /api/admin/hr-accounts/:id
  static async updateHRAccount(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const updates: Record<string, any> = {};

      if (req.body.email) {
        const normalizedEmail = String(req.body.email).trim().toLowerCase();
        const existing = await UserRepository.findByEmail(normalizedEmail);
        if (existing && existing.id !== id) {
          res.status(409).json({ error: 'E-mail deja utilise' });
          return;
        }
        updates.email = normalizedEmail;
      }

      if (req.body.name) updates.name = req.body.name;
      if (Object.prototype.hasOwnProperty.call(req.body, 'phone')) {
        updates.phone = req.body.phone || null;
      }
      if (req.body.site) {
        // Normalize site value to match enum
        const siteStr = req.body.site.toString().toLowerCase();
        if (siteStr === 'bouarada') {
          updates.site = 'Bouarada';
        } else if (siteStr === 'zaghouan') {
          updates.site = 'Zaghouan';
        } else {
          res.status(400).json({ error: 'Site invalide. Valeurs autorisees : Bouarada ou Zaghouan' });
          return;
        }
      }
      if (req.body.password) {
        updates.passwordHash = await AuthService.hashPassword(req.body.password);
      }

      const user = await UserRepository.update(id, updates);
      logger.info(`Admin updated HR account: ${user.email}`);

      SocketService.emitToAdmin('admin:hr-account:changed', { action: 'updated', userId: user.id });
      SocketService.emitToAdmin('admin:overview:updated', { reason: 'hr-account-updated' });

      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        site: user.site,
      });
    } catch (err: any) {
      logger.error('Update HR account error:', err);
      res.status(500).json({ error: 'Echec de la mise a jour du compte RH' });
    }
  }

  // DELETE /api/admin/hr-accounts/:id  (toggle active/inactive)
  static async deleteHRAccount(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;

      if (id === req.user!.userId) {
        res.status(400).json({ error: 'Vous ne pouvez pas modifier le statut de votre propre compte.' });
        return;
      }

      const target = await UserRepository.findById(id);
      if (!target || target.role !== 'HR') {
        res.status(404).json({ error: 'Compte RH introuvable' });
        return;
      }

      const nextIsActive = !target.isActive;

      // If deactivating, revoke all sessions
      if (!nextIsActive) {
        await UserRepository.deleteAllRefreshTokens(id);
      }

      await UserRepository.update(id, {
        isActive: nextIsActive,
        deletedAt: nextIsActive ? null : new Date(),
      });

      const action = nextIsActive ? 'activated' : 'deactivated';
      const label = nextIsActive ? 'réactivé' : 'désactivé';
      logger.info(`Admin ${action} HR account: ${id}`);
      SocketService.emitToAdmin('admin:hr-account:changed', { action, userId: id });
      SocketService.emitToAdmin('admin:overview:updated', { reason: `hr-account-${action}` });
      res.json({ message: `Compte RH ${label}` });
    } catch (err: any) {
      logger.error('Toggle HR account error:', err);
      res.status(500).json({ error: 'Echec du changement de statut du compte RH' });
    }
  }

  // DELETE /api/admin/hr-accounts/:id/permanent
  static async permanentDeleteHRAccount(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const prisma = (await import('../config/prisma')).default;

      if (id === req.user!.userId) {
        res.status(400).json({ error: 'Vous ne pouvez pas supprimer votre propre compte.' });
        return;
      }

      const target = await UserRepository.findById(id);
      if (!target || target.role !== 'HR') {
        res.status(404).json({ error: 'Compte RH introuvable' });
        return;
      }

      if (target.isActive !== false) {
        res.status(400).json({ error: 'Le compte doit être désactivé avant la suppression définitive.' });
        return;
      }

      // Reassign any created offers, templates, interviews to the requesting admin
      const adminId = req.user!.userId;
      await prisma.jobOffer.updateMany({ where: { createdById: id }, data: { createdById: adminId } });
      await prisma.offerTemplate.updateMany({ where: { createdById: id }, data: { createdById: adminId } });
      await prisma.interview.updateMany({ where: { createdById: id }, data: { createdById: adminId } });

      // Prisma cascades: RefreshToken, Notification, Application, CandidateCV
      await prisma.user.delete({ where: { id } });

      logger.info(`Admin permanently deleted HR account: ${id} (${target.email})`);
      SocketService.emitToAdmin('admin:hr-account:changed', { action: 'permanent-deleted', userId: id });
      SocketService.emitToAdmin('admin:overview:updated', { reason: 'hr-account-permanent-deleted' });
      res.json({ message: 'Compte RH supprimé définitivement' });
    } catch (err: any) {
      logger.error('Permanent delete HR account error:', err);
      res.status(500).json({ error: 'Echec de la suppression définitive du compte RH' });
    }
  }

  // ============ TEMPLATE MANAGEMENT ============

  // GET /api/admin/templates
  static async getTemplates(req: Request, res: Response): Promise<void> {
    try {
      const templates = req.user?.role === 'HR'
        ? await TemplateRepository.findActive()
        : await TemplateRepository.findAll();
      res.json(templates);
    } catch (err: any) {
      logger.error('Get templates error:', err);
      res.status(500).json({ error: 'Echec de la recuperation des templates' });
    }
  }

  // POST /api/admin/templates
  static async createTemplate(req: Request, res: Response): Promise<void> {
    try {
      const body = req.body as Record<string, any>;
      const payload = {
        titleFr: (body.titleFr ?? body.title)?.trim(),
        titleEn: (body.titleEn ?? body.title_en)?.trim(),
        contractType: body.contractType,
        department: body.department?.trim(),
        description: body.description?.trim(),
        suggestedSkills: Array.isArray(body.suggestedSkills) ? body.suggestedSkills : [],
      };

      const template = await TemplateRepository.create({
        ...payload,
        createdById: req.user!.userId,
      });
      logger.info(`Admin created template: ${template.titleFr}`);
      SocketService.emitToAdmin('template:updated', template);
      SocketService.emitToAllHR('template:updated', template);
      await AdminController.notifyActiveHR({
        title: 'Template ajoute',
        message: `Un nouveau template a ete ajoute : ${template.titleFr}`,
        category: 'template',
        action: 'created',
        templateId: template.id,
      });
      res.status(201).json(template);
    } catch (err: any) {
      logger.error('Create template error:', err);
      res.status(500).json({ error: err?.message || 'Echec de la creation du template' });
    }
  }

  // PATCH /api/admin/templates/:id
  static async updateTemplate(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const body = req.body as Record<string, any>;
      const updates: Record<string, any> = {
        ...(body.titleFr !== undefined || body.title !== undefined ? { titleFr: (body.titleFr ?? body.title)?.trim() } : {}),
        ...(body.titleEn !== undefined || body.title_en !== undefined ? { titleEn: (body.titleEn ?? body.title_en)?.trim() } : {}),
        ...(body.contractType !== undefined ? { contractType: body.contractType } : {}),
        ...(body.department !== undefined ? { department: body.department?.trim() } : {}),
        ...(body.description !== undefined ? { description: body.description?.trim() } : {}),
        ...(body.suggestedSkills !== undefined ? { suggestedSkills: body.suggestedSkills } : {}),
        ...(body.isActive !== undefined ? { isActive: body.isActive } : {}),
      };

      const template = await TemplateRepository.update(id, updates);
      logger.info(`Admin updated template: ${template.titleFr}`);
      SocketService.emitToAdmin('template:updated', template);
      SocketService.emitToAllHR('template:updated', template);
      await AdminController.notifyActiveHR({
        title: 'Template mis a jour',
        message: `Template mis a jour : ${template.titleFr}`,
        category: 'template',
        action: 'updated',
        templateId: template.id,
      });
      res.json(template);
    } catch (err: any) {
      logger.error('Update template error:', err);
      if (err?.code === 'P2025') {
        res.status(404).json({ error: 'Template introuvable' });
        return;
      }
      res.status(500).json({ error: err?.message || 'Echec de la mise a jour du template' });
    }
  }

  // DELETE /api/admin/templates/:id
  static async deleteTemplate(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      
      // Protect core templates from deletion
      const coreTemplateIds = [
        'planificateur-production',
        'acheteur-strategique', 
        'chef-equipe-achats',
        'mecanicien-industriel',
        'operateur-machines',
        'technicien-electronique',
        'responsable-rh'
      ];
      
      if (coreTemplateIds.includes(id)) {
        res.status(403).json({ 
          error: 'Impossible de desactiver un template de base. Les templates de base sont proteges et doivent toujours rester disponibles.' 
        });
        return;
      }

      const existing = await TemplateRepository.findById(id);
      if (!existing) {
        res.status(404).json({ error: 'Template introuvable' });
        return;
      }

      const nextIsActive = !existing.isActive;
      const template = await TemplateRepository.update(id, {
        isActive: nextIsActive,
        deletedAt: nextIsActive ? null : new Date(),
      });

      logger.info(`Admin ${nextIsActive ? 'activated' : 'deactivated'} template: ${id}`);
      SocketService.emitToAdmin('template:updated', template);
      SocketService.emitToAllHR('template:updated', template);
      await AdminController.notifyActiveHR({
        title: `Template ${nextIsActive ? 'active' : 'desactive'}`,
        message: `Le template ${template.titleFr} est maintenant ${nextIsActive ? 'actif' : 'inactif'}`,
        category: 'template',
        action: nextIsActive ? 'activated' : 'deactivated',
        templateId: template.id,
      });
      res.json({ message: `Template ${nextIsActive ? 'active' : 'desactive'}`, template });
    } catch (err: any) {
      logger.error('Delete template error:', err);
      res.status(500).json({ error: 'Echec du changement de statut du template' });
    }
  }

  // DELETE /api/admin/templates/:id/permanent
  static async permanentDeleteTemplate(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const prisma = (await import('../config/prisma')).default;

      const coreTemplateIds = [
        'planificateur-production', 'acheteur-strategique', 'chef-equipe-achats',
        'mecanicien-industriel', 'operateur-machines', 'technicien-electronique', 'responsable-rh'
      ];

      if (coreTemplateIds.includes(id)) {
        res.status(403).json({ error: 'Les templates de base ne peuvent pas être supprimés.' });
        return;
      }

      const existing = await TemplateRepository.findById(id);
      if (!existing) {
        res.status(404).json({ error: 'Template introuvable' });
        return;
      }

      if (existing.isActive !== false) {
        res.status(400).json({ error: 'Le template doit être désactivé avant la suppression définitive.' });
        return;
      }

      // Unlink any offers referencing this template
      await prisma.jobOffer.updateMany({ where: { templateId: id }, data: { templateId: null } });

      // Hard delete
      await prisma.offerTemplate.delete({ where: { id } });

      logger.info(`Admin permanently deleted template: ${id} (${existing.titleFr})`);
      SocketService.emitToAdmin('template:updated', { id, deleted: true });
      SocketService.emitToAllHR('template:updated', { id, deleted: true });
      res.json({ message: 'Template supprimé définitivement' });
    } catch (err: any) {
      logger.error('Permanent delete template error:', err);
      res.status(500).json({ error: 'Echec de la suppression définitive du template' });
    }
  }

  // POST /api/admin/broadcast-hr
  static async broadcastToHR(req: Request, res: Response): Promise<void> {
    try {
      const { message, site } = req.body as { message: string; site?: 'Bouarada' | 'Zaghouan' };
      const sender = req.user?.userId;

      const hrIds = await UserRepository.findActiveHRIds(site as any);
      if (hrIds.length === 0) {
        res.status(200).json({ message: 'Aucun destinataire RH actif pour cette audience', sent: 0 });
        return;
      }

      const payload = {
        title: 'Message de l\'administration',
        message,
        category: 'broadcast',
        site: site || 'all',
        sentBy: sender,
        sentAt: new Date().toISOString(),
      };

      await NotificationRepository.createManyForUsers({
        userIds: hrIds,
        type: 'info',
        payload,
      });

      hrIds.forEach((id) => {
        SocketService.emitToUser(id, 'notification:new', payload);
        SocketService.emitToUser(id, 'admin:broadcast', payload);
      });

      logger.info(`Admin broadcast sent to ${hrIds.length} HR users (site=${site || 'all'})`);
      res.status(201).json({ message: 'Diffusion envoyee', sent: hrIds.length });
    } catch (err: any) {
      logger.error('Broadcast to HR error:', err);
      res.status(500).json({ error: 'Echec de l\'envoi de la diffusion' });
    }
  }

  // GET /api/admin/overview
  static async overview(req: Request, res: Response): Promise<void> {
    try {
      const prisma = (await import('../config/prisma')).default;
      
      // Get accurate counts
      const totalCandidates = await prisma.user.count({ where: { role: 'CANDIDATE' } });
      const hrAccounts = await prisma.user.count({ where: { role: 'HR' } });
      const activeOffers = await prisma.jobOffer.count({ where: { status: 'open' } });
      const totalOffers = await prisma.jobOffer.count();
      const totalApplications = await prisma.application.count();
      
      // Current month applications
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const applicationsMonth = await prisma.application.count({ 
        where: { appliedAt: { gte: startOfMonth } } 
      });
      
      // Current week interviews
      const dayOfWeek = now.getDay();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - dayOfWeek);
      startOfWeek.setHours(0, 0, 0, 0);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 7);
      
      const interviewsWeek = await prisma.interview.count({
        where: { scheduledAt: { gte: startOfWeek, lt: endOfWeek } },
      });
      
      // Application status breakdown
      const applicationsByStatus = await prisma.application.groupBy({
        by: ['status'],
        _count: { status: true },
      });
      
      // Applications with AI analysis
      const applicationsWithAI = await prisma.application.count({
        where: { aiScore: { not: null } },
      });
      
      // Average AI score
      const avgAIScore = await prisma.application.aggregate({
        _avg: { aiScore: true },
        where: { aiScore: { not: null } },
      });
      
      // Site breakdown
      const offersBySite = await prisma.jobOffer.groupBy({
        by: ['site'],
        _count: { site: true },
      });
      
      // Recent applications with full details
      const recentApplications = await prisma.application.findMany({
        take: 20,
        orderBy: { appliedAt: 'desc' },
        include: {
          candidate: { select: { name: true, email: true } },
          offer: { select: { title: true, site: true, contractType: true } },
        },
      });

      res.json({
        // User counts
        totalCandidates,
        hrAccounts,
        
        // Offer stats
        activeOffers,
        totalOffers,
        offersBySite: offersBySite.map(o => ({ site: o.site, count: o._count.site })),
        
        // Application stats
        totalApplications,
        applicationsMonth,
        applicationsByStatus: applicationsByStatus.map(a => ({ 
          status: a.status, 
          count: a._count.status 
        })),
        
        // AI stats
        applicationsWithAI,
        averageAIScore: avgAIScore._avg.aiScore ? Math.round(avgAIScore._avg.aiScore) : null,
        
        // Interview stats
        interviewsWeek,
        
        // Recent data
        recentApplications: recentApplications.map(app => ({
          id: app.id,
          candidateName: app.candidate.name,
          candidateEmail: app.candidate.email,
          offerTitle: app.offer.title,
          offerSite: app.offer.site,
          contractType: app.offer.contractType,
          status: app.status,
          aiScore: app.aiScore,
          appliedAt: app.appliedAt,
        })),
      });
    } catch (err: any) {
      logger.error('Admin overview error:', err);
      res.status(500).json({ error: 'Echec de la recuperation de la vue d\'ensemble' });
    }
  }

  // GET /api/admin/hr-overview (HR-specific overview for their site)
  static async hrOverview(req: Request, res: Response): Promise<void> {
    try {
      const prisma = (await import('../config/prisma')).default;
      const userSite = req.user!.site;
      
      if (!userSite) {
        res.status(400).json({ error: 'L\'utilisateur RH doit etre associe a un site' });
        return;
      }
      
      // Site-specific counts
      const myActiveOffers = await prisma.jobOffer.count({ 
        where: { site: userSite as any, status: 'open' } 
      });
      const myTotalOffers = await prisma.jobOffer.count({ 
        where: { site: userSite as any } 
      });
      
      // Site-specific applications
      const myApplications = await prisma.application.count({
        where: { offer: { site: userSite as any } },
      });
      
      // Current month applications for my site
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const myApplicationsMonth = await prisma.application.count({ 
        where: { 
          appliedAt: { gte: startOfMonth },
          offer: { site: userSite as any }
        } 
      });
      
      // Application status breakdown for my site
      const myApplicationsByStatus = await prisma.application.groupBy({
        by: ['status'],
        where: { offer: { site: userSite as any } },
        _count: { status: true },
      });
      
      // Applications with AI analysis for my site
      const myApplicationsWithAI = await prisma.application.count({
        where: { 
          aiScore: { not: null },
          offer: { site: userSite as any }
        },
      });
      
      // Average AI score for my site
      const myAvgAIScore = await prisma.application.aggregate({
        _avg: { aiScore: true },
        where: { 
          aiScore: { not: null },
          offer: { site: userSite as any }
        },
      });
      
      // Current week interviews for my site
      const dayOfWeek = now.getDay();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - dayOfWeek);
      startOfWeek.setHours(0, 0, 0, 0);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 7);
      
      const myInterviewsWeek = await prisma.interview.count({
        where: { 
          scheduledAt: { gte: startOfWeek, lt: endOfWeek },
          application: { offer: { site: userSite as any } }
        },
      });
      
      // Recent applications for my site
      const myRecentApplications = await prisma.application.findMany({
        take: 20,
        where: { offer: { site: userSite as any } },
        orderBy: { appliedAt: 'desc' },
        include: {
          candidate: { select: { name: true, email: true, phone: true } },
          offer: { select: { title: true, contractType: true, department: true } },
        },
      });

      res.json({
        site: userSite,
        
        // Offer stats
        activeOffers: myActiveOffers,
        totalOffers: myTotalOffers,
        
        // Application stats
        totalApplications: myApplications,
        applicationsMonth: myApplicationsMonth,
        applicationsByStatus: myApplicationsByStatus.map(a => ({ 
          status: a.status, 
          count: a._count.status 
        })),
        
        // AI stats
        applicationsWithAI: myApplicationsWithAI,
        averageAIScore: myAvgAIScore._avg.aiScore ? Math.round(myAvgAIScore._avg.aiScore) : null,
        
        // Interview stats
        interviewsWeek: myInterviewsWeek,
        
        // Recent data
        recentApplications: myRecentApplications.map(app => ({
          id: app.id,
          candidateName: app.candidate.name,
          candidateEmail: app.candidate.email,
          candidatePhone: app.candidate.phone,
          offerTitle: app.offer.title,
          contractType: app.offer.contractType,
          department: app.offer.department,
          status: app.status,
          aiScore: app.aiScore,
          appliedAt: app.appliedAt,
        })),
      });
    } catch (err: any) {
      logger.error('HR overview error:', err);
      res.status(500).json({ error: 'Echec de la recuperation de la vue d\'ensemble RH' });
    }
  }
}
