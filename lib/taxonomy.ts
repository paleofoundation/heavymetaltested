export const metals = [
  { key: 'lead', label: 'Lead' },
  { key: 'arsenic', label: 'Arsenic' },
  { key: 'cadmium', label: 'Cadmium' },
  { key: 'mercury', label: 'Mercury' },
  { key: 'nickel', label: 'Nickel' },
  { key: 'chromium', label: 'Chromium' },
  { key: 'tin', label: 'Tin' },
  { key: 'aluminum', label: 'Aluminum' }
] as const;

export const categories = [
  { key: 'infant-foods', label: 'Infant foods' },
  { key: 'grains-cereals', label: 'Grains & cereals' },
  { key: 'root-vegetables', label: 'Root vegetables' },
  { key: 'leafy-greens', label: 'Leafy greens' },
  { key: 'cocoa-chocolate', label: 'Cocoa & chocolate' },
  { key: 'spices', label: 'Spices' },
  { key: 'seafood', label: 'Seafood' },
  { key: 'drinking-water', label: 'Drinking water' },
  { key: 'supplements', label: 'Supplements' },
  { key: 'food-contact-materials-kitchenware', label: 'Food-contact materials & kitchenware' }
] as const;

export type MetalKey = (typeof metals)[number]['key'];
export type CategoryKey = (typeof categories)[number]['key'];
