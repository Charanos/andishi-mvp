import { PrismaClient } from '@prisma/client';
import { marked } from 'marked';

const prisma = new PrismaClient();

async function main() {
  const blogs = await prisma.blog.findMany();
  
  for (const blog of blogs) {
    // If no HTML tags, assume markdown/plain text and convert
    if (!/<[^>]+>/.test(blog.content.trim())) {
      const htmlContent = marked.parse(blog.content);
      await prisma.blog.update({
        where: { id: blog.id },
        data: { content: htmlContent },
      });
      console.log(`Converted blog post: ${blog.slug}`);
    }
  }
  
  console.log('Migration completed!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
