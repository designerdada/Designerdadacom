#!/usr/bin/env node
/**
 * Migration script to update photos.json URLs to use Cloudflare Image Resizing
 *
 * Usage:
 * 1. Download photos.json from R2 bucket
 * 2. Run: node migrate-photos.js photos.json
 * 3. Upload the generated photos-migrated.json back to R2 as photos.json
 */

const fs = require('fs');
const path = require('path');

const inputFile = process.argv[2] || 'photos.json';

if (!fs.existsSync(inputFile)) {
  console.error(`Error: ${inputFile} not found`);
  console.error('Usage: node migrate-photos.js <photos.json>');
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(inputFile, 'utf8'));

// Transform each photo's URLs
data.photos = data.photos.map(photo => {
  // Extract the original path from any of the URLs
  // Current format: https://cdn.designerdada.com/photos/{id}/original.jpg
  const urlMatch = photo.urls.thumbnail.match(/\/photos\/([^/]+)\/original\.(\w+)$/);

  if (!urlMatch) {
    console.warn(`Warning: Could not parse URL for photo ${photo.id}, skipping`);
    return photo;
  }

  const [, photoId, extension] = urlMatch;
  const baseUrl = photo.urls.thumbnail.split('/photos/')[0];
  const originalPath = `photos/${photoId}/original.${extension}`;

  return {
    ...photo,
    urls: {
      thumbnail: `${baseUrl}/cdn-cgi/image/width=300,quality=80,format=auto/${originalPath}`,
      medium: `${baseUrl}/cdn-cgi/image/width=800,quality=80,format=auto/${originalPath}`,
      large: `${baseUrl}/cdn-cgi/image/width=1600,quality=85,format=auto/${originalPath}`,
    }
  };
});

const outputFile = inputFile.replace('.json', '-migrated.json');
fs.writeFileSync(outputFile, JSON.stringify(data, null, 2));

console.log(`✓ Migrated ${data.photos.length} photos`);
console.log(`✓ Output written to ${outputFile}`);
console.log('\nNext steps:');
console.log('1. Review the migrated file');
console.log('2. Upload to R2 as photos.json');
