import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { UserRepository } from '../repositories/user.repository';
import { TemplateRepository } from '../repositories/template.repository';
import { SocketService } from '../services/socket.service';
import logger from '../utils/logger';

export class AdminController {
  // ============ HR ACCOUNT MANAGEMENT ============

  // GET /api/admin/hr-accounts
  static async getHRAccounts(req: Request, res: Response): Promise<void> {
    try {
      const accounts = await UserRepository.findAllByRole('HR');
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

      const existing = await UserRepository.findByEmail(email);
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
        email,
        passwordHash,
        role: 'HR',
        name,
        phone,
        site: normalizedSite as any,
      });

      logger.info(`Admin created HR account: ${user.email} for site ${normalizedSite}`);

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

      if (req.body.name) updates.name = req.body.name;
      if (req.body.phone) updates.phone = req.body.phone;
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
      await UserRepository.deleteAllRefreshTokens(id);
      await UserRepository.update(id, { email: `deleted_${id}@removed.local` }); // soft-delete approach
      logger.info(`Admin deactivated HR account: ${id}`);
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
      const templates = await TemplateRepository.findAll();
      res.json(templates);
    } catch (err: any) {
      logger.error('Get templates error:', err);
      res.status(500).json({ error: 'Failed to fetch templates' });
    }
  }

  // POST /api/admin/templates
  static async createTemplate(req: Request, res: Response): Promise<void> {
    try {
      const template = await TemplateRepository.create({
        ...req.body,
        createdById: req.user!.userId,
      });
      logger.info(`Admin created template: ${template.titleFr}`);
      SocketService.emitToAllHR('template:updated', template);
      res.status(201).json(template);
    } catch (err: any) {
      logger.error('Create template error:', err);
      res.status(500).json({ error: 'Failed to create template' });
    }
  }

  // PATCH /api/admin/templates/:id
  static async updateTemplate(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const template = await TemplateRepository.update(id, req.body);
      logger.info(`Admin updated template: ${template.titleFr}`);
      SocketService.emitToAllHR('template:updated', template);
      res.json(template);
    } catch (err: any) {
      logger.error('Update template error:', err);
      res.status(500).json({ error: 'Failed to update template' });
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
          error: 'Cannot delete core template. Core templates are protected and must always be available.' 
        });
        return;
      }
      
      await TemplateRepository.delete(id);
      logger.info(`Admin deleted template: ${id}`);
      SocketService.emitToAllHR('template:updated', { id });
      res.json({ message: 'Template deleted' });
    } catch (err: any) {
      logger.error('Delete template error:', err);
      res.status(500).json({ error: 'Failed to delete template' });
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
