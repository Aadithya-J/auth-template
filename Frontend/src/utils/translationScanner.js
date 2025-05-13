import fs from 'fs';
import path from 'path';
import glob from 'glob';

/**
 * Script to scan project files for potential hardcoded text
 * This is meant to be run via Node.js during development
 * 
 * Usage:
 * node translationScanner.js
 */

// Directories to scan (relative to project root)
const SCAN_DIRECTORIES = [
  'src/components',
  'src/pages',
  'src/views'
];

// File extensions to scan
const FILE_EXTENSIONS = ['.jsx', '.js', '.tsx', '.ts'];

// Patterns that might indicate hardcoded text
const TEXT_PATTERNS = [
  // JSX text content
  { pattern: />([A-Za-z][\w\s.,!?:;'"()-]{2,})</g, type: 'JSX text content' },
  
  // Attributes with potential text
  { pattern: /placeholder=["']([^{}]+?)["']/g, type: 'placeholder attribute' },
  { pattern: /title=["']([^{}]+?)["']/g, type: 'title attribute' },
  { pattern: /label=["']([^{}]+?)["']/g, type: 'label attribute' },
  { pattern: /aria-label=["']([^{}]+?)["']/g, type: 'aria-label attribute' },
  { pattern: /alt=["']([^{}]+?)["']/g, type: 'alt attribute' },
  
  // Text in variables
  { pattern: /const\s+\w+\s*=\s*["']([A-Za-z][\w\s.,!?:;'"()-]{2,})["']/g, type: 'string variable' },
  { pattern: /let\s+\w+\s*=\s*["']([A-Za-z][\w\s.,!?:;'"()-]{2,})["']/g, type: 'string variable' },
  { pattern: /var\s+\w+\s*=\s*["']([A-Za-z][\w\s.,!?:;'"()-]{2,})["']/g, type: 'string variable' },
];

// Strings that should be ignored
const IGNORE_STRINGS = [
  'className', 'style', 'href', 'src', 'id', 'type', 'key', 'value',
  'onClick', 'onChange', 'onSubmit', 'onBlur', 'onFocus',
  'flex', 'grid', 'block', 'inline', 'absolute', 'relative',
  'import', 'export', 'default', 'function', 'return',
  'console', 'log', 'error', 'warn', 'info',
  'http', 'https', 'www'
];

// Check if a string is likely to be a code-related string rather than user-facing text
const isCodeString = (str) => {
  if (!str) return true;
  str = str.trim();
  
  // Ignore strings that are too short
  if (str.length < 3) return true;
  
  // Ignore strings that are in the ignore list
  if (IGNORE_STRINGS.some(ignoreStr => str.includes(ignoreStr))) return true;
  
  // Ignore camelCase or snake_case strings that are likely variable names
  if (/^[a-z][a-zA-Z0-9_]+$/.test(str)) return true;
  
  // Ignore strings that are just numbers or dates
  if (/^\d+(\.\d+)?$/.test(str)) return true;
  if (/^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(str)) return true;
  
  // Ignore strings that don't contain any letters (likely CSS values)
  if (!/[a-zA-Z]/.test(str)) return true;
  
  // Ignore if it's a short string with special chars (likely code)
  if (str.length < 5 && /[{}[\]<>(),;:=+\-*/&|^%$#@!~`]/.test(str)) return true;
  
  return false;
};

// Check if a string is already using the translation function
const isUsingTranslation = (fileContent, textMatch) => {
  // Check if this text is inside a t() function call
  const textPos = fileContent.indexOf(textMatch);
  if (textPos === -1) return true; // Can't find the text, something went wrong
  
  const beforeText = fileContent.substring(Math.max(0, textPos - 20), textPos);
  return beforeText.includes('t(') || beforeText.includes('t("') || beforeText.includes("t('");
};

// Scan a file for potential hardcoded text
const scanFile = (filePath) => {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const results = [];
    
    TEXT_PATTERNS.forEach(({ pattern, type }) => {
      const matches = [...fileContent.matchAll(pattern)];
      
      matches.forEach(match => {
        const text = match[1].trim();
        
        // Skip if it's likely code or already using translation
        if (isCodeString(text) || isUsingTranslation(fileContent, match[0])) {
          return;
        }
        
        // Generate a suitable translation key
        const key = text
          .toLowerCase()
          .replace(/[^a-z0-9\s]/g, '')
          .split(/\s+/)
          .filter(word => word.length > 0)
          .map((word, index) => index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1))
          .join('');
        
        results.push({
          filePath: path.relative(process.cwd(), filePath),
          type,
          text,
          suggestedKey: key
        });
      });
    });
    
    return results;
  } catch (error) {
    console.error(`Error scanning ${filePath}:`, error);
    return [];
  }
};

// Main scan function
const scanProject = () => {
  let allResults = [];
  
  SCAN_DIRECTORIES.forEach(dir => {
    const dirPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(dirPath)) {
      console.warn(`Directory does not exist: ${dirPath}`);
      return;
    }
    
    const files = glob.sync(`${dir}/**/*{${FILE_EXTENSIONS.join(',')}}`, { cwd: process.cwd() });
    
    files.forEach(file => {
      const filePath = path.join(process.cwd(), file);
      const fileResults = scanFile(filePath);
      allResults = [...allResults, ...fileResults];
    });
  });
  
  return allResults;
};

// Generate the translation entries
const generateTranslationEntries = (results) => {
  const translationEntries = {
    en: {},
    ta: {}
  };
  
  results.forEach(({ text, suggestedKey }) => {
    if (suggestedKey && !translationEntries.en[suggestedKey]) {
      translationEntries.en[suggestedKey] = text;
      translationEntries.ta[suggestedKey] = `/* TODO: Translate to Tamil */ ${text}`;
    }
  });
  
  return translationEntries;
};

// Output results
const printResults = (results) => {
  if (results.length === 0) {
    console.log('✅ No potential hardcoded text found!');
    return;
  }
  
  console.log(`\n🔍 Found ${results.length} potential hardcoded strings:\n`);
  
  const fileGroups = {};
  results.forEach(result => {
    if (!fileGroups[result.filePath]) {
      fileGroups[result.filePath] = [];
    }
    fileGroups[result.filePath].push(result);
  });
  
  Object.entries(fileGroups).forEach(([filePath, fileResults]) => {
    console.log(`\n📄 ${filePath} (${fileResults.length} strings):`);
    
    fileResults.forEach(({ type, text, suggestedKey }) => {
      console.log(`  • ${type}: "${text}"`);
      console.log(`    Suggested: t("${suggestedKey}")`);
    });
  });
  
  const translationEntries = generateTranslationEntries(results);
  
  console.log('\n📝 Translation entries to add:');
  console.log('\n// English entries');
  Object.entries(translationEntries.en).forEach(([key, text]) => {
    console.log(`${key}: "${text}",`);
  });
  
  console.log('\n// Tamil entries');
  Object.entries(translationEntries.ta).forEach(([key, text]) => {
    console.log(`${key}: "${text}",`);
  });
  
  console.log('\n✅ Scan complete!');
};

// Run the scan
const results = scanProject();
printResults(results);

export default {
  scanProject,
  generateTranslationEntries,
  isCodeString,
  isUsingTranslation
}; 