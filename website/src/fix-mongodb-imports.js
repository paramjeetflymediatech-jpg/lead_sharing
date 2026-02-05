const fs = require('fs');
const path = require('path');

const filesToFix = [
    'src/app/api/tradesperson/profile/route.js',
    'srcapp/api/leads/unlock/route.js',
    'src/app/api/leads/my/route.js',
    'src/app/api/leads/job/[id]/route.js',
    'src/app/api/jobs/[id]/route.js',
    'src/app/api/categories/[id]/route.js',
    'src/app/api/admin/subcategories/route.js',
    'src/app/api/admin/seed/route.js',
    'src/app/api/admin/categories/route.js',
    'src/app/api/admin/seo/route.js',
    'src/app/api/admin/seo/[id]/route.js',
    'src/app/api/seo/route.js'
];

filesToFix.forEach(file => {
    const fullPath = path.join(__dirname, file);
    if (fs.existsSync(fullPath)) {
        let content = fs.readFileSync(fullPath, 'utf8');

        // Replace uncommented MongoDB imports
        content = content.replace(
            /^import { connectToDatabase } from "@\/lib\/mongodb";/gm,
            '// import { connectToDatabase } from "@/lib/mongodb";'
        );

        // Replace uncommented connectToDatabase calls
        content = content.replace(
            /^(\s*)await connectToDatabase\(\);/gm,
            '$1// await connectToDatabase();'
        );

        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Γ£ô Fixed: ${file}`);
    } else {
        console.log(`Γ£ù Not found: ${file}`);
    }
});

console.log('\nΓ£à All files processed!');
