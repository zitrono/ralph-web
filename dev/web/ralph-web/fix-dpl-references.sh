#!/bin/bash

# Fix DPL References Script
# This script removes ?dpl=dpl_D6zou3y5AMchbmKzHyHjkQZbQxNd query parameters from all HTML files
# in the jace-ai-copy directory structure

echo "🔍 Scanning for HTML files with ?dpl= references..."

# Count total files and references before fix
total_files=$(find . -name "*.html" | wc -l)
total_references=$(grep -r "?dpl=dpl_D6zou3y5AMchbmKzHyHjkQZbQxNd" . --include="*.html" | wc -l)

echo "📊 Found $total_files HTML files with $total_references total ?dpl= references"
echo ""

# Create backup directory
backup_dir="./html_backups_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$backup_dir"
echo "💾 Creating backups in: $backup_dir"

# Find all HTML files and process them
find . -name "*.html" -type f | while read -r file; do
    # Check if file contains the dpl parameter
    if grep -q "?dpl=dpl_D6zou3y5AMchbmKzHyHjkQZbQxNd" "$file"; then
        echo "🔧 Processing: $file"
        
        # Create backup
        cp "$file" "$backup_dir/"
        
        # Remove the ?dpl=dpl_D6zou3y5AMchbmKzHyHjkQZbQxNd parameter
        sed -i '' 's/?dpl=dpl_D6zou3y5AMchbmKzHyHjkQZbQxNd//g' "$file"
        
        # Count references in this file after fix
        remaining=$(grep -c "?dpl=" "$file" 2>/dev/null || echo "0")
        if [ "$remaining" -gt 0 ]; then
            echo "⚠️  Warning: $file still has $remaining ?dpl= references"
        fi
    fi
done

echo ""
echo "✅ Fix completed!"

# Verify the fix
echo "🔍 Verification:"
remaining_total=$(grep -r "?dpl=dpl_D6zou3y5AMchbmKzHyHjkQZbQxNd" . --include="*.html" 2>/dev/null | wc -l)
echo "   - References before: $total_references"
echo "   - References after: $remaining_total"

if [ "$remaining_total" -eq 0 ]; then
    echo "🎉 All ?dpl= references have been successfully removed!"
else
    echo "⚠️  $remaining_total references still remain - manual review needed"
fi

echo ""
echo "📁 Backups saved in: $backup_dir"
echo "💡 To restore backups: cp $backup_dir/* ."