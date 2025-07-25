#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('📁 Starting project reorganization...\n');

// Define the new folder structure
const newStructure = {
  'client/src': {
    'app': {
      'layout': [],
      'pages': [],
      'providers': []
    },
    'shared': {
      'components': {
        'ui': [],
        'forms': [],
        'layout': [],
        'feedback': []
      },
      'hooks': [],
      'utils': [],
      'types': [],
      'constants': [],
      'schemas': []
    },
    'features': {
      'auth': {
        'components': [],
        'hooks': [],
        'services': [],
        'types': []
      },
      'posts': {
        'components': [],
        'hooks': [],
        'services': [],
        'types': []
      },
      'comments': {
        'components': [],
        'hooks': [],
        'services': [],
        'types': []
      },
      'admin': {
        'components': [],
        'hooks': [],
        'services': [],
        'types': []
      },
      'reader': {
        'components': [],
        'hooks': [],
        'services': [],
        'types': []
      }
    },
    'core': {
      'api': [],
      'config': [],
      'services': [],
      'lib': []
    },
    'assets': {
      'styles': [],
      'images': [],
      'fonts': [],
      'icons': []
    }
  },
  'server/src': {
    'app': [],
    'features': {
      'auth': {
        'controllers': [],
        'services': [],
        'middleware': [],
        'routes': []
      },
      'posts': {
        'controllers': [],
        'services': [],
        'middleware': [],
        'routes': []
      },
      'comments': {
        'controllers': [],
        'services': [],
        'middleware': [],
        'routes': []
      },
      'admin': {
        'controllers': [],
        'services': [],
        'middleware': [],
        'routes': []
      }
    },
    'shared': {
      'middleware': [],
      'utils': [],
      'types': [],
      'constants': [],
      'database': [],
      'config': []
    },
    'infrastructure': {
      'database': [],
      'email': [],
      'storage': [],
      'cache': []
    }
  },
  'shared': {
    'types': [],
    'schemas': [],
    'constants': [],
    'utils': []
  }
};

// File mapping rules
const fileMappings = [
  // Client reorganization
  {
    pattern: /client\/src\/pages\/(.*)/,
    destination: 'client/src/app/pages/$1',
    condition: file => !file.includes('admin')
  },
  {
    pattern: /client\/src\/pages\/admin\/(.*)/,
    destination: 'client/src/features/admin/components/$1'
  },
  {
    pattern: /client\/src\/components\/ui\/(.*)/,
    destination: 'client/src/shared/components/ui/$1'
  },
  {
    pattern: /client\/src\/components\/forms\/(.*)/,
    destination: 'client/src/shared/components/forms/$1'
  },
  {
    pattern: /client\/src\/components\/layout\/(.*)/,
    destination: 'client/src/shared/components/layout/$1'
  },
  {
    pattern: /client\/src\/components\/(?!ui|forms|layout)(.*)/,
    destination: 'client/src/shared/components/$1'
  },
  {
    pattern: /client\/src\/hooks\/(.*auth.*)/i,
    destination: 'client/src/features/auth/hooks/$1'
  },
  {
    pattern: /client\/src\/hooks\/(.*post.*)/i,
    destination: 'client/src/features/posts/hooks/$1'
  },
  {
    pattern: /client\/src\/hooks\/(.*comment.*)/i,
    destination: 'client/src/features/comments/hooks/$1'
  },
  {
    pattern: /client\/src\/hooks\/(.*)/,
    destination: 'client/src/shared/hooks/$1'
  },
  {
    pattern: /client\/src\/services\/(.*auth.*)/i,
    destination: 'client/src/features/auth/services/$1'
  },
  {
    pattern: /client\/src\/services\/(.*post.*|.*wordpress.*)/i,
    destination: 'client/src/features/posts/services/$1'
  },
  {
    pattern: /client\/src\/services\/(.*)/,
    destination: 'client/src/core/services/$1'
  },
  {
    pattern: /client\/src\/utils\/(.*)/,
    destination: 'client/src/shared/utils/$1'
  },
  {
    pattern: /client\/src\/types\/(.*)/,
    destination: 'client/src/shared/types/$1'
  },
  {
    pattern: /client\/src\/config\/(.*)/,
    destination: 'client/src/core/config/$1'
  },
  {
    pattern: /client\/src\/lib\/(.*)/,
    destination: 'client/src/core/lib/$1'
  },
  {
    pattern: /client\/src\/contexts\/(.*)/,
    destination: 'client/src/app/providers/$1'
  },
  {
    pattern: /client\/src\/styles\/(.*)/,
    destination: 'client/src/assets/styles/$1'
  },

  // Server reorganization
  {
    pattern: /server\/(auth|oauth)\.ts/,
    destination: 'server/src/features/auth/services/$1.ts'
  },
  {
    pattern: /server\/routes\.ts/,
    destination: 'server/src/app/routes.ts'
  },
  {
    pattern: /server\/index\.ts/,
    destination: 'server/src/app/server.ts'
  },
  {
    pattern: /server\/storage\.ts/,
    destination: 'server/src/infrastructure/database/storage.ts'
  },
  {
    pattern: /server\/db\.ts/,
    destination: 'server/src/infrastructure/database/connection.ts'
  },
  {
    pattern: /server\/middleware\/(.*auth.*)/i,
    destination: 'server/src/features/auth/middleware/$1'
  },
  {
    pattern: /server\/middleware\/(.*)/,
    destination: 'server/src/shared/middleware/$1'
  },
  {
    pattern: /server\/utils\/(.*email.*)/i,
    destination: 'server/src/infrastructure/email/$1'
  },
  {
    pattern: /server\/utils\/(.*)/,
    destination: 'server/src/shared/utils/$1'
  },
  {
    pattern: /server\/config\/(.*)/,
    destination: 'server/src/shared/config/$1'
  }
];

