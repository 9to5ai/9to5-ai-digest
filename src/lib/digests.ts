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

function smartLinkify(content: string): string {
  // Convert <url> wrapped links to markdown links with smart labels
  content = content.replace(/<(https?:\/\/[^>]+)>/g, (_, url) => {
    const label = getLinkLabel(url);
    return `[${label}](${url})`;
  });
  
  // Convert bare URLs at end of lines (not already in markdown links) to smart links
  content = content.replace(/(?<!\()(https?:\/\/[^\s\)]+)/g, (match, url, offset, str) => {
    // Skip if already inside a markdown link [...](...) 
    const before = str.substring(Math.max(0, offset - 2), offset);
    if (before.includes('(') || before.includes('](')) return match;
    const label = getLinkLabel(url);
    return `[${label}](${url})`;
  });
  
  return content;
}

function getLinkLabel(url: string): string {
  try {
    const u = new URL(url);
    const host = u.hostname.replace('www.', '');
    
    // Twitter/X
    if (host === 'x.com' || host === 'twitter.com') {
      const parts = u.pathname.split('/');
      if (parts.length >= 2) return `@${parts[1]}`;
      return 'X/Twitter';
    }
    
    // Reddit
    if (host === 'reddit.com' || host.endsWith('.reddit.com')) {
      const match = u.pathname.match(/\/r\/(\w+)/);
      if (match) return `r/${match[1]}`;
      return 'Reddit';
    }
    
    // GitHub
    if (host === 'github.com') {
      const parts = u.pathname.split('/').filter(Boolean);
      if (parts.length >= 2) return `${parts[0]}/${parts[1]}`;
      return 'GitHub';
    }
    
    // Known domains → clean names
    const domainMap: Record<string, string> = {
      'openai.com': 'OpenAI',
      'anthropic.com': 'Anthropic',
      'claude.com': 'Claude',
      'nvidia.com': 'NVIDIA',
      'blogs.nvidia.com': 'NVIDIA Blog',
      'windowscentral.com': 'Windows Central',
      'techcrunch.com': 'TechCrunch',
      'theverge.com': 'The Verge',
      'arstechnica.com': 'Ars Technica',
      'wired.com': 'Wired',
      'reuters.com': 'Reuters',
      'bloomberg.com': 'Bloomberg',
      'coindesk.com': 'CoinDesk',
      'simonwillison.net': 'Simon Willison',
      'garymarcus.substack.com': 'Gary Marcus',
      'karpathy.github.io': 'Karpathy',
      'ericsson.com': 'Ericsson',
      'samsung.com': 'Samsung',
      'huawei.com': 'Huawei',
      'npr.org': 'NPR',
    };
    
    for (const [domain, label] of Object.entries(domainMap)) {
      if (host === domain || host.endsWith('.' + domain)) return label;
    }
    
    // Fallback: clean domain name
    const parts = host.split('.');
    if (parts.length >= 2) {
      return parts[parts.length - 2].charAt(0).toUpperCase() + parts[parts.length - 2].slice(1);
    }
    return host;
  } catch {
    return 'Source';
  }
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
  const processed = smartLinkify(content);
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
