import { site } from '../config/site.config';

/** Clean URLs, always with a trailing slash. One place to change the scheme. */
export const url = {
  home: () => '/',
  countries: () => '/countries/',
  country: (slug: string) => `/countries/${slug}/`,
  regions: () => '/regions/',
  region: (slug: string) => `/regions/${slug}/`,
  articles: () => '/articles/',
  article: (id: string) => `/articles/${id}/`,
  compare: () => '/compare/',
  about: () => '/about/',
  disclosure: () => '/disclosure/',
  corrections: () => '/corrections/',
  privacy: () => '/privacy/',
  terms: () => '/terms/',
  cookies: () => '/cookies/',
};

export const abs = (p: string) => new URL(p, site.url).toString();