// Create directory structure
function createDirectoryStructure() {
  console.log('📁 Creating new directory structure...');
  
  function createDirs(structure, basePath = '') {
    Object.entries(structure).forEach(([dir, contents]) => {
      const fullPath = path.join(basePath, dir);
      
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }
      
      if (typeof contents === 'object' && !Array.isArray(contents)) {
        createDirs(contents, fullPath);
      }
    });
  }
  
  createDirs(newStructure);
  console.log('✅ Directory structure created');
}

// Find all files to move
function findFilesToMove() {
  const files = [];
  
  function walkDir(dir, basePath = '') {
    if (!fs.existsSync(dir)) return;
    
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.join(basePath, entry.name);
      
      if (entry.isDirectory()) {
        if (!['node_modules', '.git', 'dist', 'build'].includes(entry.name)) {
          walkDir(fullPath, relativePath);
        }
      } else if (entry.isFile()) {
        if (['.ts', '.tsx', '.js', '.jsx', '.css', '.scss'].includes(path.extname(entry.name))) {
          files.push({
            current: relativePath,
            full: fullPath
          });
        }
      }
    }
  }
  
  // Walk client and server directories
  ['client/src', 'server'].forEach(dir => {
    if (fs.existsSync(dir)) {
      walkDir(dir, dir);
    }
  });
  
  return files;
}

// Apply file mappings
function applyFileMappings(files) {
  console.log('📋 Planning file moves...');
  const moves = [];
  
  files.forEach(file => {
    for (const mapping of fileMappings) {
      const match = file.current.match(mapping.pattern);
      if (match) {
        if (!mapping.condition || mapping.condition(file.current)) {
          const destination = mapping.destination.replace(/\$(\d+)/g, (_, index) => match[index] || '');
          
          moves.push({
            from: file.current,
            to: destination,
            fullFrom: file.full
          });
          break;
        }
      }
    }
  });
  
  return moves;
}

