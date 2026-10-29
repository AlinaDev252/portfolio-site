import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const work = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/work' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      summary: z.string(),
      kind: z.string(),
      role: z.string(),
      stack: z.array(z.string()),
      year: z.number(),
      order: z.number(),
      cover: image(),
      coverAlt: z.string(),
      gallery: z
        .array(
          z.object({
            desktop: image(),
            mobile: image().optional(),
            alt: z.string(),
            caption: z.string().optional(),
          }),
        )
        .default([]),
      placeholder: z.boolean().default(false),
      draft: z.boolean().default(false),
    }),
});

const projects = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    stack: z.array(z.string()),
    status: z.enum(['live', 'in-progress']),
    liveUrl: z.url().optional(),
    repoUrl: z.url().optional(),
    order: z.number(),
  }),
});

export const collections = { work, projects };
