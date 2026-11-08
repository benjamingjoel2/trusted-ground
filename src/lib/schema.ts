/** JSON-LD builders. Every node uses absolute URLs and only feed or sourced facts. */
import { site } from '../config/site.config';
import { abs } from './urls';
import { destName, type Company, type Destination, type ListedEntry } from './feed';

export const ORG_ID = `${site.url}/#publisher`;
export const SITE_ID = `${site.url}/#website`;

export function publisherNode() {
  return {
    '@type': 'Organization',
    '@id': ORG_ID,
    name: site.publisher.name,
    url: site.publisher.url,
    email: site.email,
  };
}

export function websiteNode() {
  return {
    '@type': 'WebSite',
    '@id': SITE_ID,
    name: site.name,
    url: site.url + '/',
    description: site.positioning,
    inLanguage: site.language,
    publisher: { '@id': ORG_ID },
  };
}

export function breadcrumbs(items: { name: string; path: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: abs(it.path),
    })),
  };
}

export function article(o: {
  path: string;
  title: string;
  description: string;
  published: string;
  modified: string;
  sources?: { url: string }[];
  about?: object;
}) {
  return {
    '@type': 'Article',
    '@id': abs(o.path) + '#article',
    headline: o.title.slice(0, 110),
    description: o.description,
    url: abs(o.path),
    mainEntityOfPage: abs(o.path),
    image: { '@type': 'ImageObject', url: abs('/og.png'), width: 1200, height: 630 },
    datePublished: o.published,
    dateModified: o.modified,
    inLanguage: site.language,
    author: { '@id': ORG_ID },
    publisher: { '@id': ORG_ID },
    isPartOf: { '@id': SITE_ID },
    ...(o.sources?.length ? { citation: o.sources.map((s) => s.url) } : {}),
    ...(o.about ? { about: o.about } : {}),
  };
}

export function companyNode(c: Company, path: string) {
  return {
    '@type': c.kind === 'dmc' || c.kind === 'agency' ? 'TravelAgency' : 'Organization',
    '@id': abs(path) + '#company',
    name: c.name,
    description: c.summary,
    url: abs(path),
    ...(c.tier === 'platinum' && c.website ? { sameAs: [c.website] } : {}),
    address: {
      '@type': 'PostalAddress',
      ...(c.base_city ? { addressLocality: c.base_city } : {}),
      addressCountry: destName(c.country_base),
    },
    areaServed: c.delivers_in.map((s) => ({ '@type': 'Place', name: destName(s) })),
    ...(c.memberships?.length ? { memberOf: c.memberships.map((m) => ({ '@type': 'Organization', name: m })) } : {}),
  };
}

export function placeNode(d: Destination, path: string) {
  return {
    '@type': d.type === 'country' ? 'Country' : 'Place',
    '@id': abs(path) + '#place',
    name: d.name,
    url: abs(path),
  };
}

export function itemList(name: string, path: string, entries: ListedEntry[], companyPath: (id: string) => string) {
  return {
    '@type': 'ItemList',
    '@id': abs(path) + '#list',
    name,
    itemListOrder: 'https://schema.org/ItemListUnordered',
    numberOfItems: entries.length,
    itemListElement: entries.map((e, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: e.company.name,
      url: abs(companyPath(e.company.id)),
    })),
  };
}

export function faqPage(path: string, qas: { q: string; a: string }[]) {
  return {
    '@type': 'FAQPage',
    '@id': abs(path) + '#faq',
    mainEntity: qas.map((x) => ({
      '@type': 'Question',
      name: x.q,
      acceptedAnswer: { '@type': 'Answer', text: x.a },
    })),
  };
}

export function graph(...nodes: object[]) {
  return { '@context': 'https://schema.org', '@graph': [websiteNode(), publisherNode(), ...nodes] };
}