// Update import paths in files
function updateImportPaths(filePath, moves) {
  if (!fs.existsSync(filePath)) return;
  
  const content = fs.readFileSync(filePath, 'utf8');
  let updatedContent = content;
  
  // Create a mapping of old paths to new paths
  const pathMapping = {};
  moves.forEach(move => {
    const oldPath = move.from.replace(/\.(ts|tsx|js|jsx)$/, '');
    const newPath = move.to.replace(/\.(ts|tsx|js|jsx)$/, '');
    pathMapping[oldPath] = newPath;
  });
  
  // Update import statements
  const importRegex = /import\s+(?:(?:\{[^}]*\}|\w+|\*\s+as\s+\w+)\s+from\s+)?['"`]([^'"`]+)['"`]/g;
  
  updatedContent = updatedContent.replace(importRegex, (match, importPath) => {
    // Handle relative imports
    if (importPath.startsWith('.')) {
      const currentDir = path.dirname(filePath);
      const absoluteImportPath = path.resolve(currentDir, importPath);
      const relativeImportPath = path.relative(process.cwd(), absoluteImportPath);
      
      // Check if this import needs to be updated
      const newPath = pathMapping[relativeImportPath.replace(/\\/g, '/')];
      if (newPath) {
        const newRelativePath = path.relative(path.dirname(filePath), newPath);
        return match.replace(importPath, newRelativePath.startsWith('.') ? newRelativePath : `./${newRelativePath}`);
      }
    }
    
    // Handle absolute imports (alias-based)
    Object.entries(pathMapping).forEach(([oldPath, newPath]) => {
      if (importPath.includes(oldPath)) {
        updatedContent = updatedContent.replace(importPath, importPath.replace(oldPath, newPath));
      }
    });
    
    return match;
  });
  
  if (updatedContent !== content) {
    fs.writeFileSync(filePath, updatedContent);
  }
}

// Create index files for better imports
function createIndexFiles() {
  console.log('📝 Creating index files...');
  
  const indexFiles = [
    {
      path: 'client/src/shared/components/index.ts',
      exports: [
        "export * from './ui';",
        "export * from './forms';",
        "export * from './layout';",
        "export * from './feedback';"
      ]
    },
    {
      path: 'client/src/shared/hooks/index.ts',
      exports: ["export * from './use-auth';", "export * from './use-toast';"]
    },
    {
      path: 'client/src/shared/utils/index.ts',
      exports: ["export * from './cn';", "export * from './format';"]
    },
    {
      path: 'client/src/features/auth/index.ts',
      exports: [
        "export * from './components';",
        "export * from './hooks';",
        "export * from './services';",
        "export * from './types';"
      ]
    },
    {
      path: 'client/src/features/posts/index.ts',
      exports: [
        "export * from './components';",
        "export * from './hooks';",
        "export * from './services';",
        "export * from './types';"
      ]
    },
    {
      path: 'server/src/features/auth/index.ts',
      exports: [
        "export * from './services';",
        "export * from './middleware';",
        "export * from './routes';"
      ]
    }
  ];
  
  indexFiles.forEach(({ path: filePath, exports }) => {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(filePath, exports.join('\n') + '\n');
  });
}

// Update TypeScript path aliases
function updateTSConfig() {
  console.log('⚙️  Updating TypeScript configuration...');
  
  const tsConfigPath = 'tsconfig.json';
  if (!fs.existsSync(tsConfigPath)) return;
  
  const tsConfig = JSON.parse(fs.readFileSync(tsConfigPath, 'utf8'));
  
  // Update path aliases
  tsConfig.compilerOptions.paths = {
    "@/*": ["client/src/*"],
    "@/app/*": ["client/src/app/*"],
    "@/shared/*": ["client/src/shared/*"],
    "@/features/*": ["client/src/features/*"],
    "@/core/*": ["client/src/core/*"],
    "@/assets/*": ["client/src/assets/*"],
    "@server/*": ["server/src/*"],
    "@server/shared/*": ["server/src/shared/*"],
    "@server/features/*": ["server/src/features/*"],
    "@server/infrastructure/*": ["server/src/infrastructure/*"]
  };
  
  fs.writeFileSync(tsConfigPath, JSON.stringify(tsConfig, null, 2));
}

// Create .gitkeep files for empty directories
function createGitKeepFiles() {
  console.log('📌 Adding .gitkeep files...');
  
  function addGitKeep(structure, basePath = '') {
    Object.entries(structure).forEach(([dir, contents]) => {
      const fullPath = path.join(basePath, dir);
      
      if (Array.isArray(contents) && fs.existsSync(fullPath)) {
        const files = fs.readdirSync(fullPath);
        if (files.length === 0) {
          fs.writeFileSync(path.join(fullPath, '.gitkeep'), '');
        }
      } else if (typeof contents === 'object') {
        addGitKeep(contents, fullPath);
      }
    });
  }
  
  addGitKeep(newStructure);
}

// Generate migration report
function generateMigrationReport(moves) {
  console.log('📊 Generating migration report...');
  
  const report = [
    '# Project Reorganization Report',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
    '## Summary',
    '',
    `- Total files moved: ${moves.length}`,
    '- New folder structure implemented',
    '- TypeScript paths updated',
    '- Index files created',
    '',
    '## File Moves',
    '',
    ...moves.map(move => `- \`${move.from}\` → \`${move.to}\``),
    '',
    '## New Structure Benefits',
    '',
    '- **Feature-based organization**: Related files grouped together',
    '- **Clear separation of concerns**: UI, logic, and data layers separated',
    '- **Better maintainability**: Easier to find and modify code',
    '- **Improved scalability**: Structure supports growth',
    '- **Enhanced developer experience**: Logical file organization',
    '',
    '## Next Steps',
    '',
    '1. Run `npm run check` to verify TypeScript compilation',
    '2. Update any remaining import paths manually',
    '3. Test the application thoroughly',
    '4. Update documentation to reflect new structure',
    ''
  ].join('\n');
  
  fs.writeFileSync('reorganization-report.md', report);
}

