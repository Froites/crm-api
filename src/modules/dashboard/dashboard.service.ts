import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getMetrics(userRole: string, userId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Base where condition for role-based filtering
    const whereBase: any = {};
    if (userRole === 'AGENT') {
      whereBase.assignedAgentId = userId;
    }

    // Current month metrics
    const [
      totalLeads,
      newLeads,
      qualifiedLeads,
      closedWonLeads,
      totalRevenue,
      averageDealSize,
    ] = await Promise.all([
      // Total leads (all time)
      this.prisma.lead.count({
        where: whereBase,
      }),

      // New leads this month
      this.prisma.lead.count({
        where: {
          ...whereBase,
          createdAt: {
            gte: startOfMonth,
          },
        },
      }),

      // Qualified leads this month
      this.prisma.lead.count({
        where: {
          ...whereBase,
          status: {
            in: ['QUALIFIED', 'PROPOSAL', 'NEGOTIATION'],
          },
          updatedAt: {
            gte: startOfMonth,
          },
        },
      }),

      // Closed won this month
      this.prisma.lead.count({
        where: {
          ...whereBase,
          status: 'CLOSED_WON',
          updatedAt: {
            gte: startOfMonth,
          },
        },
      }),

      // Total revenue this month
      this.prisma.lead.aggregate({
        where: {
          ...whereBase,
          status: 'CLOSED_WON',
          updatedAt: {
            gte: startOfMonth,
          },
        },
        _sum: {
          value: true,
        },
      }),

      // Average deal size this month
      this.prisma.lead.aggregate({
        where: {
          ...whereBase,
          status: 'CLOSED_WON',
          updatedAt: {
            gte: startOfMonth,
          },
        },
        _avg: {
          value: true,
        },
      }),
    ]);

    // Last month metrics for comparison
    const [lastMonthNewLeads, lastMonthRevenue, lastMonthClosedWon] = await Promise.all([
      this.prisma.lead.count({
        where: {
          ...whereBase,
          createdAt: {
            gte: startOfLastMonth,
            lte: endOfLastMonth,
          },
        },
      }),

      this.prisma.lead.aggregate({
        where: {
          ...whereBase,
          status: 'CLOSED_WON',
          updatedAt: {
            gte: startOfLastMonth,
            lte: endOfLastMonth,
          },
        },
        _sum: {
          value: true,
        },
      }),

      this.prisma.lead.count({
        where: {
          ...whereBase,
          status: 'CLOSED_WON',
          updatedAt: {
            gte: startOfLastMonth,
            lte: endOfLastMonth,
          },
        },
      }),
    ]);

    // Calculate conversion rate
    const conversionRate = newLeads > 0 ? (closedWonLeads / newLeads) * 100 : 0;

    // Calculate growth percentages
    const newLeadsGrowth = lastMonthNewLeads > 0 
      ? ((newLeads - lastMonthNewLeads) / lastMonthNewLeads) * 100 
      : 0;

    const revenueGrowth = (lastMonthRevenue._sum.value || 0) > 0 
      ? (((totalRevenue._sum.value || 0) - (lastMonthRevenue._sum.value || 0)) / (lastMonthRevenue._sum.value || 0)) * 100 
      : 0;

    const conversionGrowth = lastMonthClosedWon > 0 
      ? ((closedWonLeads - lastMonthClosedWon) / lastMonthClosedWon) * 100 
      : 0;

    return {
      totalLeads,
      newLeads,
      qualifiedLeads,
      closedWonLeads,
      totalRevenue: totalRevenue._sum.value || 0,
      averageDealSize: averageDealSize._avg.value || 0,
      conversionRate,
      growth: {
        newLeads: newLeadsGrowth,
        revenue: revenueGrowth,
        conversions: conversionGrowth,
      },
    };
  }

  async getAgentsPerformance(userRole: string, userId: string) {
    // Only ADMIN and MANAGER can see all agents performance
    if (userRole === 'AGENT') {
      return [];
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const agents = await this.prisma.user.findMany({
      where: {
        role: 'AGENT',
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
      },
    });

    const performance = await Promise.all(
      agents.map(async (agent) => {
        const [leadsCount, conversions, revenue, interactions] = await Promise.all([
          this.prisma.lead.count({
            where: {
              assignedAgentId: agent.id,
              createdAt: {
                gte: startOfMonth,
              },
            },
          }),

          this.prisma.lead.count({
            where: {
              assignedAgentId: agent.id,
              status: 'CLOSED_WON',
              updatedAt: {
                gte: startOfMonth,
              },
            },
          }),

          this.prisma.lead.aggregate({
            where: {
              assignedAgentId: agent.id,
              status: 'CLOSED_WON',
              updatedAt: {
                gte: startOfMonth,
              },
            },
            _sum: {
              value: true,
            },
          }),

          this.prisma.interaction.count({
            where: {
              userId: agent.id,
              createdAt: {
                gte: startOfMonth,
              },
            },
          }),
        ]);

        const conversionRate = leadsCount > 0 ? (conversions / leadsCount) * 100 : 0;

        return {
          agent,
          metrics: {
            leadsAssigned: leadsCount,
            conversions,
            revenue: revenue._sum.value || 0,
            interactions,
            conversionRate,
          },
        };
      }),
    );

    // Sort by revenue descending
    return performance.sort((a, b) => b.metrics.revenue - a.metrics.revenue);
  }

  async getRecentActivity(userRole: string, userId: string) {
    const whereBase: any = {};
    if (userRole === 'AGENT') {
      whereBase.userId = userId;
    }

    const recentInteractions = await this.prisma.interaction.findMany({
      where: whereBase,
      take: 10,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        lead: {
          select: {
            id: true,
            name: true,
            company: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return recentInteractions;
  }

  async getLeadsByStatus(userRole: string, userId: string) {
    const whereBase: any = {};
    if (userRole === 'AGENT') {
      whereBase.assignedAgentId = userId;
    }

    const leadsByStatus = await this.prisma.lead.groupBy({
      by: ['status'],
      where: whereBase,
      _count: {
        status: true,
      },
    });

    return leadsByStatus.reduce((acc, item) => {
      acc[item.status] = item._count.status;
      return acc;
    }, {});
  }

  async getLeadsBySource(userRole: string, userId: string) {
    const whereBase: any = {};
    if (userRole === 'AGENT') {
      whereBase.assignedAgentId = userId;
    }

    const leadsBySource = await this.prisma.lead.groupBy({
      by: ['source'],
      where: whereBase,
      _count: {
        source: true,
      },
    });

    return leadsBySource.reduce((acc, item) => {
      acc[item.source] = item._count.source;
      return acc;
    }, {});
  }

  async getRevenueChart(userRole: string, userId: string) {
    const whereBase: any = {};
    if (userRole === 'AGENT') {
      whereBase.assignedAgentId = userId;
    }

    const now = new Date();
    const last6Months = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const revenueData = await this.prisma.lead.findMany({
      where: {
        ...whereBase,
        status: 'CLOSED_WON',
        updatedAt: {
          gte: last6Months,
        },
      },
      select: {
        value: true,
        updatedAt: true,
      },
    });

    // Group by month
    const monthlyRevenue = {};
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toISOString().slice(0, 7); // YYYY-MM format
      monthlyRevenue[monthKey] = 0;
    }

    revenueData.forEach((lead) => {
      const monthKey = lead.updatedAt.toISOString().slice(0, 7);
      if (monthlyRevenue.hasOwnProperty(monthKey)) {
        monthlyRevenue[monthKey] += lead.value;
      }
    });

    return Object.entries(monthlyRevenue).map(([month, revenue]) => ({
      month,
      revenue,
    }));
  }
}