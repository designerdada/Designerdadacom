/**
 * Script to fix versioned imports in component files
 * Removes @version from all import statements
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const COMPONENTS_DIR = path.join(__dirname, '../components');

function fixImportsInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;
  const originalContent = content;

  // Fix all versioned imports at once with a comprehensive pattern
  // Matches: from "package@version" or from 'package@version'
  const versionedImportPattern = /from\s+(['"])([^'"]+)@[\d.]+\1/g;
  if (content.match(versionedImportPattern)) {
    content = content.replace(versionedImportPattern, (match, quote, packageName) => {
      return `from ${quote}${packageName}${quote}`;
    });
    modified = true;
  }

  if (modified && content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`✅ Fixed: ${path.relative(path.join(__dirname, '..'), filePath)}`);
    return true;
  }
  
  return false;
}

function processDirectory(dir) {
  if (!fs.existsSync(dir)) {
    console.log(`⚠️  Directory not found: ${dir}`);
    return 0;
  }

  const files = fs.readdirSync(dir);
  let fixedCount = 0;

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isFile() && (file.endsWith('.tsx') || file.endsWith('.ts'))) {
      if (fixImportsInFile(filePath)) {
        fixedCount++;
      }
    } else if (stat.isDirectory() && file !== 'node_modules' && file !== '.git') {
      fixedCount += processDirectory(filePath);
    }
  });

  return fixedCount;
}

try {
  console.log('🔍 Scanning for versioned imports in components...\n');
  const fixedCount = processDirectory(COMPONENTS_DIR);
  console.log(`\n✨ Fixed ${fixedCount} file(s) with versioned imports`);
  process.exit(0);
} catch (error) {
  console.error('❌ Error fixing imports:', error);
  process.exit(1);
}