import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const distDir = path.resolve(rootDir, "dist");

console.log("Running post-build copying of data and images to dist/...");

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Ensure data/ directory is in dist
const dataSrc = path.resolve(rootDir, "data");
const dataDest = path.resolve(distDir, "data");
if (fs.existsSync(dataSrc)) {
  fs.cpSync(dataSrc, dataDest, { recursive: true });
  console.log("Copied data/ to dist/data/");
}

// Ensure images/ directory is in dist
const imagesSrc = path.resolve(rootDir, "images");
const imagesDest = path.resolve(distDir, "images");
if (fs.existsSync(imagesSrc)) {
  fs.cpSync(imagesSrc, imagesDest, { recursive: true });
  console.log("Copied images/ to dist/images/");
}

// Ensure src/assets/images/ directory is in dist
const srcAssetsImagesSrc = path.resolve(rootDir, "src/assets/images");
const srcAssetsImagesDest = path.resolve(distDir, "src/assets/images");
if (fs.existsSync(srcAssetsImagesSrc)) {
  fs.cpSync(srcAssetsImagesSrc, srcAssetsImagesDest, { recursive: true });
  console.log("Copied src/assets/images/ to dist/src/assets/images/");
}

console.log("Post-build completed successfully.");
