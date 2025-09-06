import { PrismaClient, LeadStatus, LeadSource, Priority, Role, InteractionType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@crm.com' },
    update: {},
    create: {
      email: 'admin@crm.com',
      name: 'Administrator',
      password: adminPassword,
      role: Role.ADMIN,
      phone: '+55 11 99999-0001',
      isActive: true,
    },
  });

  // Create agent user
  const agentPassword = await bcrypt.hash('agent123', 12);
  const agent1 = await prisma.user.upsert({
    where: { email: 'agent1@crm.com' },
    update: {},
    create: {
      email: 'agent1@crm.com',
      name: 'João Silva',
      password: agentPassword,
      role: Role.AGENT,
      phone: '+55 11 99999-0003',
      isActive: true,
    },
  });

  console.log('👥 Users created successfully');

  // Create leads
  const lead1 = await prisma.lead.upsert({
    where: { email: 'carlos@empresa1.com' },
    update: {},
    create: {
      name: 'Carlos Oliveira',
      email: 'carlos@empresa1.com',
      phone: '+55 11 98888-1111',
      company: 'Tech Solutions Ltda',
      position: 'CTO',
      status: LeadStatus.NEW,
      source: LeadSource.WEBSITE,
      value: 50000,
      priority: Priority.HIGH,
      description: 'Interessado em soluções de automação',
      tags: ['tech', 'automation'],
      assignedAgentId: agent1.id,
      createdById: admin.id,
    },
  });

  const lead2 = await prisma.lead.upsert({
    where: { email: 'ana@empresa2.com' },
    update: {},
    create: {
      name: 'Ana Ferreira',
      email: 'ana@empresa2.com',
      phone: '+55 11 98888-2222',
      company: 'Marketing Plus',
      position: 'Diretora',
      status: LeadStatus.CONTACTED,
      source: LeadSource.SOCIAL_MEDIA,
      value: 75000,
      priority: Priority.MEDIUM,
      description: 'Busca consultoria em marketing digital',
      tags: ['marketing', 'digital'],
      assignedAgentId: agent1.id,
      createdById: admin.id,
    },
  });

  console.log('🎯 Leads created successfully');

  console.log('✅ Database seeded successfully!');
  console.log('\n📋 Login credentials:');
  console.log('Admin: admin@crm.com / admin123');
  console.log('Agent: agent1@crm.com / agent123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
