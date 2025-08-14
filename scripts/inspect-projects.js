const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function inspectProjects() {
  try {
    console.log('🔍 Inspecting current homepage projects in database...');
    
    // Get all projects
    const allProjects = await prisma.homepageProject.findMany();
    
    console.log(`📊 Total projects found: ${allProjects.length}`);
    
    if (allProjects.length === 0) {
      console.log('❌ No projects found in database. This explains the routing issues.');
      console.log('💡 You may need to run the seed script to populate initial data.');
      return;
    }
    
    // Inspect each project
    console.log('\n📋 Project details:');
    allProjects.forEach((project, index) => {
      console.log(`\n${index + 1}. Project: "${project.title}"`);
      console.log(`   ID: ${project.id}`);
      console.log(`   Slug: ${project.slug || 'NULL'}`);
      console.log(`   Category: ${project.category}`);
      console.log(`   Featured: ${project.featured}`);
      console.log(`   Status: ${project.status}`);
    });
    
    // Check for problematic slugs
    const projectsWithNullSlugs = allProjects.filter(p => !p.slug);
    const projectsWithObjectIdSlugs = allProjects.filter(p => 
      p.slug && /^[0-9a-fA-F]{24}$/.test(p.slug)
    );
    
    console.log(`\n🚨 Projects with NULL slugs: ${projectsWithNullSlugs.length}`);
    console.log(`🚨 Projects with ObjectId-like slugs: ${projectsWithObjectIdSlugs.length}`);
    
    if (projectsWithNullSlugs.length > 0) {
      console.log('\n❌ Projects with NULL slugs:');
      projectsWithNullSlugs.forEach(p => console.log(`   - "${p.title}" (ID: ${p.id})`));
    }
    
    if (projectsWithObjectIdSlugs.length > 0) {
      console.log('\n❌ Projects with ObjectId-like slugs:');
      projectsWithObjectIdSlugs.forEach(p => console.log(`   - "${p.title}" (Slug: ${p.slug})`));
    }

  } catch (error) {
    console.error('❌ Error inspecting projects:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the inspection
inspectProjects()
  .then(() => {
    console.log('\n✅ Database inspection completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Database inspection failed:', error);
    process.exit(1);
  });
