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
      res.status(500).json({ error: 'Failed to fetch HR accounts' });
    }
  }

  // POST /api/admin/hr-accounts
  static async createHRAccount(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password, phone, site } = req.body;
      const normalizedEmail = String(email).trim().toLowerCase();

      const existing = await UserRepository.findByEmail(normalizedEmail);
      if (existing) {
        res.status(409).json({ error: 'Email already in use' });
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
          res.status(400).json({ error: 'Invalid site. Must be Bouarada or Zaghouan' });
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
      res.status(500).json({ error: 'Failed to create HR account' });
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
          res.status(409).json({ error: 'Email already in use' });
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
          res.status(400).json({ error: 'Invalid site. Must be Bouarada or Zaghouan' });
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
      res.status(500).json({ error: 'Failed to update HR account' });
    }
  }

  // DELETE /api/admin/hr-accounts/:id
  static async deleteHRAccount(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;

      if (id === req.user!.userId) {
        res.status(400).json({ error: 'You cannot deactivate your own account.' });
        return;
      }

      const target = await UserRepository.findById(id);
      if (!target || target.role !== 'HR') {
        res.status(404).json({ error: 'HR account not found' });
        return;
      }

      if (target.isActive === false || target.deletedAt) {
        res.status(400).json({ error: 'Account is already deactivated' });
        return;
      }

      await UserRepository.deleteAllRefreshTokens(id);

      const updates: Record<string, any> = {
        isActive: false,
        deletedAt: new Date(),
      };

      if (target.email && !target.email.startsWith('deleted_')) {
        updates.email = `deleted_${id}@removed.local`;
      }

      await UserRepository.update(id, updates); // soft-delete approach
      logger.info(`Admin deactivated HR account: ${id}`);
      SocketService.emitToAdmin('admin:hr-account:changed', { action: 'deleted', userId: id });
      SocketService.emitToAdmin('admin:overview:updated', { reason: 'hr-account-deleted' });
      res.json({ message: 'HR account deactivated' });
    } catch (err: any) {
      logger.error('Delete HR account error:', err);
      res.status(500).json({ error: 'Failed to deactivate HR account' });
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
      res.status(500).json({ error: 'Failed to fetch templates' });
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
        title: 'Template added',
        message: `A new template was added: ${template.titleFr}`,
        category: 'template',
        action: 'created',
        templateId: template.id,
      });
      res.status(201).json(template);
    } catch (err: any) {
      logger.error('Create template error:', err);
      res.status(500).json({ error: err?.message || 'Failed to create template' });
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
        title: 'Template updated',
        message: `Template updated: ${template.titleFr}`,
        category: 'template',
        action: 'updated',
        templateId: template.id,
      });
      res.json(template);
    } catch (err: any) {
      logger.error('Update template error:', err);
      if (err?.code === 'P2025') {
        res.status(404).json({ error: 'Template not found' });
        return;
      }
      res.status(500).json({ error: err?.message || 'Failed to update template' });
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
          error: 'Cannot deactivate core template. Core templates are protected and must always be available.' 
        });
        return;
      }

      const existing = await TemplateRepository.findById(id);
      if (!existing) {
        res.status(404).json({ error: 'Template not found' });
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
        title: `Template ${nextIsActive ? 'activated' : 'deactivated'}`,
        message: `Template ${template.titleFr} is now ${nextIsActive ? 'active' : 'inactive'}`,
        category: 'template',
        action: nextIsActive ? 'activated' : 'deactivated',
        templateId: template.id,
      });
      res.json({ message: `Template ${nextIsActive ? 'activated' : 'deactivated'}`, template });
    } catch (err: any) {
      logger.error('Delete template error:', err);
      res.status(500).json({ error: 'Failed to change template status' });
    }
  }

  // POST /api/admin/broadcast-hr
  static async broadcastToHR(req: Request, res: Response): Promise<void> {
    try {
      const { message, site } = req.body as { message: string; site?: 'Bouarada' | 'Zaghouan' };
      const sender = req.user?.userId;

      const hrIds = await UserRepository.findActiveHRIds(site as any);
      if (hrIds.length === 0) {
        res.status(200).json({ message: 'No active HR recipients for this audience', sent: 0 });
        return;
      }

      const payload = {
        title: 'Message from Admin',
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
      res.status(201).json({ message: 'Broadcast sent', sent: hrIds.length });
    } catch (err: any) {
      logger.error('Broadcast to HR error:', err);
      res.status(500).json({ error: 'Failed to send broadcast' });
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
      res.status(500).json({ error: 'Failed to fetch overview' });
    }
  }

  // GET /api/admin/hr-overview (HR-specific overview for their site)
  static async hrOverview(req: Request, res: Response): Promise<void> {
    try {
      const prisma = (await import('../config/prisma')).default;
      const userSite = req.user!.site;
      
      if (!userSite) {
        res.status(400).json({ error: 'HR user must have a site assigned' });
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
      res.status(500).json({ error: 'Failed to fetch HR overview' });
    }
  }
}
