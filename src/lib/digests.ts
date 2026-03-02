import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import remarkGfm from 'remark-gfm';

const digestsDirectory = path.join(process.cwd(), 'content/digests');

export interface DigestMeta {
  slug: string;
  date: string;
  title: string;
}

export interface Digest extends DigestMeta {
  contentHtml: string;
}

export function getAllDigests(): DigestMeta[] {
  if (!fs.existsSync(digestsDirectory)) return [];
  const fileNames = fs.readdirSync(digestsDirectory).filter(f => f.endsWith('.md'));
  const digests = fileNames.map((fileName) => {
    const slug = fileName.replace(/\.md$/, '');
    const dateMatch = slug.match(/(\d{4}-\d{2}-\d{2})/);
    const date = dateMatch ? dateMatch[1] : slug;
    const fullPath = path.join(digestsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const firstLine = fileContents.split('\n').find(l => l.startsWith('#')) || slug;
    const title = firstLine.replace(/^#+\s*/, '');
    return { slug, date, title };
  });
  return digests.sort((a, b) => b.date.localeCompare(a.date));
}

export async function getDigest(slug: string): Promise<Digest | null> {
  const fullPath = path.join(digestsDirectory, `${slug}.md`);
  if (!fs.existsSync(fullPath)) return null;
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { content } = matter(fileContents);
  const processed = content.replace(/<(https?:\/\/[^>]+)>/g, '[$1]($1)');
  const result = await remark().use(remarkGfm).use(html, { sanitize: false }).process(processed);
  const dateMatch = slug.match(/(\d{4}-\d{2}-\d{2})/);
  const date = dateMatch ? dateMatch[1] : slug;
  const firstLine = content.split('\n').find(l => l.startsWith('#')) || slug;
  const title = firstLine.replace(/^#+\s*/, '');
  return { slug, date, title, contentHtml: result.toString() };
}

export async function getLatestDigest(): Promise<Digest | null> {
  const all = getAllDigests();
  if (all.length === 0) return null;
  return getDigest(all[0].slug);
}
