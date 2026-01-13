const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../client/src');

function scanFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const issues = [];

    lines.forEach((line, idx) => {
        // Find all import lines
        if (line.includes('from ') && (line.includes("'") || line.includes('"'))) {
            // Extract the import path
            const match = line.match(/from\s+['"]([^'"]+)['"]/);
            if (match) {
                const importPath = match[1];

                // Check if it's a relative import
                if (importPath.startsWith('.')) {
                    // Verify the path resolves
                    const dir = path.dirname(filePath);
                    const resolved = path.resolve(dir, importPath);
                    const normalized = path.normalize(resolved);

                    // Check if file or directory exists
                    try {
                        const stat = fs.statSync(normalized);
                        if (!stat) issues.push({ line: idx + 1, path: importPath, error: 'not found' });
                    } catch (e) {
                        // Try with .jsx, .js extensions
                        let found = false;
                        for (const ext of ['.jsx', '.js', '/index.jsx', '/index.js']) {
                            try {
                                fs.statSync(normalized + ext);
                                found = true;
                                break;
                            } catch (e) { }
                        }
                        if (!found) {
                            issues.push({ line: idx + 1, path: importPath, error: 'not resolved' });
                        }
                    }
                }
            }
        }
    });

    return issues;
}

function walkDir(dir, callback) {
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

console.log('🔍 Scanning for unresolved imports...\n');

const issues = [];
walkDir(srcDir, (filePath) => {
    const fileIssues = scanFile(filePath);
    fileIssues.forEach(issue => {
        const rel = path.relative(srcDir, filePath);
        issues.push({ file: rel, ...issue });
    });
});

if (issues.length > 0) {
    console.log(`❌ Found ${issues.length} unresolved imports:\n`);
    issues.forEach(issue => {
        console.log(`  ${issue.file}:${issue.line}`);
        console.log(`    from '${issue.path}' (${issue.error})`);
    });
} else {
    console.log('✅ All imports resolved!');
}
