import prisma from './prisma';

export async function assignDeveloperToProject(
  projectId: string,
  developerId: string,
  adminId: string
): Promise<any> {
  return await prisma.$transaction(async (tx) => {
    // No assignedDeveloperId on Project model; just update updatedAt
    const project = await tx.project.update({
      where: { id: projectId },
      data: { updatedAt: new Date() },
    });
    if (!project) throw new Error('Project not found');
    await tx.projectAssignment.upsert({
      where: { projectId_developerId: { projectId, developerId } },
      update: {},
      create: { projectId, developerId, role: 'Developer', status: 'pending' },
    });
    // Optionally add admin as a participant if needed (not in schema)
    // System message: You may need a ChatMessage model in your schema
    // await tx.chatMessage.create({ ... })
    return project;
  });
}

export async function getAvailableDevelopers(): Promise<any[]> {
  const devs = await prisma.user.findMany({
    where: { role: 'developer' },
    include: {
      developerProfile: {
        include: {
          assignments: {
            where: { status: { not: 'completed' } },
          },
        },
      },
    },
    orderBy: [
      { isActive: 'desc' },
      { firstName: 'asc' },
    ],
  });
  return devs;
}

export async function updateUserOnlineStatus(userId: string, isOnline: boolean): Promise<any> {
  return prisma.user.update({
    where: { id: userId },
    data: { isActive: isOnline, updatedAt: new Date() },
  });
}

export async function getUserUnreadMessageCount(userId: string): Promise<number> {
  // Placeholder: implement if you have a ChatMessage model
  return 0;
}

export async function getUserActiveChats(userId: string): Promise<any[]> {
  const assignments = await prisma.projectAssignment.findMany({
    where: { developerId: userId },
    include: { project: true },
  });
  return assignments.map(a => a.project);
}

export async function removeDeveloperFromProject(
  projectId: string,
  developerId: string,
  adminId: string,
  reason?: string
): Promise<boolean> {
  // No assignedDeveloperId to null; just update updatedAt
  await prisma.project.update({
    where: { id: projectId },
    data: { updatedAt: new Date() },
  });
  await prisma.projectAssignment.delete({
    where: { projectId_developerId: { projectId, developerId } },
  });
  // Optionally: create a system message about removal
  return true;
}

export function broadcastMessage(): void {
  // To be implemented with WebSocket/SSE
}

export async function getProjectChatStats(projectId: string): Promise<any> {
  // Placeholder: implement if you have a ChatMessage model
  return {};
}

export async function searchProjectMessages(
  projectId: string,
  query: string,
  userId: string
): Promise<any[]> {
  // Placeholder: implement if you have a ChatMessage model
  return [];
}

export async function exportChatHistory(
  projectId: string,
  userId: string
): Promise<any[]> {
  // Placeholder: implement if you have a ChatMessage model
  return [];
}
