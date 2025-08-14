const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Generate a URL-friendly slug from a title
function generateSlug(title) {
  return title
    .toLowerCase()
    .trim()
    // Replace spaces and special characters with hyphens
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '');
}

async function migrateProjectSlugs() {
  try {
    console.log('🚀 Starting project slug migration...');
    
    // Fetch all homepage projects that don't have a slug or have invalid slugs
    const projects = await prisma.homepageProject.findMany({
      where: {
        OR: [
          { slug: null },
          { slug: '' }
        ]
      }
    });

    // Also get projects that might have ObjectId-like slugs (we'll filter these manually)
    const allProjects = await prisma.homepageProject.findMany();
    const objectIdPattern = /^[0-9a-fA-F]{24}$/;
    const projectsWithObjectIdSlugs = allProjects.filter(project => 
      project.slug && objectIdPattern.test(project.slug)
    );

    // Combine both sets of projects that need migration
    const projectsToMigrate = [
      ...projects,
      ...projectsWithObjectIdSlugs.filter(p => !projects.some(existing => existing.id === p.id))
    ];

    console.log(`📊 Found ${projectsToMigrate.length} projects that need slug migration`);

    if (projectsToMigrate.length === 0) {
      console.log('✅ No projects need migration. All projects already have valid slugs.');
      return;
    }

    // Process each project
    for (const project of projectsToMigrate) {
      console.log(`🔄 Processing project: "${project.title}"`);
      
      // Generate slug from title
      let newSlug = generateSlug(project.title);
      
      // Check if slug already exists and make it unique if needed
      let slugExists = await prisma.homepageProject.findFirst({
        where: { 
          slug: newSlug,
          id: { not: project.id }
        }
      });
      
      // If slug exists, make it unique by adding a number
      let counter = 1;
      let originalSlug = newSlug;
      while (slugExists) {
        newSlug = `${originalSlug}-${counter}`;
        slugExists = await prisma.homepageProject.findFirst({
          where: { 
            slug: newSlug,
            id: { not: project.id }
          }
        });
        counter++;
      }
      
      // Update the project with the new slug
      await prisma.homepageProject.update({
        where: { id: project.id },
        data: { slug: newSlug }
      });
      
      console.log(`✅ Updated "${project.title}" with slug: "${newSlug}"`);
    }

    console.log('🎉 Project slug migration completed successfully!');
    
    // Verify migration
    const remainingProjects = await prisma.homepageProject.findMany({
      where: {
        OR: [
          { slug: null },
          { slug: '' }
        ]
      }
    });
    
    if (remainingProjects.length === 0) {
      console.log('✅ Migration verification passed: All projects now have valid slugs');
    } else {
      console.log(`⚠️  Warning: ${remainingProjects.length} projects still don't have slugs`);
    }

  } catch (error) {
    console.error('❌ Error during migration:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
migrateProjectSlugs()
  .then(() => {
    console.log('Migration script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration script failed:', error);
    process.exit(1);
  });
