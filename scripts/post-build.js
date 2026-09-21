import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const distDir = path.resolve(rootDir, "dist");
const clientDir = path.resolve(distDir, "client");
const serverDir = path.resolve(distDir, "server");
const outputPublicDir = path.resolve(rootDir, ".output/public");

async function main() {
  console.log("Running post-build processing to ensure valid build artifacts in dist/...");

  // 1. Ensure dist directory exists
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  // 2. Copy client assets to dist root if dist/client exists
  if (fs.existsSync(clientDir)) {
    console.log("Copying files from dist/client to dist root...");
    fs.cpSync(clientDir, distDir, { recursive: true });
  } else if (fs.existsSync(outputPublicDir)) {
    console.log("Copying files from .output/public to dist root...");
    fs.cpSync(outputPublicDir, distDir, { recursive: true });
  }

  // 3. Generate index.html from server entry if available
  let generatedHtml = "";
  const serverJsPath = path.resolve(serverDir, "server.js");
  if (fs.existsSync(serverJsPath)) {
    try {
      console.log("Rendering HTML shell from dist/server/server.js...");
      const serverModule = await import(`file://${serverJsPath}`);
      if (serverModule.default && typeof serverModule.default.fetch === "function") {
        const res = await serverModule.default.fetch(new Request("http://localhost:3000/"));
        generatedHtml = await res.text();
        console.log(`Rendered HTML shell successfully (${generatedHtml.length} bytes).`);
      }
    } catch (err) {
      console.warn("Could not render HTML from dist/server/server.js:", err);
    }
  }

  // 4. Fallback HTML generator if server rendering was unavailable
  if (!generatedHtml || !generatedHtml.includes("</html>")) {
    console.log("Constructing fallback index.html shell...");
    const assetsDir = path.resolve(distDir, "assets");
    let cssFile = "";
    let jsFile = "";
    if (fs.existsSync(assetsDir)) {
      const files = fs.readdirSync(assetsDir);
      cssFile = files.find((f) => f.endsWith(".css")) || "";
      jsFile = files.find((f) => f.startsWith("index-") && f.endsWith(".js")) || "";
    }

    generatedHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>EventSync — Curated Live Experiences & Digital Passes</title>
    <meta name="description" content="Discover and book concerts, summits, sports, theatre, and festivals across India with instant digital passes." />
    ${cssFile ? `<link rel="stylesheet" href="/assets/${cssFile}" />` : ""}
    <link rel="icon" href="/favicon.ico" type="image/x-icon" />
  </head>
  <body>
    <div id="root"></div>
    ${jsFile ? `<script type="module" src="/assets/${jsFile}"></script>` : ""}
  </body>
</html>`;
  }

  // 5. Write index.html, 200.html, and 404.html to dist/
  fs.writeFileSync(path.resolve(distDir, "index.html"), generatedHtml, "utf8");
  fs.writeFileSync(path.resolve(distDir, "200.html"), generatedHtml, "utf8");
  fs.writeFileSync(path.resolve(distDir, "404.html"), generatedHtml, "utf8");

  // 6. Verify dist contents
  const distFiles = fs.readdirSync(distDir);
  console.log(
    `Build artifacts finalized in dist/ (${distFiles.length} top-level entries):`,
    distFiles.join(", "),
  );

  if (!fs.existsSync(path.resolve(distDir, "index.html"))) {
    throw new Error("Critical: dist/index.html was not generated!");
  }
}

main().catch((err) => {
  console.error("Post-build failed:", err);
  process.exit(1);
});
