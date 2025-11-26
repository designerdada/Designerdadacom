import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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
  let txt = '# designerdada.com\n\n';
  txt += 'Product designer, founder, and photographer. Building Peerlist and AutoSend.\n\n';
  txt += '> https://designerdada.com\n\n';
  txt += '---\n\n';

  txt += '## About\n\n';
  txt += "I'm Akash Bhadange (@designerdada), a product designer and founder building Peerlist and AutoSend. ";
  txt += "Over the past 15 years, I've focused on designing beautiful software that people love to use.\n\n";
  txt += 'I write about design, building products, and the startup journey. ';
  txt += 'When not designing, I shoot street photography on film with my Leica M6.\n\n';
  txt += '---\n\n';

  txt += '## Navigation\n\n';
  txt += '- Home: https://designerdada.com\n';
  txt += '- Writing: https://designerdada.com/writing\n';
  txt += '- Favorites: https://designerdada.com/favorites\n\n';
  txt += '---\n\n';

  txt += '## Articles\n\n';

  // Add each article
  mdxFiles.forEach(file => {
    const filePath = path.join(contentDir, file);
    const article = parseMDX(filePath);

    if (article) {
      const slug = file.replace('.mdx', '');
      txt += `### ${article.metadata.title}\n\n`;
      txt += `URL: https://designerdada.com/writing/${slug}\n`;
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
  txt += 'Email: akash@peerlist.io\n';
  txt += 'Peerlist: https://peerlist.io/designerdada\n';
  txt += 'X (Twitter): https://x.com/designerdada\n';
  txt += 'Instagram: https://instagram.com/designerdada\n';

  return txt;
};

// Write llms-full.txt to public folder
const llmsTxtPath = path.join(__dirname, '../../public/llms-full.txt');
const llmsTxt = generateLLMSTxt();
fs.writeFileSync(llmsTxtPath, llmsTxt);

console.log(`✅ llms-full.txt generated with ${mdxFiles.length} articles`);
console.log(`📍 Location: public/llms-full.txt`);
