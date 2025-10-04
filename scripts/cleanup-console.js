#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Console cleanup configuration
const CONSOLE_PATTERNS = [
  /console\.log\(/g,
  /console\.warn\(/g,
  /console\.error\(/g,
  /console\.info\(/g,
  /console\.debug\(/g,
];

// Files to exclude from cleanup
const EXCLUDE_PATTERNS = [
  'node_modules/**',
  'build/**',
  'coverage/**',
  '**/*.test.js',
  '**/*.spec.js',
  'scripts/**',
  'src/setupTests.js',
  'src/utils/test-utils.js',
];

// Replacement patterns for different console types
const REPLACEMENTS = {
  'console.log': '// console.log',
  'console.warn': '// console.warn',
  'console.error': '// console.error',
  'console.info': '// console.info',
  'console.debug': '// console.debug',
};

// Critical console statements to keep
const KEEP_PATTERNS = [
  /console\.error.*Error/i,
  /console\.warn.*Warning/i,
  /console\.log.*DEBUG/i,
  /console\.log.*TEST/i,
];

function shouldKeepConsoleStatement(line) {
  return KEEP_PATTERNS.some(pattern => pattern.test(line));
}

function cleanupFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    let changes = 0;

    // Process each console pattern
    CONSOLE_PATTERNS.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const consoleType = match.replace('(', '');
          if (REPLACEMENTS[consoleType]) {
            // Find the full console statement
            const startIndex = content.indexOf(match);
            if (startIndex !== -1) {
              // Find the end of the statement (matching parentheses)
              let parenCount = 0;
              let endIndex = startIndex;
              let inString = false;
              let stringChar = '';

              for (let i = startIndex; i < content.length; i++) {
                const char = content[i];
                
                if (!inString && (char === '"' || char === "'" || char === '`')) {
                  inString = true;
                  stringChar = char;
                } else if (inString && char === stringChar && content[i-1] !== '\\') {
                  inString = false;
                } else if (!inString) {
                  if (char === '(') parenCount++;
                  if (char === ')') parenCount--;
                  if (parenCount === 0) {
                    endIndex = i;
                    break;
                  }
                }
              }

              const fullStatement = content.substring(startIndex, endIndex + 1);
              
              // Check if we should keep this statement
              if (!shouldKeepConsoleStatement(fullStatement)) {
                const replacement = fullStatement.replace(consoleType, REPLACEMENTS[consoleType]);
                content = content.replace(fullStatement, replacement);
                changes++;
              }
            }
          }
        });
      }
    });

    // Write back if changes were made
    if (changes > 0) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Cleaned ${changes} console statements in ${filePath}`);
      return changes;
    }

    return 0;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return 0;
  }
}

function cleanupDirectory(dirPath) {
  const pattern = path.join(dirPath, '**/*.js');
  const files = glob.sync(pattern, { 
    ignore: EXCLUDE_PATTERNS.map(p => path.join(dirPath, p))
  });

  let totalChanges = 0;
  let processedFiles = 0;

  console.log(`🔍 Found ${files.length} JavaScript files to process...`);

  files.forEach(file => {
    const changes = cleanupFile(file);
    totalChanges += changes;
    if (changes > 0) processedFiles++;
  });

  console.log(`\n📊 Console Cleanup Summary:`);
  console.log(`   Files processed: ${files.length}`);
  console.log(`   Files modified: ${processedFiles}`);
  console.log(`   Total console statements removed: ${totalChanges}`);
  
  return { totalChanges, processedFiles, totalFiles: files.length };
}

// Main execution
if (require.main === module) {
  const srcPath = path.join(__dirname, '..', 'src');
  
  if (!fs.existsSync(srcPath)) {
    console.error('❌ src directory not found');
    process.exit(1);
  }

  console.log('🚀 Starting console cleanup...');
  const results = cleanupDirectory(srcPath);
  
  if (results.totalChanges > 0) {
    console.log(`\n✅ Console cleanup completed! Removed ${results.totalChanges} console statements.`);
  } else {
    console.log('\n✅ No console statements found to clean up.');
  }
}

module.exports = { cleanupFile, cleanupDirectory };





