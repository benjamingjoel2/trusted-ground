import { getCollection, type CollectionEntry } from 'astro:content';

type Name = 'countries' | 'pages' | 'articles';

/** Only reviewed, sourced entries are published. Drafts never leave the repo. */
export async function published<N extends Name>(name: N): Promise<CollectionEntry<N>[]> {
  const all = (await getCollection(name)) as CollectionEntry<N>[];
  return all.filter((e) => (e.data as any).status === 'reviewed' && (e.data as any).sources.length > 0);
}

export async function publishedPage(id: string) {
  const list = await published('pages');
  return list.find((e) => e.id === id);
}

export const iso = (d: Date | string) => (typeof d === 'string' ? d : d.toISOString().slice(0, 10));

export function fmtDate(d: Date | string): string {
  const date = typeof d === 'string' ? new Date(d + 'T00:00:00Z') : d;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}

/** Minutes to read at ~220 words per minute. */
export function readMinutes(body: string | undefined): number {
  const words = (body ?? '').replace(/[#>*_`\[\]()|-]/g, ' ').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}
