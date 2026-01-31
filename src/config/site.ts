/**
 * Site Configuration
 *
 * This file contains all personal/site-specific information.
 * When forking this project, update these values to match your own.
 */

export const siteConfig = {
  // Basic site info
  name: "designerdada.com",
  title: "Akash Bhadange",
  description:
    "Product designer, founder, and photographer. Building Peerlist and AutoSend.",
  url: "https://designerdada.com",

  // Author info
  author: {
    name: "Akash Bhadange",
    handle: "@designerdada",
    email: "akash@peerlist.io",
    bio: "Product designer and founder building Peerlist and AutoSend. Over the past 15 years, I've focused on designing beautiful software that people love to use.",
    shortBio:
      "Product designer, founder, and photographer. Building Peerlist and AutoSend.",
  },

  // Social links
  social: {
    twitter: "https://x.com/designerdada",
    peerlist: "https://peerlist.io/designerdada",
    instagram: "https://instagram.com/retrolens.me",
    github: "https://github.com/designerdada/Designerdadacom",
  },

  // Featured projects/companies
  projects: {
    peerlist: "https://peerlist.io",
    autosend: "https://autosend.com",
    photography: "https://retrolens.me",
  },

  // Default images
  images: {
    profile: "/assets/profile.png",
    ogDefault: "/assets/og-images/og-home.jpg",
    ogWriting: "/assets/og-images/og-writing.jpg",
    ogFavorites: "/assets/og-images/og-favorites.jpg",
    ogPhotography: "/assets/og-images/og-photography.jpg",
    footerSignature: "/assets/footer-signature.png",
  },
};

// Helper to get full URL for images
export function getImageUrl(path: string): string {
  if (path.startsWith("http")) return path;
  return `${siteConfig.url}${path}`;
}

// Helper to get canonical URL
export function getCanonicalUrl(path: string = ""): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${siteConfig.url}${cleanPath}`;
}
