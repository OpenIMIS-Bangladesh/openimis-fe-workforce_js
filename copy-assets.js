// cross-platform public folder copy script
const fs = require("fs");
const path = require("path");

const mainPublicPath = "../openimis-fe_js/public/"; // set by user
if (!mainPublicPath) {
  console.error("❌ MAIN_PUBLIC_PATH is not set. Please set it before running this script.");
  process.exit(1);
}

const sourceDir = path.join(__dirname, "public");
const targetDir = path.join(mainPublicPath);

// Recursively copy directory
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

console.log(`📂 Copying assets from ${sourceDir} → ${targetDir}`);
copyDir(sourceDir, targetDir);
console.log("✅ Assets copied successfully.");
