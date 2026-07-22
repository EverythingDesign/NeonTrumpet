const esbuild = require("esbuild");
const fs = require("node:fs");
const path = require("node:path");

const sourceDirectory = path.join(__dirname, "codes");
const watchMode = process.argv.includes("--watch");

function findJavaScriptFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) return findJavaScriptFiles(entryPath);
    return entry.isFile() && entry.name.endsWith(".js") ? [entryPath] : [];
  });
}

async function main() {
  const entryPoints = findJavaScriptFiles(sourceDirectory);

  if (entryPoints.length === 0) {
    console.log("No JavaScript files found under codes/.");
    return;
  }

  const options = {
    entryPoints,
    outdir: path.join(__dirname, "dist"),
    outbase: sourceDirectory,
    bundle: true,
    minify: true,
    sourcemap: true,
    target: ["es2018"],
    logLevel: "info"
  };

  if (watchMode) {
    const context = await esbuild.context(options);
    await context.watch();
    console.log("Watching codes/**/*.js for changes...");
    return;
  }

  await esbuild.build(options);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
