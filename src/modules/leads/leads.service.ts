import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LeadFilters } from '../../common/types/api-response.type';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { UpdateLeadStatusDto } from './dto/update-lead-status.dto';

@Injectable()
export class LeadsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createLeadDto: CreateLeadDto, userId: string) {
    const lead = await this.prisma.lead.create({
      data: {
        ...createLeadDto,
        createdById: userId,
        assignedAgentId: createLeadDto.assignedAgentId || userId,
      },
      include: {
        assignedAgent: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return lead;
  }

  async findAll(filters: LeadFilters, userRole: string, userId: string) {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      source,
      assignedAgent,
      priority,
      dateFrom,
      dateTo,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filters;

    const skip = (page - 1) * limit;

    // Build where conditions
    const where: any = {};

    // Role-based filtering
    if (userRole === 'AGENT') {
      where.assignedAgentId = userId;
    } else if (assignedAgent) {
      where.assignedAgentId = assignedAgent;
    }

    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Status filter
    if (status) {
      where.status = status;
    }

    // Source filter
    if (source) {
      where.source = source;
    }

    // Priority filter
    if (priority) {
      where.priority = priority;
    }

    // Date range filter
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.createdAt.lte = new Date(dateTo);
      }
    }

    const [leads, total] = await Promise.all([
      this.prisma.lead.findMany({
        where,
        skip,
        take: limit,
        include: {
          assignedAgent: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          _count: {
            select: {
              interactions: true,
            },
          },
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
      }),
      this.prisma.lead.count({ where }),
    ]);

    return {
      data: leads,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, userRole: string, userId: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id },
      include: {
        assignedAgent: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        interactions: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    // Check permissions
    if (userRole === 'AGENT' && lead.assignedAgentId !== userId) {
      throw new ForbiddenException('You can only access your assigned leads');
    }

    return lead;
  }

  async update(id: string, updateLeadDto: UpdateLeadDto, userRole: string, userId: string) {
    const lead = await this.findOne(id, userRole, userId);

    const updatedLead = await this.prisma.lead.update({
      where: { id },
      data: updateLeadDto,
      include: {
        assignedAgent: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return updatedLead;
  }

  async updateStatus(id: string, updateStatusDto: UpdateLeadStatusDto, userRole: string, userId: string) {
    const lead = await this.findOne(id, userRole, userId);

    const updatedLead = await this.prisma.lead.update({
      where: { id },
      data: {
        status: updateStatusDto.status,
        ...(updateStatusDto.notes && { notes: updateStatusDto.notes }),
      },
      include: {
        assignedAgent: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Create interaction for status change
    await this.prisma.interaction.create({
      data: {
        type: 'NOTE',
        subject: `Status changed to ${updateStatusDto.status}`,
        description: updateStatusDto.notes || `Lead status updated to ${updateStatusDto.status}`,
        leadId: id,
        userId,
      },
    });

    return updatedLead;
  }

  async remove(id: string, userRole: string, userId: string) {
    await this.findOne(id, userRole, userId);

    // Only ADMIN can permanently delete leads
    if (userRole !== 'ADMIN') {
      // Archive instead of delete
      await this.prisma.lead.update({
        where: { id },
        data: { status: 'ARCHIVED' },
      });
      return { message: 'Lead archived successfully' };
    }

    await this.prisma.lead.delete({
      where: { id },
    });

    return { message: 'Lead deleted successfully' };
  }

  async getLeadStats(userRole: string, userId: string) {
    const where: any = {};
    
    if (userRole === 'AGENT') {
      where.assignedAgentId = userId;
    }

    const [total, byStatus, bySource, recentLeads] = await Promise.all([
      this.prisma.lead.count({ where }),
      this.prisma.lead.groupBy({
        by: ['status'],
        where,
        _count: {
          status: true,
        },
      }),
      this.prisma.lead.groupBy({
        by: ['source'],
        where,
        _count: {
          source: true,
        },
      }),
      this.prisma.lead.findMany({
        where,
        take: 5,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          assignedAgent: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
    ]);

    const revenue = await this.prisma.lead.aggregate({
      where: {
        ...where,
        status: 'CLOSED_WON',
      },
      _sum: {
        value: true,
      },
    });

    return {
      total,
      revenue: revenue._sum.value || 0,
      byStatus: byStatus.reduce((acc, item) => {
        acc[item.status] = item._count.status;
        return acc;
      }, {}),
      bySource: bySource.reduce((acc, item) => {
        acc[item.source] = item._count.source;
        return acc;
      }, {}),
      recentLeads,
    };
  };
}