// Main reorganization function
async function reorganize() {
  try {
    console.log('🚨 This will reorganize your entire project structure!');
    console.log('📦 Make sure you have committed your changes first.\n');
    
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    readline.question('Proceed with reorganization? (y/N): ', (answer) => {
      if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
        console.log('\n🏗️  Starting reorganization...\n');
        
        // Create new structure
        createDirectoryStructure();
        
        // Find files to move
        const files = findFilesToMove();
        const moves = applyFileMappings(files);
        
        console.log(`📋 Planning to move ${moves.length} files...\n`);
        
        // Create backup
        console.log('📦 Creating backup...');
        if (fs.existsSync('.reorganization-backup')) {
          execSync('rm -rf .reorganization-backup');
        }
        execSync('cp -r client .reorganization-backup-client');
        execSync('cp -r server .reorganization-backup-server');
        
        // Move files
        console.log('📁 Moving files...');
        moves.forEach(move => {
          const destDir = path.dirname(move.to);
          if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
          }
          
          if (fs.existsSync(move.fullFrom)) {
            fs.copyFileSync(move.fullFrom, move.to);
            fs.unlinkSync(move.fullFrom);
          }
        });
        
        // Update imports in all files
        console.log('🔄 Updating import paths...');
        const allFiles = findFilesToMove();
        allFiles.forEach(file => {
          if (fs.existsSync(file.full)) {
            updateImportPaths(file.full, moves);
          }
        });
        
        // Create supporting files
        createIndexFiles();
        updateTSConfig();
        createGitKeepFiles();
        generateMigrationReport(moves);
        
        // Cleanup empty directories
        console.log('🧹 Cleaning up empty directories...');
        try {
          execSync('find client/src server -type d -empty -delete 2>/dev/null || true');
        } catch (e) {
          // Ignore errors from find command
        }
        
        console.log('\n✅ Reorganization completed!');
        console.log('\n📝 What was done:');
        console.log(`  - Moved ${moves.length} files to new structure`);
        console.log('  - Updated import paths');
        console.log('  - Created index files for better imports');
        console.log('  - Updated TypeScript configuration');
        console.log('  - Added .gitkeep files for empty directories');
        console.log('\n📋 Check reorganization-report.md for details');
        console.log('💡 Run `npm run check` to verify everything works');
        console.log('📦 Backup created: .reorganization-backup-*');
        
      } else {
        console.log('❌ Reorganization cancelled');
      }
      
      readline.close();
    });
    
  } catch (error) {
    console.error('💥 Reorganization failed:', error.message);
    process.exit(1);
  }
}

// Run reorganization
if (require.main === module) {
  reorganize();
}

module.exports = {
  createDirectoryStructure,
  findFilesToMove,
  applyFileMappings,
  generateMigrationReport
};