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
