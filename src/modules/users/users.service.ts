import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const user = await this.prisma.user.create({
        data: createUserDto,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          avatar: true,
          phone: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return user;
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException('User with this email already exists');
      }
      throw error;
    }
  }

  async findAll(page = 1, limit = 10, search?: string) {
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          avatar: true,
          phone: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              assignedLeads: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        phone: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        password: true, // Include for auth validation
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        phone: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        password: true, // Include for auth validation
      },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.findById(id);

    try {
      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: updateUserDto,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          avatar: true,
          phone: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return updatedUser;
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException('Email already in use');
      }
      throw error;
    }
  }

  async getAgentPerformance(agentId: string) {
    const agent = await this.findById(agentId);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [leads, interactions, conversions] = await Promise.all([
      this.prisma.lead.count({
        where: {
          assignedAgentId: agentId,
          createdAt: {
            gte: startOfMonth,
          },
        },
      }),
      this.prisma.interaction.count({
        where: {
          userId: agentId,
          createdAt: {
            gte: startOfMonth,
          },
        },
      }),
      this.prisma.lead.count({
        where: {
          assignedAgentId: agentId,
          status: 'CLOSED_WON',
          updatedAt: {
            gte: startOfMonth,
          },
        },
      }),
    ]);

    const revenue = await this.prisma.lead.aggregate({
      where: {
        assignedAgentId: agentId,
        status: 'CLOSED_WON',
        updatedAt: {
          gte: startOfMonth,
        },
      },
      _sum: {
        value: true,
      },
    });

    return {
      agent: {
        id: agent.id,
        name: agent.name,
        email: agent.email,
      },
      performance: {
        leadsAssigned: leads,
        interactions: interactions,
        conversions: conversions,
        revenue: revenue._sum.value || 0,
        conversionRate: leads > 0 ? (conversions / leads) * 100 : 0,
      },
    };
  }

  async remove(id: string) {
    await this.findById(id);

    await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    return { message: 'User deactivated successfully' };
  }
}
