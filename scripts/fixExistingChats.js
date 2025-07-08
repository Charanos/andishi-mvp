const { PrismaClient } = require('@prisma/client');
const { MongoClient, ObjectId } = require('mongodb');

const prisma = new PrismaClient();
const mongoUri = process.env.DATABASE_URL;

if (!mongoUri) {
  console.error('DATABASE_URL environment variable is not defined.');
  process.exit(1);
}

async function main() {
  const mongoClient = new MongoClient(mongoUri);
  await mongoClient.connect();
  const db = mongoClient.db();
  const projectsCollection = db.collection('projects');

  const allProjects = await projectsCollection.find({}).toArray();
  const admin = await prisma.user.findFirst({ where: { role: 'admin' } });

  if (!admin) {
    console.error('No admin user found. Please create an admin user first.');
    return;
  }

  for (const project of allProjects) {
    const existingChat = await prisma.projectChat.findFirst({
      where: { projectId: project._id.toString() },
    });

    if (!existingChat) {
      console.log(`Creating chat for project: ${project.projectDetails.title}`);

      const projectChat = await prisma.projectChat.create({
        data: {
          projectId: project._id.toString(),
          lastActivity: new Date(),
        },
      });

      // Add client as participant
      await prisma.chatParticipant.create({
        data: {
          chatId: projectChat.id,
          userId: project.clientId,
          name: `${project.userInfo.firstName} ${project.userInfo.lastName}`,
          role: 'client',
          isOnline: false,
        },
      });

      // Add admin as participant
      await prisma.chatParticipant.create({
        data: {
          chatId: projectChat.id,
          userId: admin.id,
          name: admin.firstName || 'Admin',
          role: 'admin',
          isOnline: false,
        },
      });

      console.log(`Chat created for project: ${project.projectDetails.title}`);
    } else {
      console.log(`Chat already exists for project: ${project.projectDetails.title}`);
    }
  }

  await mongoClient.close();
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
