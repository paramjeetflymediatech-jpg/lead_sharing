const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('≡ƒº╣ Removing Mongoose methods from codebase...\n');

// Find all .js and .jsx files in src directory
const findCommand = 'powershell -Command "Get-ChildItem -Path src -Include *.js,*.jsx -Recurse | Select-Object -ExpandProperty FullName"';
const files = execSync(findCommand, { cwd: __dirname }).toString().trim().split('\n');

let totalChanges = 0;

files.forEach(filePathRaw => {
    const filePath = filePathRaw.trim();
    if (!filePath || !fs.existsSync(filePath)) return;

    try {
        let content = fs.readFileSync(filePath, 'utf8');
        const originalContent = content;

        // Remove .lean() calls
        content = content.replace(/\.lean\(\)/g, '');

        // Remove .populate() calls (simple ones)
        // Keep the commented ones as they are already commented
        content = content.replace(/(\s+)\.populate\([^)]+\)(?!\s*\/\/)/g, '');

        // Remove .sort() calls (chainable)
        content = content.replace(/(\s+)\.sort\([^)]+\)/g, '');

        // Remove .limit() calls
        content = content.replace(/(\s+)\.limit\([^)]+\)/g, '');

        // Remove .skip() calls  
        content = content.replace(/(\s+)\.skip\([^)]+\)/g, '');

        // Remove .select() calls
        content = content.replace(/(\s+)\.select\([^)]+\)/g, '');

        if (content !== originalContent) {
            fs.writeFileSync(filePath, content, 'utf8');
            const relativePath = path.relative(__dirname, filePath);
            console.log(`Γ£ô Updated: ${relativePath}`);
            totalChanges++;
        }
    } catch (error) {
        console.log(`Γ£ù Error processing: ${filePath}`);
    }
});

console.log(`\nΓ£à Complete! Updated ${totalChanges} files.`);
console.log('\n≡ƒô¥ Note: Some complex .populate() calls may need manual review.');
