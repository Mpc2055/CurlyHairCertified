import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { blogPosts } from '../shared/schema';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

const sql = neon(DATABASE_URL);
const db = drizzle(sql);

interface BlogPostFrontmatter {
  slug: string;
  title: string;
  subtitle?: string;
  excerpt: string;
  authorName: string;
  authorBio?: string;
  featured: boolean;
  tags: string;
  readTime: number;
}

function parseFrontmatter(content: string): { frontmatter: BlogPostFrontmatter; markdown: string } {
  const lines = content.split('\n');
  
  if (lines[0] !== '---') {
    throw new Error('Invalid frontmatter: missing opening ---');
  }
  
  let endIndex = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i] === '---') {
      endIndex = i;
      break;
    }
  }
  
  if (endIndex === -1) {
    throw new Error('Invalid frontmatter: missing closing ---');
  }
  
  const frontmatterLines = lines.slice(1, endIndex);
  const frontmatter: any = {};
  
  for (const line of frontmatterLines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;
    
    const key = line.substring(0, colonIndex).trim();
    const value = line.substring(colonIndex + 1).trim();
    
    // Remove quotes if present
    const unquotedValue = value.replace(/^["'](.*)["']$/, '$1');
    
    if (key === 'featured') {
      frontmatter[key] = unquotedValue === 'true';
    } else if (key === 'readTime') {
      frontmatter[key] = parseInt(unquotedValue);
    } else {
      frontmatter[key] = unquotedValue;
    }
  }
  
  const markdown = lines.slice(endIndex + 1).join('\n').trim();
  
  return { frontmatter: frontmatter as BlogPostFrontmatter, markdown };
}

async function loadBlogPost(filePath: string) {
  try {
    console.log(`Reading blog post from: ${filePath}`);
    const content = readFileSync(filePath, 'utf-8');
    
    const { frontmatter, markdown } = parseFrontmatter(content);
    
    // Split tags by comma
    const tags = frontmatter.tags.split(',').map(tag => tag.trim());
    
    console.log('Parsed frontmatter:', frontmatter);
    console.log('Content length:', markdown.length);
    
    // Insert into database
    const [inserted] = await db.insert(blogPosts).values({
      slug: frontmatter.slug,
      title: frontmatter.title,
      subtitle: frontmatter.subtitle,
      content: markdown,
      excerpt: frontmatter.excerpt,
      authorName: frontmatter.authorName,
      authorBio: frontmatter.authorBio,
      featured: frontmatter.featured,
      tags: tags,
      readTime: frontmatter.readTime,
    }).returning();
    
    console.log('✓ Blog post inserted successfully!');
    console.log('  ID:', inserted.id);
    console.log('  Slug:', inserted.slug);
    console.log('  Title:', inserted.title);
    console.log('  Featured:', inserted.featured);
    console.log('  Tags:', inserted.tags);
    
  } catch (error) {
    console.error('Error loading blog post:', error);
    throw error;
  }
}

const blogPostPath = join(__dirname, '..', 'blog-posts', 'why-we-built-this-for-rochester.md');
loadBlogPost(blogPostPath);
