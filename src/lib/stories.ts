/** One list of everything readable as a "story": articles, guide chapters and questions. */
import { published, readMinutes } from './content';
import { url } from './urls';
import { getFeed } from './feed';

export interface Story {
  kind: 'article' | 'question';
  id: string;
  href: string;
  title: string;
  description: string;
  category: string;
  hero: string | undefined;
  countries: string[];
  regions: string[];
  published: Date;
  minutes: number;
}

export async function allStories(): Promise<Story[]> {
  const feed = getFeed();
  const regionOf = (c: string) => feed.destBySlug.get(c)?.region;
  const arts = (await published('articles')).map((a): Story => ({
    kind: 'article', id: a.id, href: url.article(a.id), title: a.data.title, description: a.data.description,
    category: a.data.category, hero: a.data.hero ?? a.data.countries[0], countries: a.data.countries,
    regions: [...new Set(a.data.countries.map(regionOf).filter(Boolean) as string[])], published: a.data.published, minutes: readMinutes(a.body),
  }));
  const qs = (await published('questions')).map((q): Story => ({
    kind: 'question', id: q.id, href: url.question(q.id), title: q.data.title, description: q.data.short_answer,
    category: 'Questions', hero: q.data.hero, countries: [], regions: [], published: q.data.published, minutes: readMinutes(q.body),
  }));
  return [...arts, ...qs].sort((a, b) => b.published.getTime() - a.published.getTime() || a.title.localeCompare(b.title));
}
