const fs = require('fs').promises;
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const TARGET = path.join(ROOT, 'client');

// Patterns to remove (bright color utilities commonly used)
const patterns = [
    // background colors
    /\bbg-(?:purple|blue|cyan|indigo|pink|violet|rose|teal|fuchsia)-\d{2,3}(?:\/\d{1,2})?\b/g,
    // gradient stops
    /\bfrom-(?:purple|blue|cyan|indigo|pink|violet)-\d{2,3}\b/g,
    /\bvia-(?:purple|blue|cyan|indigo|pink|violet)-\d{2,3}\b/g,
    /\bto-(?:purple|blue|cyan|indigo|pink|violet)-\d{2,3}\b/g,
    // text colors
    /\btext-(?:purple|blue|cyan|indigo|pink|violet|rose)-\d{2,3}\b/g,
    // hover/bg modifiers
    /\bhover:bg-(?:purple|blue|cyan|indigo|pink|violet)-\d{2,3}\b/g,
    /\bdark:hover:bg-(?:purple|blue|cyan|indigo|pink|violet)-\d{2,3}\/\d{1,2}\b/g,
    /\bhover:text-(?:purple|blue|cyan|indigo|pink|violet)-\d{2,3}\b/g,
    // border/ring
    /\bborder-(?:purple|blue)-\d{2,3}\b/g,
    /\bring-(?:purple|blue)-\d{2,3}\b/g,
    /\bhover:ring-(?:purple|blue)-\d{2,3}\b/g,
    // fractioned opacity utilities
    /\bbg-(?:purple|blue)-\d{2,3}\/\d{1,2}\b/g
];

const excludeDirs = ['node_modules', 'dist', 'public'];

async function walk(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            if (excludeDirs.includes(entry.name)) continue;
            await walk(full);
        } else if (/\.(js|jsx|ts|tsx|css|html)$/.test(entry.name)) {
            await processFile(full);
        }
    }
}

async function processFile(filePath) {
    // Skip the central index.css which intentionally contains utility selectors
    if (path.normalize(filePath).endsWith(path.normalize(path.join('client', 'src', 'index.css')))) {
        return;
    }
    try {
        const raw = await fs.readFile(filePath, 'utf8');
        let content = raw;

        let changed = false;
        for (const re of patterns) {
            if (re.test(content)) {
                content = content.replace(re, '');
                changed = true;
            }
        }

        if (changed) {
            // Normalize multiple spaces inside className strings and remove empty class attributes
            content = content.replace(/className=\{?`([^`]+)`\}?/g, (m, g1) => {
                const cleaned = g1.replace(/\s+/g, ' ').trim();
                return cleaned ? `className={` + '`' + cleaned + '`' + `}` : '';
            });

            content = content.replace(/className=\"([^\"]+)\"/g, (m, g1) => {
                const cleaned = g1.replace(/\s+/g, ' ').trim();
                return cleaned ? `className="${cleaned}"` : '';
            });

            // Backup file before overwrite
            await fs.copyFile(filePath, filePath + '.bak');
            await fs.writeFile(filePath, content, 'utf8');
            console.log('Stripped colors in:', path.relative(ROOT, filePath));
        }
    } catch (err) {
        console.error('Error processing', filePath, err.message);
    }
}

async function main() {
    console.log('Starting strip-colored-utils across', TARGET);
    await walk(TARGET);
    console.log('Done. Backups saved with .bak extension. Review changes and run the build.');
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
