export interface Favorite {
  id: string;
  name: string;
  description: string;
  url: string;
  category: 'Product' | 'People' | 'Site';
  nofollow?: boolean; // Optional: if false, nofollow won't be added
}

export const favorites: Favorite[] = [
  {
    id: 'seline',
    name: 'Seline',
    description: 'Analytics with beauty and brain',
    url: 'https://seline.com/',
    category: 'Product'
  },
  {
    id: 'thiings',
    name: 'Thiings.co',
    description: 'Love their everyday 3d icons',
    url: 'https://thiings.co',
    category: 'Product'
  },
  {
    id: 'hugeicons',
    name: 'Hugeicons',
    description: 'Using these icons in all of my projects',
    url: 'https://hugeicons.com',
    category: 'Product'
  },
  {
    id: 'darius-dan',
    name: 'Darius Dan',
    description: "Big fan of Darius' illustrations",
    url: 'https://dariusdan.com',
    category: 'People'
  },
  {
    id: 'curated-supply',
    name: 'Curated Supply',
    description: 'All the things I wish to own someday',
    url: 'https://curated.supply',
    category: 'Site'
  },
  {
    id: 'hvpandya',
    name: 'Hardik Pandya',
    description: 'Brilliant design leader',
    url: 'https://hvpandya.com/',
    category: 'People'
  }
];