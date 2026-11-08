import { site } from '../config/site.config';
import type { Company } from './feed';

/** Clean URLs, always with a trailing slash. One place to change the scheme. */
export const url = {
  home: () => '/',
  countries: () => '/countries/',
  country: (slug: string) => `/countries/${slug}/`,
  regions: () => '/regions/',
  region: (slug: string) => `/regions/${slug}/`,
  operators: () => '/operators/',
  operator: (id: string) => `/operators/${id}/`,
  specialties: () => '/specialties/',
  niche: (slug: string) => `/specialties/${slug}/`,
  articles: () => '/articles/',
  article: (id: string) => `/articles/${id}/`,
  guide: () => '/guide/',
  guideChapter: (id: string) => `/guide/${id}/`,
  verification: () => '/verification/',
  questions: () => '/questions/',
  question: (id: string) => `/questions/${id}/`,
  checklist: () => '/checklist/',
  compare: () => '/compare/',
  about: () => '/about/',
  disclosure: () => '/disclosure/',
  corrections: () => '/corrections/',
  privacy: () => '/privacy/',
  terms: () => '/terms/',
  cookies: () => '/cookies/',
};

export const abs = (p: string) => new URL(p, site.url).toString();

/**
 * Link rule: Platinum companies may link to their own site (rel sponsored nofollow).
 * Everyone else links only to their Tourground profile.
 */
export function companyOutbound(c: Company): { href: string; rel: string; sponsored: boolean } {
  if (c.tier === 'platinum' && c.website) {
    return { href: c.website, rel: 'sponsored nofollow noopener', sponsored: true };
  }
  return { href: c.profile_url || site.links.profileFallbackUrl, rel: 'noopener', sponsored: false };
}

/** Sources pointing at the company's own domain are citations, not endorsements: nofollow. */
export function sourceRel(c: Company | null, href: string): string {
  if (!c?.website) return 'noopener';
  try {
    return new URL(href).hostname === new URL(c.website).hostname ? 'nofollow noopener' : 'noopener';
  } catch {
    return 'noopener';
  }
}
