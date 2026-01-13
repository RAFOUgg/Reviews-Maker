const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../client/src');

function fixDeepImports(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // Calculer la profondeur depuis src/
    const rel = path.relative(srcDir, filePath);
    const depth = rel.split(path.sep).length - 1;

    if (depth >= 3) {
        // Fichiers 3+ niveaux de profondeur (ex: pages/review/CreateFlowerReview/index.jsx)
        const correctPrefix = '../'.repeat(depth);

        // Fixer hooks, store, utils, etc.
        const patterns = [
            { from: /from ['"]\.\.\/\.\.\/store\//g, to: `from '${correctPrefix}store/` },
            { from: /from ['"]\.\.\/\.\.\/hooks\//g, to: `from '${correctPrefix}hooks/` },
            { from: /from ['"]\.\.\/\.\.\/services\//g, to: `from '${correctPrefix}services/` },
            { from: /from ['"]\.\.\/\.\.\/utils\//g, to: `from '${correctPrefix}utils/` },
            { from: /from ['"]\.\.\/\.\.\/data\//g, to: `from '${correctPrefix}data/` },
            { from: /from ['"]\.\.\/\.\.\/lib\//g, to: `from '${correctPrefix}lib/` },
            { from: /from ['"]\.\.\/\.\.\/types\//g, to: `from '${correctPrefix}types/` },
            { from: /from ['"]\.\.\/\.\.\/config\//g, to: `from '${correctPrefix}config/` },
        ];

        patterns.forEach(({ from, to }) => {
            if (from.test(content)) {
                content = content.replace(from, to);
                changed = true;
            }
        });
    }

    if (changed) {
        fs.writeFileSync(filePath, content);
        return true;
    }
    return false;
}

function walkDir(dir, callback) {
    if (!fs.existsSync(dir)) return;

    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            if (!file.startsWith('.') && file !== 'node_modules') {
                walkDir(fullPath, callback);
            }
        } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
            callback(fullPath);
        }
    });
}

console.log('🔧 Correction des imports en profondeur...\n');

let fixed = 0;
walkDir(srcDir, (filePath) => {
    if (fixDeepImports(filePath)) {
        const rel = path.relative(srcDir, filePath);
        console.log(`✓ ${rel}`);
        fixed++;
    }
});

console.log(`\n✅ ${fixed} fichiers corrigés\n`);
