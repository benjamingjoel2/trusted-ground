/**
 * Trusted Ground: the one config file.
 *
 * Name, domain, editor line, colours, contact details, disclosure wording,
 * paid-label wording and the verification tier definitions all live here,
 * so the founders and a lawyer can change them without touching templates.
 *
 * LEGAL: every string in `disclosure` needs US, UK, EU and Brazil sign-off
 * before launch. See FACTS-TO-VERIFY.md.
 */

export const site = {
  name: 'Trusted Ground',
  /** Hero photo on the home page (a destination slug with a photo in data/images.json). */
  heroPhoto: 'peru',
  /** Short line shown under the name in the masthead. */
  tagline: 'Travel stories and destination guides',
  /** One-sentence positioning used in meta descriptions and llms.txt. */
  positioning:
    'Practical, sourced travel stories and destination guides: when to go, how things work on the ground, and how to book a trip safely with a local operator. Published by Tourground.',
  domain: 'trustedground.tourground.com',
  url: 'https://trustedground.tourground.com',
  language: 'en',
  locale: 'en_GB',

  /** The only email address used anywhere on the site (owner rule 3). */
  email: 'trustedground@tourground.com',

  publisher: {
    name: 'Tourground',
    url: 'https://tourground.com',
    /** Label used for brands owned by Tourground's founders. */
    founderLabel: 'Founder-owned (Tourground Geotrax)',
  },

  /** Shown on every factual page under the byline. */
  editorLine: 'Edited by the Trusted Ground desk, Tourground.',

  /**
   * Business address (owner rule 4). PLACEHOLDER until the founders confirm
   * the coworking space in the city where the publishing desk sits.
   * While `isPlaceholder` is true the site prints `placeholderNotice`
   * instead of a street address. Listed in FACTS-TO-VERIFY.md.
   */
  address: {
    isPlaceholder: true,
    lines: ['[Coworking space to be confirmed]', '[Street address]', '[City, postcode]', '[Country]'],
    placeholderNotice:
      'Our postal address is being confirmed. Until it is published here, please write to us by email.',
  },

  /** Main-site flows. Placeholders until Tourground publishes dedicated pages. */
  links: {
    /** "Request a correction or removal" on every company page. PLACEHOLDER. */
    correctionUrl: 'https://tourground.com/#join',
    /** Where a company claims or updates its listing. PLACEHOLDER. */
    claimUrl: 'https://tourground.com/#join',
    /** Fallback when a company has no profile_url in the feed yet. */
    profileFallbackUrl: 'https://tourground.com/',
  },

  /** Palette (design language modelled on lonelyplanet.com). `verified` is used only for verified states. */
  colors: {
    white: '#FFFFFF',
    grey: '#F2F2F2',
    grey2: '#C9CACB',
    grey3: '#DDDCD8',
    line: '#D3D4D5',
    ink: '#1F2528',
    inkDeep: '#121A10',
    slate: '#50575C',
    lime: '#CFDCB2',
    yellow: '#FFD21F',
    yellowSoft: '#FFF5CC',
    blue: '#0047D6',
    verified: '#1E6B45',
  },

  /**
   * Paid placement is not built yet. While false, the empty ad slot renders
   * nothing on public pages (it is shown as a specimen on the disclosure page).
   */
  showEmptyAdSlot: false,

  /** Analytics: Vercel Web Analytics only. No other tracking. */
  analytics: { vercel: true },

  /** Dates used on site-level pages (About, legal pages). */
  launch: { published: '2026-11-08' },
} as const;

/**
 * Disclosure and label wording. One place, for the lawyer.
 * Do not hard-code any of these strings in templates.
 */
export const disclosure = {
  footerPublishedBy: 'Published by Tourground.',
  footerShort:
    'Trusted Ground publishes practical, sourced travel stories and destination guides. It is published by Tourground.',
  /** How lists are ordered. Trusted Ground does not rank operators. */
  listingStatement:
    'Operators are listed in alphabetical order. Trusted Ground does not rank them, and no company can pay to be listed or to appear higher.',
  paidLabel: 'Advertisement feature',
  paidSlotNote:
    'Paid placements appear only in this box, are labelled "Advertisement feature" and never change which companies are listed or their order.',
  paidSlotEmpty: 'No advertisement feature is running on this page.',
  platinumNote:
    'Platinum is a paid Tourground plan. It allows a link to the company\'s own website, marked as sponsored. It does not change where a company appears.',
  sponsoredLinkLabel: 'Company website (sponsored link)',
  founderNote:
    'Founder-owned brands belong to Tourground\'s founders. They are checked and listed under the same rules as every other company and never placed above others for that reason.',
  publisherRelationship:
    'Trusted Ground is published by Tourground, which runs the directory the listings come from. Tourground earns money from paid plans sold to travel companies, including the Platinum plan. Some listed brands are owned by Tourground\'s founders and are labelled as such.',
  mockFeedNotice:
    'Preview data: this build uses a mock directory feed. Company records are placeholders until the live Tourground directory export is connected.',
  exampleRecordLabel: 'Example record, not a real company',
  noAdvice:
    'Trusted Ground is a reference, not a travel agent. We do not sell trips, take bookings or handle payments.',
} as const;

