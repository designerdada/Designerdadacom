import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { siteConfig } from './site-config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get all MDX files
const contentDir = path.join(__dirname, '../content/writing');
const mdxFiles = fs.readdirSync(contentDir).filter(file =>
  file.endsWith('.mdx') && !file.startsWith('_')
);

// Function to parse frontmatter and content from MDX
const parseMDX = (filePath) => {
  const content = fs.readFileSync(filePath, 'utf-8');
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);

  if (!frontmatterMatch) return null;

  const frontmatter = {};
  const frontmatterLines = frontmatterMatch[1].split('\n');

  frontmatterLines.forEach(line => {
    const match = line.match(/^(\w+):\s*(.+)$/);
    if (match) {
      frontmatter[match[1]] = match[2].trim();
    }
  });

  return {
    metadata: frontmatter,
    content: frontmatterMatch[2].trim()
  };
};

// Generate llms-full.txt content
const generateLLMSTxt = () => {
  const { url, name, author, social } = siteConfig;

  let txt = `# ${name}\n\n`;
  txt += `${author.shortBio}\n\n`;
  txt += `> ${url}\n\n`;
  txt += '---\n\n';

  txt += '## About\n\n';
  txt += `I'm ${author.name} (${author.handle}), ${author.bio}\n\n`;
  txt += 'I write about design, building products, and the startup journey. ';
  txt += 'When not designing, I shoot street photography on film.\n\n';
  txt += '---\n\n';

  txt += '## Navigation\n\n';
  txt += `- Home: ${url}\n`;
  txt += `- Writing: ${url}/writing\n`;
  txt += `- Favorites: ${url}/favorites\n\n`;
  txt += '---\n\n';

  txt += '## Articles\n\n';

  // Add each article
  mdxFiles.forEach(file => {
    const filePath = path.join(contentDir, file);
    const article = parseMDX(filePath);

    if (article) {
      const slug = file.replace('.mdx', '');
      txt += `### ${article.metadata.title}\n\n`;
      txt += `URL: ${url}/writing/${slug}\n`;
      txt += `Published: ${article.metadata.publishDate}\n`;
      if (article.metadata.description) {
        txt += `Description: ${article.metadata.description}\n`;
      }
      txt += '\n';
      txt += article.content;
      txt += '\n\n---\n\n';
    }
  });

  txt += '## Contact\n\n';
  txt += `Email: ${author.email}\n`;
  txt += `Peerlist: ${social.peerlist}\n`;
  txt += `X (Twitter): ${social.twitter}\n`;
  txt += `Instagram: ${social.instagram}\n`;

  return txt;
};

// Write llms-full.txt to public folder
const llmsTxtPath = path.join(__dirname, '../../public/llms-full.txt');
const llmsTxt = generateLLMSTxt();
fs.writeFileSync(llmsTxtPath, llmsTxt);

console.log(`✅ llms-full.txt generated with ${mdxFiles.length} articles`);
console.log(`📍 Location: public/llms-full.txt`);
