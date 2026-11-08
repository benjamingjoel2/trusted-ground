/**
 * Editorial content: guide chapters, country snapshots, Q&A and reference pages.
 * Markdown with front matter. Only `status: reviewed` is ever published
 * (see src/lib/content.ts), and a reviewed entry must list at least one source.
 */
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const source = z.object({ url: z.string().url(), label: z.string().min(1) });

const base = z
  .object({
    title: z.string().min(1),
    description: z.string().min(1).max(200),
    sources: z.array(source).default([]),
    published: z.coerce.date(),
    reviewed: z.coerce.date(),
    status: z.enum(['draft', 'reviewed']),
  })
  .refine((d) => d.status !== 'reviewed' || d.sources.length > 0, {
    message: 'A reviewed entry must list at least one source. Never publish text without sources.',
  })
  .refine((d) => d.reviewed >= d.published, { message: '`reviewed` cannot be earlier than `published`.' });

const guide = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/guide' }),
  schema: z.intersection(base, z.object({ order: z.number().int(), short_title: z.string() })),
});

const countries = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/countries' }),
  schema: z.intersection(
    base,
    z.object({
      best_months: z.string().optional(),
      main_regions: z.array(z.string()).default([]),
      entry_basics: z.string().optional(),
    }),
  ),
});

const questions = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/questions' }),
  schema: z.intersection(base, z.object({ order: z.number().int(), short_answer: z.string().min(1) })),
});

const pages = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/pages' }),
  schema: z.intersection(
    base,
    z.object({
      kind: z.enum(['reference', 'legal', 'checklist']).default('reference'),
      items: z
        .array(
          z.object({
            text: z.string(),
            detail: z.string().optional(),
            source: source,
            guide: z.string().optional(),
          }),
        )
        .optional(),
    }),
  ),
});

export const collections = { guide, countries, questions, pages };
