const fs = require('fs');
const path = require('path');

const srcDir = path.resolve(__dirname, '..', 'public');
const destDir = path.resolve(__dirname, 'www');

console.log(`[Sync Assets] Copying from ${srcDir} to ${destDir}...`);

function copyRecursiveSync(src, dest) {
  if (!fs.existsSync(src)) {
    console.warn(`[Sync Assets] Warning: Source path ${src} does not exist.`);
    return;
  }
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyRecursiveSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Clean destination directory if needed
if (fs.existsSync(destDir)) {
  fs.rmSync(destDir, { recursive: true, force: true });
}

copyRecursiveSync(srcDir, destDir);
console.log(`[Sync Assets] Completed successfully. Total files copied to ${destDir}`);
