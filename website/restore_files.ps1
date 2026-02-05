# Restoration Script
$ErrorActionPreference = "Stop"
$destDir = "restored_files"

if (-not (Test-Path $destDir)) {
    New-Item -ItemType Directory -Path $destDir | Out-Null
    Write-Host "Created directory $destDir"
}

$files = @(
    @{ Commit = "51b4b628"; Path = "website/add_slug_column.js" },
    @{ Commit = "51b4b628"; Path = "website/check-admin-user.ps1" },
    @{ Commit = "51b4b628"; Path = "website/check-db.bat" },
    @{ Commit = "51b4b628"; Path = "website/check-env.js" },
    @{ Commit = "51b4b628"; Path = "website/check_ids.js" },
    @{ Commit = "51b4b628"; Path = "website/complete-mysql-setup.ps1" },
    @{ Commit = "51b4b628"; Path = "website/create-admin-user.js" },
    @{ Commit = "51b4b628"; Path = "website/create-tables-force.js" },
    @{ Commit = "51b4b628"; Path = "website/create-test-users.js" },
    @{ Commit = "51b4b628"; Path = "website/database-viewer.html" },
    @{ Commit = "51b4b628"; Path = "website/deploy-schema-production.js" },
    @{ Commit = "51b4b628"; Path = "website/execute_user_sql.js" },
    @{ Commit = "51b4b628"; Path = "website/fix-admin-login.ps1" },
    @{ Commit = "51b4b628"; Path = "website/fix-mongodb-imports.js" },
    @{ Commit = "51b4b628"; Path = "website/generate-db-report.js" },
    @{ Commit = "51b4b628"; Path = "website/remove-mongoose-methods.js" },
    @{ Commit = "51b4b628"; Path = "website/reset-mysql-password.ps1" },
    @{ Commit = "51b4b628"; Path = "website/run-schema.js" },
    @{ Commit = "51b4b628"; Path = "website/schema.sql" },
    @{ Commit = "51b4b628"; Path = "website/setup-database-simple.ps1" },
    @{ Commit = "51b4b628"; Path = "website/setup-database.bat" },
    @{ Commit = "51b4b628"; Path = "website/setup-database.ps1" },
    @{ Commit = "51b4b628"; Path = "website/setup-mysql.ps1" },
    @{ Commit = "51b4b628"; Path = "website/test-db-and-create-tables.js" },
    @{ Commit = "51b4b628"; Path = "website/test-mysql-connection.ps1" },
    @{ Commit = "5768b2dd"; Path = "website/CHECK_DATABASE_NO_CLI.md" },
    @{ Commit = "5768b2dd"; Path = "website/COPY_PASTE_COMMANDS.md" },
    @{ Commit = "5768b2dd"; Path = "website/FIX_GUIDE.md" },
    @{ Commit = "5768b2dd"; Path = "website/HOW_TO_CHECK_DATABASE.md" },
    @{ Commit = "5768b2dd"; Path = "website/MIGRATION_COMPLETE.md" },
    @{ Commit = "5768b2dd"; Path = "website/MONGOOSE_TO_MYSQL_COMPLETE.md" },
    @{ Commit = "5768b2dd"; Path = "website/MYSQL_SETUP_GUIDE.md" },
    @{ Commit = "5768b2dd"; Path = "website/MYSQL_WORKBENCH_SETUP.md" },
    @{ Commit = "5768b2dd"; Path = "website/QUICK_FIX.md" },
    @{ Commit = "5768b2dd"; Path = "website/README.md" },
    @{ Commit = "5768b2dd"; Path = "website/RESET_PASSWORD_INSTRUCTIONS.md" },
    @{ Commit = "5768b2dd"; Path = "website/VIEW_DATABASE.md" },
    @{ Commit = "5768b2dd"; Path = "website/WORKBENCH_QUICK_START.md" },
    @{ Commit = "b441ad50"; Path = "website/update_db.js" }
)

foreach ($file in $files) {
    $commit = $file.Commit
    $path = $file.Path
    $filename = Split-Path $path -Leaf
    $outFile = Join-Path $destDir $filename
    
    Write-Host "Restoring $filename from commit $commit..."
    try {
        # Using git show with parent commit
        $cmd = "git show ${commit}^:${path}"
        Invoke-Expression $cmd | Out-File $outFile -Encoding utf8
    }
    catch {
        Write-Warning ("Failed to restore {0}: {1}" -f $filename, $_)
    }
}
Write-Host "Restoration complete."
