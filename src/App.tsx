import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Writing } from './pages/Writing';
import { WritingDetail } from './pages/WritingDetail';
import { Favorites } from './pages/Favorites';
import { Helmet } from 'react-helmet';

export default function App() {
  return (
    <Router>
      <Helmet>
        <title>Akash Bhadange aka @designerdada</title>
        <meta 
          name="description" 
          content="Product designer, founder, and photographer based in San Francisco. Currently building Peerlist and AutoSend." 
        />
        <meta name="author" content="Akash Bhadange" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <html lang="en" />
        
        {/* Open Graph / Social Media */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Akash Bhadange aka @designerdada" />
        <meta property="og:description" content="Product designer, founder, and photographer based in San Francisco. Currently building Peerlist and AutoSend." />
        <meta property="og:site_name" content="designerdada.com" />
        <meta property="og:url" content="https://designerdada.com" />
        <meta property="og:image" content="https://designerdada.com/media/og-images/og-home.jpg" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:creator" content="@designerdada" />
        <meta name="twitter:site" content="@designerdada" />
        <meta name="twitter:title" content="Akash Bhadange aka @designerdada" />
        <meta name="twitter:description" content="Product designer, founder, and photographer based in San Francisco. Currently building Peerlist and AutoSend." />
        <meta name="twitter:image" content="https://designerdada.com/media/og-images/og-home.jpg" />
        
        {/* Theme color */}
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#000000" media="(prefers-color-scheme: dark)" />
        
        {/* JSON-LD Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Person",
                "@id": "https://designerdada.com/#person",
                "name": "Akash Bhadange",
                "alternateName": "@designerdada",
                "url": "https://designerdada.com",
                "image": "https://designerdada.com/profile-image.jpg",
                "jobTitle": "Product Designer & Founder",
                "description": "Product designer, founder, and photographer based in San Francisco. Currently building Peerlist and AutoSend.",
                "address": {
                  "@type": "PostalAddress",
                  "addressLocality": "San Francisco",
                  "addressRegion": "CA",
                  "addressCountry": "US"
                },
                "sameAs": [
                  "https://twitter.com/designerdada",
                  "https://peerlist.io/designerdada"
                ]
              },
              {
                "@type": "WebSite",
                "@id": "https://designerdada.com/#website",
                "url": "https://designerdada.com",
                "name": "Akash Bhadange - @designerdada",
                "description": "Product designer, founder, and photographer based in San Francisco. Currently building Peerlist and AutoSend.",
                "publisher": {
                  "@id": "https://designerdada.com/#person"
                },
                "inLanguage": "en-US"
              }
            ]
          })}
        </script>
      </Helmet>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/writing" element={<Writing />} />
        <Route path="/writing/:id" element={<WritingDetail />} />
        <Route path="/press" element={<Home />} />
        <Route path="/favorites" element={<Favorites />} />
      </Routes>
    </Router>
  );
}