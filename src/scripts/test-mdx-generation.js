/**
 * Test script to verify MDX generation works correctly
 * Run: node scripts/test-mdx-generation.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONTENT_DIR = path.join(__dirname, '../content/writing');
const INDEX_FILE = path.join(CONTENT_DIR, 'index.ts');

console.log('🧪 Testing MDX Generation System\n');

// Test 1: Check if MDX files exist
console.log('Test 1: Checking for MDX files...');
const mdxFiles = fs.readdirSync(CONTENT_DIR)
  .filter(file => file.endsWith('.mdx') && !file.startsWith('_'));

if (mdxFiles.length === 0) {
  console.error('❌ FAIL: No MDX files found in /content/writing/');
  process.exit(1);
}
console.log(`✅ PASS: Found ${mdxFiles.length} MDX file(s)`);
mdxFiles.forEach(file => console.log(`   - ${file}`));

// Test 2: Check if index.ts exists
console.log('\nTest 2: Checking for generated index.ts...');
if (!fs.existsSync(INDEX_FILE)) {
  console.error('❌ FAIL: index.ts not found. Run: npm run generate-mdx');
  process.exit(1);
}
console.log('✅ PASS: index.ts exists');

// Test 3: Validate index.ts content
console.log('\nTest 3: Validating index.ts content...');
const indexContent = fs.readFileSync(INDEX_FILE, 'utf-8');

// Check for exports
const hasExports = mdxFiles.every(file => {
  const slug = path.basename(file, '.mdx');
  const camelCase = slug.split('-')
    .map((word, index) => 
      index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join('');
  return indexContent.includes(`export const ${camelCase}`);
});

if (!hasExports) {
  console.error('❌ FAIL: Not all MDX files are exported in index.ts');
  process.exit(1);
}
console.log('✅ PASS: All MDX files are exported');

// Check for allMDXContent map
if (!indexContent.includes('export const allMDXContent')) {
  console.error('❌ FAIL: allMDXContent export not found');
  process.exit(1);
}
console.log('✅ PASS: allMDXContent map exists');

// Test 4: Validate frontmatter
console.log('\nTest 4: Validating frontmatter in MDX files...');
let allValid = true;

mdxFiles.forEach(file => {
  const filePath = path.join(CONTENT_DIR, file);
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Check for frontmatter
  const hasFrontmatter = /^---\n[\s\S]*?\n---\n/.test(content);
  if (!hasFrontmatter) {
    console.error(`❌ FAIL: ${file} - Missing frontmatter`);
    allValid = false;
    return;
  }
  
  // Extract frontmatter
  const match = content.match(/^---\n([\s\S]*?)\n---\n/);
  const frontmatter = match[1];
  
  // Check required fields
  const requiredFields = ['title:', 'description:', 'publishDate:'];
  const missingFields = requiredFields.filter(field => !frontmatter.includes(field));
  
  if (missingFields.length > 0) {
    console.error(`❌ FAIL: ${file} - Missing fields: ${missingFields.join(', ')}`);
    allValid = false;
  } else {
    console.log(`✅ ${file} - Valid frontmatter`);
  }
});

if (!allValid) {
  process.exit(1);
}

// Test 5: Check articles.ts sync
console.log('\nTest 5: Checking articles.ts synchronization...');
const articlesFile = path.join(__dirname, '../data/articles.ts');
const articlesContent = fs.readFileSync(articlesFile, 'utf-8');

const missingFromArticles = mdxFiles.filter(file => {
  const slug = path.basename(file, '.mdx');
  return !articlesContent.includes(`id: '${slug}'`);
});

if (missingFromArticles.length > 0) {
  console.warn('⚠️  WARNING: Some MDX files are not registered in articles.ts:');
  missingFromArticles.forEach(file => console.warn(`   - ${file}`));
  console.warn('   These articles won\'t appear on the site until added to /data/articles.ts');
} else {
  console.log('✅ PASS: All MDX files are registered in articles.ts');
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('🎉 All tests passed!');
console.log('='.repeat(50));
console.log('\nYour MDX system is working correctly.');
console.log('\nTo add a new article:');
console.log('1. Create /content/writing/your-article.mdx');
console.log('2. Add to /data/articles.ts');
console.log('3. Run: npm run generate-mdx');
console.log('4. Deploy!');
console.log('\nSee /QUICK_START.md for more details.\n');
