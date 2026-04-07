import { Request, Response } from 'express';
import { OfferRepository } from '../repositories/offer.repository';
import { NotificationRepository } from '../repositories/notification.repository';
import { UserRepository } from '../repositories/user.repository';
import { SocketService } from '../services/socket.service';
import logger from '../utils/logger';

export class OffersController {
  private static async notifyUsers(userIds: string[], payload: any, type: string = 'info'): Promise<void> {
    await NotificationRepository.createManyForUsers({
      userIds,
      type,
      payload,
    });
    userIds.forEach((id) => {
      SocketService.emitToUser(id, 'notification:new', payload);
    });
  }

  // GET /api/offers (public — candidates can browse)
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { site, status } = req.query;
      const offers = await OfferRepository.findAll({
        site: site as any,
        status: (status as any) || 'open',
      });
      res.json(offers);
    } catch (err: any) {
      logger.error('Get offers error:', err);
      res.status(500).json({ error: 'Failed to fetch offers' });
    }
  }

  // GET /api/offers/hr/my-offers (HR only - filtered by HR user's site)
  static async getMyOffers(req: Request, res: Response): Promise<void> {
    try {
      const userSite = req.user!.site;
      if (!userSite) {
        res.status(400).json({ error: 'HR user must have a site assigned' });
        return;
      }

      const prisma = (await import('../config/prisma')).default;
      
      // Get offers with application counts and AI stats
      const offers = await prisma.jobOffer.findMany({
        where: { site: userSite as any },
        include: {
          _count: {
            select: { applications: true }
          },
          applications: {
            select: {
              id: true,
              status: true,
              aiScore: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' },
      });
      
      // Enhance offers with detailed stats
      const enhancedOffers = offers.map(offer => {
        const apps = offer.applications;
        const totalApps = apps.length;
        const appsWithAI = apps.filter(a => a.aiScore !== null).length;
        const avgAIScore = appsWithAI > 0 
          ? Math.round(apps.reduce((sum, a) => sum + (a.aiScore || 0), 0) / appsWithAI)
          : null;
        
        const statusCounts = {
          reviewing: apps.filter(a => a.status === 'reviewing').length,
          interview: apps.filter(a => a.status === 'interview').length,
          accepted: apps.filter(a => a.status === 'accepted').length,
          rejected: apps.filter(a => a.status === 'rejected').length,
        };
        
        return {
          id: offer.id,
          title: offer.title,
          site: offer.site,
          contractType: offer.contractType,
          department: offer.department,
          description: offer.description,
          requiredSkills: offer.requiredSkills,
          experienceYears: offer.experienceYears,
          salaryRange: offer.salaryRange,
          showSalary: offer.showSalary,
          seats: offer.seats,
          status: offer.status,
          deadline: offer.deadline,
          createdAt: offer.createdAt,
          updatedAt: offer.updatedAt,
          // Enhanced stats
          _count: {
            applications: totalApps
          },
          stats: {
            totalApplications: totalApps,
            applicationsWithAI: appsWithAI,
            averageAIScore: avgAIScore,
            statusBreakdown: statusCounts,
          }
        };
      });
      
      logger.info(`HR ${req.user!.userId} fetched ${enhancedOffers.length} offers for site ${userSite} with stats`);
      res.json(enhancedOffers);
    } catch (err: any) {
      logger.error('Get HR offers error:', err);
      res.status(500).json({ error: 'Failed to fetch HR offers' });
    }
  }

  // GET /api/offers/:id
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const prisma = (await import('../config/prisma')).default;
      
      const offer = await prisma.jobOffer.findUnique({
        where: { id: req.params.id as string },
        include: {
          _count: { select: { applications: true } },
          applications: {
            select: {
              id: true,
              status: true,
              aiScore: true,
              appliedAt: true,
            }
          }
        },
      });
      
      if (!offer) {
        res.status(404).json({ error: 'Offer not found' });
        return;
      }
      
      // Calculate stats
      const apps = offer.applications;
      const appsWithAI = apps.filter(a => a.aiScore !== null).length;
      const avgAIScore = appsWithAI > 0 
        ? Math.round(apps.reduce((sum, a) => sum + (a.aiScore || 0), 0) / appsWithAI)
        : null;
      
      const statusCounts = {
        reviewing: apps.filter(a => a.status === 'reviewing').length,
        interview: apps.filter(a => a.status === 'interview').length,
        accepted: apps.filter(a => a.status === 'accepted').length,
        rejected: apps.filter(a => a.status === 'rejected').length,
      };
      
      res.json({
        ...offer,
        stats: {
          totalApplications: apps.length,
          applicationsWithAI: appsWithAI,
          averageAIScore: avgAIScore,
          statusBreakdown: statusCounts,
        }
      });
    } catch (err: any) {
      logger.error('Get offer error:', err);
      res.status(500).json({ error: 'Failed to fetch offer' });
    }
  }

  // POST /api/offers (HR only)
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const { 
        title, 
        site, 
        contractType, 
        department, 
        description, 
        requiredSkills, 
        seats, 
        deadline,
        templateId,
        experienceYears,
        salaryRange,
        showSalary
      } = req.body;

      if (req.user?.role === 'HR' && !templateId) {
        res.status(400).json({ error: 'HR must create offers from an active template.' });
        return;
      }

      if (templateId) {
        const prisma = (await import('../config/prisma')).default;
        const template = await prisma.offerTemplate.findUnique({ where: { id: templateId as string } });
        if (!template || !template.isActive || !!template.deletedAt) {
          res.status(400).json({ error: 'Selected template is invalid or inactive.' });
          return;
        }
      }
      
      const offer = await OfferRepository.create({
        title,
        site: site || req.user!.site,
        contractType,
        department,
        description,
        requiredSkills: requiredSkills || [],
        seats: seats || 1,
        deadline: new Date(deadline),
        createdById: req.user!.userId,
        templateId,
        experienceYears: experienceYears || 0,
        salaryRange,
        showSalary: showSalary ?? true,
      });
      
      logger.info(`HR created offer: ${offer.title} (${offer.site})`);

      if (offer.status === 'open') {
        SocketService.emitToAllCandidates('offer:new', offer);
      }
      SocketService.emitToAdmin('admin:overview:updated', { reason: 'offer-created', offerId: offer.id });

      const adminIds = await UserRepository.findActiveAdminIds();
      await OffersController.notifyUsers(adminIds, {
        title: 'New offer published',
        message: `${offer.title} was created for ${offer.site}`,
        category: 'offer',
        action: 'created',
        offerId: offer.id,
        site: offer.site,
      });

      const hrIds = await UserRepository.findActiveHRIds(offer.site as any, req.user!.userId);
      await OffersController.notifyUsers(hrIds, {
        title: 'Offer published',
        message: `${offer.title} is now available in your site offers`,
        category: 'offer',
        action: 'created',
        offerId: offer.id,
        site: offer.site,
      });

      res.status(201).json(offer);
    } catch (err: any) {
      logger.error('Create offer error:', err);
      res.status(500).json({ error: 'Failed to create offer' });
    }
  }

  // PATCH /api/offers/:id (HR only)
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const offer = await OfferRepository.update(req.params.id as string, req.body);
      logger.info(`HR updated offer: ${offer.title}`);

      if (req.body.status === 'closed') {
        SocketService.emitToAllCandidates('offer:closed', { id: offer.id });
      } else if (req.body.status === 'open') {
        // Technically an offer:new or offer:updated depending on context, we'll emit new to make it appear
        SocketService.emitToAllCandidates('offer:new', offer);
      }

      SocketService.emitToAdmin('admin:overview:updated', { reason: 'offer-updated', offerId: offer.id });

      const adminIds = await UserRepository.findActiveAdminIds();
      await OffersController.notifyUsers(adminIds, {
        title: 'Offer updated',
        message: `${offer.title} was updated (${offer.status})`,
        category: 'offer',
        action: 'updated',
        offerId: offer.id,
        site: offer.site,
      });

      const hrIds = await UserRepository.findActiveHRIds(offer.site as any, req.user!.userId);
      await OffersController.notifyUsers(hrIds, {
        title: 'Offer updated',
        message: `${offer.title} changed status to ${offer.status}`,
        category: 'offer',
        action: 'updated',
        offerId: offer.id,
        site: offer.site,
      });

      res.json(offer);
    } catch (err: any) {
      logger.error('Update offer error:', err);
      res.status(500).json({ error: 'Failed to update offer' });
    }
  }

  // DELETE /api/offers/:id (HR only)
  static async remove(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const existing = await OfferRepository.findById(id);
      await OfferRepository.delete(id);
      logger.info(`HR deleted offer: ${id}`);
      
      SocketService.emitToAllCandidates('offer:closed', { id });
      SocketService.emitToAdmin('admin:overview:updated', { reason: 'offer-deleted', offerId: id });

      const adminIds = await UserRepository.findActiveAdminIds();
      await OffersController.notifyUsers(adminIds, {
        title: 'Offer deleted',
        message: `Offer ${id} was deleted`,
        category: 'offer',
        action: 'deleted',
        offerId: id,
      }, 'warning');

      if (existing?.site) {
        const hrIds = await UserRepository.findActiveHRIds(existing.site as any, req.user!.userId);
        await OffersController.notifyUsers(hrIds, {
          title: 'Offer deleted',
          message: `${existing.title} was removed from ${existing.site}`,
          category: 'offer',
          action: 'deleted',
          offerId: id,
          site: existing.site,
        }, 'warning');
      }

      res.json({ message: 'Offer deleted' });
    } catch (err: any) {
      logger.error('Delete offer error:', err);
      res.status(500).json({ error: 'Failed to delete offer' });
    }
  }
}
