/**
 * Destination photos: Wikimedia Commons featured/quality pictures under free licences,
 * fetched by scripts/images/fetch-commons.py. Credits come from data/images.json.
 * No scraped, AI-generated or unlicensed images; no photos of identifiable people.
 */
import type { ImageMetadata } from 'astro';
import fs from 'node:fs';
import path from 'node:path';

export interface Credit {
  file: string;
  page: string;
  author: string;
  license: string;
  license_url: string | null;
  description?: string;
}

const files = import.meta.glob<{ default: ImageMetadata }>('../assets/places/*.jpg', { eager: true });
let credits: Record<string, Credit> | null = null;
function loadCredits() {
  if (!credits) {
    const f = path.join(process.cwd(), 'data', 'images.json');
    credits = fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : {};
  }
  return credits!;
}

export function placePhoto(slug: string): { src: ImageMetadata; credit: Credit } | null {
  const m = files[`../assets/places/${slug}.jpg`];
  const c = loadCredits()[slug];
  if (!m || !c) return null;
  return { src: m.default, credit: c };
}

export function allCredits(): [string, Credit][] {
  return Object.entries(loadCredits()).sort((a, b) => a[0].localeCompare(b[0]));
}

/** "Photo: Author, CC BY-SA 4.0" */
export function creditLine(c: Credit): string {
  const author = c.author.replace(/\s+/g, ' ').slice(0, 60);
  return `${author} · ${c.license}`;
}
