import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserSettings(userId: string) {
    let settings = await this.prisma.settings.findUnique({
      where: { userId },
    });

    // Create default settings if they don't exist
    if (!settings) {
      settings = await this.prisma.settings.create({
        data: {
          userId,
          timezone: 'America/Sao_Paulo',
          language: 'pt-BR',
          currency: 'BRL',
          dateFormat: 'DD/MM/YYYY',
          notifications: {
            email: true,
            push: true,
            newLeads: true,
            leadUpdates: true,
            dailyReport: false,
            weeklyReport: true,
          },
          preferences: {
            theme: 'light',
            leadsPerPage: 10,
            defaultView: 'list',
            autoAssignLeads: false,
          },
        },
      });
    }

    return settings;
  }

  async updateUserSettings(userId: string, updateSettingsDto: UpdateSettingsDto) {
    // Check if settings exist
    const existingSettings = await this.getUserSettings(userId);

    // Safely merge preferences and notifications
    const currentPreferences = existingSettings.preferences as any || {};
    const currentNotifications = existingSettings.notifications as any || {};
    
    const updatedPreferences = {
      ...currentPreferences,
      ...(updateSettingsDto.preferences || {}),
    };

    const updatedNotifications = {
      ...currentNotifications,
      ...(updateSettingsDto.notifications || {}),
    };

    const updatedSettings = await this.prisma.settings.update({
      where: { userId },
      data: {
        ...updateSettingsDto,
        preferences: updatedPreferences,
        notifications: updatedNotifications,
      },
    });

    return updatedSettings;
  }

  async deleteUserSettings(userId: string) {
    const settings = await this.prisma.settings.findUnique({
      where: { userId },
    });

    if (!settings) {
      throw new NotFoundException('Settings not found');
    }

    await this.prisma.settings.delete({
      where: { userId },
    });

    return { message: 'Settings deleted successfully' };
  }

  async getSystemDefaults() {
    return {
      timezone: 'America/Sao_Paulo',
      language: 'pt-BR',
      currency: 'BRL',
      dateFormat: 'DD/MM/YYYY',
      notifications: {
        email: true,
        push: true,
        newLeads: true,
        leadUpdates: true,
        dailyReport: false,
        weeklyReport: true,
      },
      preferences: {
        theme: 'light',
        leadsPerPage: 10,
        defaultView: 'list',
        autoAssignLeads: false,
      },
    };
  }
}
