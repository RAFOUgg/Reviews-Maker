#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, 'client/src');
const componentsPath = path.join(srcPath, 'components');
const pagesPath = path.join(srcPath, 'pages');

let filesChecked = 0;
let importIssues = [];

function getAllFilesRecursive(dir) {
    const files = [];
    const items = fs.readdirSync(dir);

    items.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            files.push(...getAllFilesRecursive(filePath));
        } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
            files.push(filePath);
        }
    });

    return files;
}

function extractImports(content, filePath) {
    const imports = [];

    // Match: from './path' or from "./path"
    const staticImportRegex = /from\s+['"](.\/[^'"]+)['"]/g;
    let match;
    while ((match = staticImportRegex.exec(content)) !== null) {
        imports.push({
            path: match[1],
            type: 'static',
            line: content.substring(0, match.index).split('\n').length
        });
    }

    // Match: import('./path') or import("./path")
    const dynamicImportRegex = /import\s*\(\s*['"](.\/[^'"]+)['"]\s*\)/g;
    while ((match = dynamicImportRegex.exec(content)) !== null) {
        imports.push({
            path: match[1],
            type: 'dynamic',
            line: content.substring(0, match.index).split('\n').length
        });
    }

    return imports;
}

function resolveImportPath(importPath, fromFile) {
    const fromDir = path.dirname(fromFile);
    const resolvedPath = path.resolve(fromDir, importPath);

    // Check with .jsx, .js, or as directory/index
    const checkPaths = [
        resolvedPath + '.jsx',
        resolvedPath + '.js',
        path.join(resolvedPath, 'index.jsx'),
        path.join(resolvedPath, 'index.js'),
        resolvedPath
    ];

    for (const checkPath of checkPaths) {
        if (fs.existsSync(checkPath)) {
            return checkPath;
        }
    }

    return null;
}

function check() {
    console.log('📋 Verification des imports...\n');

    const jsFiles = getAllFilesRecursive(srcPath);

    jsFiles.forEach(filePath => {
        filesChecked++;
        const content = fs.readFileSync(filePath, 'utf8');
        const imports = extractImports(content, filePath);

        imports.forEach(imp => {
            const resolved = resolveImportPath(imp.path, filePath);
            if (!resolved && !imp.path.startsWith('./node_modules')) {
                importIssues.push({
                    file: path.relative(srcPath, filePath),
                    import: imp.path,
                    line: imp.line,
                    type: imp.type
                });
            }
        });
    });

    if (importIssues.length === 0) {
        console.log(`✅ TOUS les imports sont corrects! (${filesChecked} fichiers verifie`);
    } else {
        console.log(`⚠️  ${importIssues.length} imports manquants trouve:\n`);
        importIssues.forEach(issue => {
            console.log(`  📄 ${issue.file}:${issue.line}`);
            console.log(`     Import: ${issue.import}`);
            console.log();
        });
    }
}

check();
