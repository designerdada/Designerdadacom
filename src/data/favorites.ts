export interface Favorite {
  id: string;
  name: string;
  description: string;
  url: string;
  category: 'Product' | 'People' | 'Site' | 'Font';
  nofollow?: boolean; // Optional: if false, nofollow won't be added
}

export const favorites: Favorite[] = [
  {
    id: 'figma',
    name: 'Figma',
    description: 'I live here. This is my second address.',
    url: 'https://figma.com',
    category: 'Product'
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    description: 'AI company I trust',
    url: 'https://www.anthropic.com/',
    category: 'Product'
  },
  {
    id: 'flighty',
    name: 'Flighty',
    description: 'This app make avgeek within me happy',
    url: 'https://flighty.com/',
    category: 'Product'
  },
  {
    id: 'literal',
    name: 'Literal',
    description: 'For a bookworm in you',
    url: 'https://literal.club/',
    category: 'Product'
  },
  {
    id: 'leica-m6',
    name: 'Leica M6',
    description: 'Only generational wealth I will pass on',
    url: 'https://leica-camera.com/en-int/photography/cameras/m/m6',
    category: 'Product'
  },
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
    id: 'granola',
    name: 'Granola',
    description: 'My companion in all sales calls',
    url: 'https://www.granola.ai/',
    category: 'Product'
  },
  {
    id: 'superlist',
    name: 'Superlist',
    description: 'Beautiful note taking and todo app',
    url: 'https://www.superlist.com/',
    category: 'Product'
  },
  {
    id: 'dieter-rams',
    name: 'Dieter Rams',
    description: 'My source of inspiration',
    url: 'https://rams-foundation.org/',
    category: 'People'
  },
  {
    id: 'dharmesh-shah',
    name: 'Dharmesh Shah',
    description: 'The OG builder (and our investor)',
    url: 'https://peerlist.io/dharmesh',
    category: 'People'
  },
  {
    id: 'gavin-nelson',
    name: 'Gavin Nelson',
    description: 'Designer at Linear',
    url: 'https://nelson.co/',
    category: 'People'
  },
  {
    id: 'darius-dan',
    name: 'Darius Dan',
    description: "Big fan of Darius' illustrations",
    url: 'https://dariusdan.com',
    category: 'People'
  },
  {
    id: 'hvpandya',
    name: 'Hardik Pandya',
    description: 'Brilliant design leader',
    url: 'https://hvpandya.com/',
    category: 'People'
  },
  {
    id: 'ogimage-gallery',
    name: 'ogimage Gallery',
    description: 'Design inspiration for og-images',
    url: 'https://ogimage.gallery',
    category: 'Site'
  },
  {
    id: 'stripe-press',
    name: 'Stripe Press',
    description: 'Books I wish to own',
    url: 'https://press.stripe.com/',
    category: 'Site'
  },
  {
    id: 'stripe-dev',
    name: 'Stripe Dev',
    description: 'Blog websites can be thoughtful',
    url: 'https://stripe.dev/',
    category: 'Site'
  },
  {
    id: 'lovi',
    name: 'Lovi',
    description: 'So simple landing page',
    url: 'https://lovi.care/',
    category: 'Site'
  },
  {
    id: 'clay',
    name: 'Clay',
    description: 'Top notch product & website design',
    url: 'https://clay.earth/',
    category: 'Site'
  },
  {
    id: 'alan-menken',
    name: 'Alan Menken',
    description: 'Portfolio of a award winning songwriter',
    url: 'https://www.alanmenken.com/',
    category: 'Site'
  },
  {
    id: 'curated-supply',
    name: 'Curated Supply',
    description: 'All the things I wish to own someday',
    url: 'https://curated.supply',
    category: 'Site'
  },
  {
    id: 'departure-mono',
    name: 'Departure Mono',
    description: 'Beautiful pixel mono font',
    url: 'https://departuremono.com/',
    category: 'Font'
  },
  {
    id: 'geist',
    name: 'Geist & Geist Mono',
    description: 'Product font I blindly use',
    url: 'https://vercel.com/font',
    category: 'Font'
  }
];
