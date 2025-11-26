# og:image Configuration Guide

This guide shows you exactly where to update all og:image URLs in your personal website.

## 📍 All og:image Locations

### 1. **Home Page** - `/App.tsx`
**Lines:** 27 & 35

```typescript
<meta property="og:image" content="https://designerdada.com/media/og-images/og-home.jpg" />
...
<meta name="twitter:image" content="https://designerdada.com/media/og-images/og-home.jpg" />
```

**Purpose:** Image shown when home page is shared on social media

---

### 2. **Writing Page** - `/pages/Writing.tsx`
**Lines:** 92 & 98

```typescript
<meta property="og:image" content="https://designerdada.com/media/og-images/og-writing.jpg" />
...
<meta name="twitter:image" content="https://designerdada.com/media/og-images/og-writing.jpg" />
```

**Purpose:** Image shown when writing index page is shared on social media

---

### 3. **Favorites Page** - `/pages/Favorites.tsx`
**Lines:** 271 & 277

```typescript
<meta property="og:image" content="https://designerdada.com/media/og-images/og-favorites.jpg" />
...
<meta name="twitter:image" content="https://designerdada.com/media/og-images/og-favorites.jpg" />
```

**Purpose:** Image shown when favorites page is shared on social media

---

### 4. **Individual Articles** - `/data/articleContent.ts`

Each article has its own `ogImage` field in the metadata:

```typescript
export const articleContents: Record<string, ArticleData> = {
  'design-is-the-moat': {
    metadata: {
      title: 'Design Is The Moat',
      description: '...',
      publishDate: '15.Nov.2025',
      modifiedDate: '15.Nov.2025',
      author: 'Akash Bhadange',
      ogImage: 'https://designerdada.com/media/og-images/design-is-the-moat.jpg', // ← Update this
      keywords: 'design, product design, AI, prototyping, startups'
    },
    content: `...`
  },
  'getting-started': {
    metadata: {
      // ...other fields
      ogImage: 'https://designerdada.com/media/og-images/getting-started.jpg', // ← Update this
      // ...
    }
  }
  // Add more articles...
}
```

---

### 5. **Article Fallback** - `/pages/WritingDetail.tsx`
**Line:** 159

```typescript
const ogImage = articleData.metadata.ogImage || 'https://designerdada.com/media/og-images/og-default.jpg';
```

**Purpose:** Default image used when an article doesn't have a specific `ogImage` defined

---

## 🎨 og:image Specifications

### Optimal Dimensions
- **Size:** 1200 x 630 pixels
- **Aspect Ratio:** 1.91:1
- **Format:** JPG or PNG
- **Max File Size:** < 8MB (< 5MB recommended)

### Platform-Specific Requirements
- **Facebook:** 1200 x 630px minimum
- **Twitter:** 1200 x 675px (16:9) or 1200 x 600px (2:1)
- **LinkedIn:** 1200 x 627px

**Note:** 1200 x 630px works perfectly for all platforms!

---

## 🚀 Quick Setup Options

### Option 1: Single Default Image (Easiest)
1. Create one default og-image (1200 x 630px)
2. Save as `/public/og-default.jpg`
3. Update all URLs to: `https://yourdomain.com/og-default.jpg`

### Option 2: Page-Specific Images (Recommended)
1. Create 3 images for main pages:
   - `og-home.jpg` (Home page)
   - `og-writing.jpg` (Writing page)
   - `og-favorites.jpg` (Favorites page)
2. Create `og-default.jpg` for articles without specific images
3. Save in `/public/` directory
4. Update URLs in the files listed above

### Option 3: Unique Images Per Article (Best for SEO)
1. Create unique images for each article
2. Save as `/public/og-images/article-slug.jpg`
3. Update each article's `ogImage` in `/data/articleContent.ts`
4. Articles without custom images will use the fallback

### Option 4: Dynamic OG Images (Advanced)
Use services like:
- **Vercel OG Image Generation** - https://vercel.com/docs/functions/og-image-generation
- **Cloudinary** - Dynamic image transformation
- **imgix** - URL-based image manipulation

---

## ✅ Testing Your og:images

### Online Tools
1. **Facebook Sharing Debugger:** https://developers.facebook.com/tools/debug/
2. **Twitter Card Validator:** https://cards-dev.twitter.com/validator
3. **LinkedIn Post Inspector:** https://www.linkedin.com/post-inspector/
4. **OpenGraph.xyz:** https://www.opengraph.xyz/

### What to Check
- [ ] Image loads correctly
- [ ] Dimensions are 1200 x 630px
- [ ] File size is reasonable (< 5MB)
- [ ] Image looks good when cropped
- [ ] Text is readable on social media preview

---

## 📝 File Structure Recommendation

```
/public
  └── media/
      └── og-images/           # All og:images go here
          ├── og-home.jpg          # Home page (1200 x 630px)
          ├── og-writing.jpg       # Writing page (1200 x 630px)
          ├── og-favorites.jpg     # Favorites page (1200 x 630px)
          ├── og-default.jpg       # Default fallback (1200 x 630px)
          ├── design-is-the-moat.jpg    # Article-specific images
          ├── getting-started.jpg
          └── ...
```

**📂 Your folder is ready!**  
Upload your og:images to `/public/media/og-images/` and they'll automatically work with the configured URLs.

---

## 🎯 Quick Replace Checklist

Before deploying, update these URLs from `designerdada.com` to your domain:

- [ ] `/App.tsx` - Lines 27, 35 (Home page og:image)
- [ ] `/pages/Writing.tsx` - Lines 92, 98 (Writing page og:image)
- [ ] `/pages/Favorites.tsx` - Lines 271, 277 (Favorites page og:image)
- [ ] `/pages/WritingDetail.tsx` - Line 159 (Article fallback og:image)
- [ ] `/data/articleContent.ts` - Each article's `ogImage` field

---

## 💡 Design Tips for og:images

1. **Include your brand/logo** - Make it recognizable
2. **Use large, readable text** - Mobile previews are small
3. **High contrast** - Ensures readability
4. **Avoid edges** - Some platforms crop edges
5. **Test on dark/light backgrounds** - Consider both themes
6. **Keep it simple** - Less is more for social sharing

---

## 🔍 Common Issues

### Image not showing
- Check file path and URL
- Ensure image is publicly accessible
- Clear social media cache using debugger tools
- Wait 24-48 hours for cache to update

### Wrong image showing
- Clear social media cache
- Check that URL is correct
- Verify image dimensions

### Blurry image
- Increase image resolution to 1200 x 630px
- Use PNG for better quality (but larger file size)
- Optimize with tools like TinyPNG

---

**Need Help?** Check the `/PRODUCTION_CHECKLIST.md` for more deployment guidance!