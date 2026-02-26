import type { SectionDef } from './metal-sections';
import { metalSections } from './metal-sections';

export type FieldType = 'text' | 'textarea' | 'date' | 'tags';

export interface FieldDef {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
}

export interface ContentTypeSchema {
  label: string;
  labelPlural: string;
  slugPrefix: string;
  fields: FieldDef[];
  sections?: SectionDef[];
}

const shared: FieldDef[] = [
  { name: 'title', label: 'Title', type: 'text', required: true },
  { name: 'slug', label: 'Slug', type: 'text', required: true },
  { name: 'description', label: 'Description', type: 'textarea', required: true },
  { name: 'references', label: 'References', type: 'tags' },
];

export const contentSchemas: Record<string, ContentTypeSchema> = {
  pages: {
    label: 'Page',
    labelPlural: 'Pages',
    slugPrefix: '/',
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'slug', label: 'Slug', type: 'text', required: true },
      { name: 'heroHeadline', label: 'Hero Headline', type: 'text', required: true },
      { name: 'heroDescription', label: 'Hero Description', type: 'textarea', required: true },
      { name: 'heroCtaText', label: 'Hero Button Text', type: 'text' },
      { name: 'heroCtaUrl', label: 'Hero Button URL', type: 'text' },
      { name: 'heroImageAlt', label: 'Hero Image Alt Text', type: 'text' },
      { name: 'big8Heading', label: 'Big 8 Section Heading', type: 'text' },
      { name: 'big8CardDescription', label: 'Big 8 Card Description', type: 'text' },
      { name: 'categoriesHeading', label: 'Categories Section Heading', type: 'text' },
      { name: 'categoriesCardDescription', label: 'Categories Card Description', type: 'text' },
      { name: 'pullQuote', label: 'Pull Quote', type: 'textarea' },
      { name: 'latestHeading', label: 'Latest Stories Heading', type: 'text' },
      { name: 'card1Title', label: 'Bottom Card 1 — Title', type: 'text' },
      { name: 'card1Description', label: 'Bottom Card 1 — Description', type: 'textarea' },
      { name: 'card1LinkText', label: 'Bottom Card 1 — Link Text', type: 'text' },
      { name: 'card1LinkUrl', label: 'Bottom Card 1 — Link URL', type: 'text' },
      { name: 'card2Title', label: 'Bottom Card 2 — Title', type: 'text' },
      { name: 'card2Description', label: 'Bottom Card 2 — Description', type: 'textarea' },
      { name: 'card2LinkText', label: 'Bottom Card 2 — Link Text', type: 'text' },
      { name: 'card2LinkUrl', label: 'Bottom Card 2 — Link URL', type: 'text' },
      { name: 'card3Title', label: 'Bottom Card 3 — Title', type: 'text' },
      { name: 'card3Description', label: 'Bottom Card 3 — Description', type: 'textarea' },
    ],
  },
  metals: {
    label: 'Metal',
    labelPlural: 'Metals',
    slugPrefix: '/metals/',
    fields: [
      ...shared,
      { name: 'metalKey', label: 'Metal Key', type: 'text' },
      { name: 'synonyms', label: 'Synonyms', type: 'tags' },
      { name: 'updatedAt', label: 'Updated At', type: 'date' },
    ],
    sections: metalSections,
  },
  news: {
    label: 'News Post',
    labelPlural: 'News',
    slugPrefix: '/news/',
    fields: [
      ...shared,
      { name: 'publishedAt', label: 'Published At', type: 'date', required: true },
      { name: 'updatedAt', label: 'Updated At', type: 'date' },
      { name: 'metals', label: 'Metals', type: 'tags' },
      { name: 'categories', label: 'Categories', type: 'tags' },
    ],
  },
  categories: {
    label: 'Category',
    labelPlural: 'Categories',
    slugPrefix: '/categories/',
    fields: [
      ...shared,
      { name: 'categoryKey', label: 'Category Key', type: 'text' },
      { name: 'updatedAt', label: 'Updated At', type: 'date' },
    ],
  },
  playbooks: {
    label: 'Playbook',
    labelPlural: 'Playbooks',
    slugPrefix: '/playbooks/',
    fields: [
      ...shared,
      { name: 'updatedAt', label: 'Updated At', type: 'date' },
    ],
  },
  primers: {
    label: 'Primer',
    labelPlural: 'Primers',
    slugPrefix: '/testing/',
    fields: [
      ...shared,
      { name: 'updatedAt', label: 'Updated At', type: 'date' },
    ],
  },
  mechanisms: {
    label: 'Mechanism',
    labelPlural: 'Mechanisms',
    slugPrefix: '/mechanisms/',
    fields: [
      ...shared,
      { name: 'updatedAt', label: 'Updated At', type: 'date' },
    ],
  },
};