/**
 * Verification tiers. Stated from Tourground's own published wording
 * (tourground.com FAQ and Plans, retrieved 2026-11-08). The site prints
 * exactly these lines and makes no claim beyond them.
 * Every `checks` line is listed in FACTS-TO-VERIFY.md for founder sign-off.
 */
export type TierKey = 'verified' | 'black' | 'platinum' | 'founder';

export const tiers: Record<
  TierKey,
  { label: string; short: string; paid: boolean; checks: string[]; notChecked: string[] }
> = {
  verified: {
    label: 'Verified',
    short: 'The company claimed its Tourground profile and was checked as a real company.',
    paid: false,
    checks: [
      'The company claimed its own profile on Tourground.',
      'Tourground checked that the company is real (Tourground\'s wording for this seal: "your company is real and checked").',
      'The facts on this page were compared with the sources listed under Sources.',
    ],
    notChecked: [
      'Booking volumes and trip performance are not proven at this tier.',
      'Verification is not a licence, an insurance policy or a financial guarantee.',
    ],
  },
  black: {
    label: 'Black',
    short: 'Verified, and its booking and performance data has been proven with evidence.',
    paid: false,
    checks: [
      'Everything checked at the Verified tier.',
      'Its data is proven: real bookings and performance, with proof. Proof from suppliers also counts.',
    ],
    notChecked: ['Verification is not a licence, an insurance policy or a financial guarantee.'],
  },
  platinum: {
    label: 'Platinum',
    short: 'A paid Tourground plan with services. Paying does not prove data and does not change where a company appears.',
    paid: true,
    checks: [
      'Everything checked at the Verified tier.',
      'Platinum is a paid plan with services (a marketing push and access to Tourground tools). It is always labelled as paid.',
    ],
    notChecked: [
      'Paying for Platinum does not give a company the proof required for Black.',
      'Paying for Platinum does not change where a company appears.',
    ],
  },
  founder: {
    label: 'Founder',
    short: 'A brand owned by Tourground\'s founders, held to the same rules as everyone else.',
    paid: false,
    checks: [
      'Ownership: the brand belongs to Tourground\'s founders (Tourground Geotrax).',
      'It follows the same fees and listing rules as every other company in the directory.',
    ],
    notChecked: ['Verification is not a licence, an insurance policy or a financial guarantee.'],
  },
};

/** Source for the tier wording above. Shown on the verification page. */
export const tierSources = [
  { url: 'https://tourground.com/', label: 'Tourground: FAQ and Plans (retrieved 8 November 2026)' },
];

/** Regions (fixed list). Slugs are used in the feed's destinations[].region. */
export const regions = [
  { slug: 'africa', name: 'Africa' },
  { slug: 'asia', name: 'Asia' },
  { slug: 'europe', name: 'Europe' },
  { slug: 'americas', name: 'The Americas' },
  { slug: 'middle-east', name: 'The Middle East' },
  { slug: 'oceania', name: 'Oceania' },
  { slug: 'poles', name: 'The Poles' },
] as const;

/** Specialties (niches) for cross-country lists. Slugs are used in companies[].niches. */
export const niches = [
  { slug: 'safari', name: 'Safari' },
  { slug: 'trekking-mountains', name: 'Trekking and mountains' },
  { slug: 'culture-heritage', name: 'Culture and heritage' },
  { slug: 'wildlife-diving', name: 'Wildlife and diving' },
  { slug: 'family', name: 'Family' },
  { slug: 'honeymoon', name: 'Honeymoon' },
  { slug: 'overland', name: 'Overland' },
  { slug: 'heritage-diaspora', name: 'Heritage and diaspora journeys' },
] as const;
