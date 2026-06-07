import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));

const requiredFiles = [
  "App.vue",
  "main.js",
  "manifest.json",
  "pages.json",
  "config/app.js",
  "pages/index/index.vue",
  "static/logo.svg",
  "static/splash.svg",
  "README.md",
];

const failures = [];

for (const file of requiredFiles) {
  if (!existsSync(join(root, file))) failures.push(`Missing required file: ${file}`);
}

const manifest = JSON.parse(readFileSync(join(root, "manifest.json"), "utf8"));
const pages = JSON.parse(readFileSync(join(root, "pages.json"), "utf8"));
const config = readFileSync(join(root, "config/app.js"), "utf8");
const index = readFileSync(join(root, "pages/index/index.vue"), "utf8");
const readme = readFileSync(join(root, "README.md"), "utf8");
const allSource = requiredFiles
  .filter((file) => !file.endsWith(".svg"))
  .map((file) => readFileSync(join(root, file), "utf8"))
  .join("\n");

if (manifest.name !== "BioMentor Agent") {
  failures.push("manifest.json name must be BioMentor Agent");
}

if (!manifest.description.includes("Android and iOS")) {
  failures.push("manifest.json description must describe Android and iOS support");
}

const appPlus = manifest["app-plus"] || {};
const distribute = appPlus.distribute || {};
const android = distribute.android || {};
const ios = distribute.ios || {};

if (android.packagename !== "io.biomentor.agent") {
  failures.push("Android package name must be io.biomentor.agent");
}

if (ios.appid !== "io.biomentor.agent") {
  failures.push("iOS Bundle ID must be io.biomentor.agent");
}

if (ios.devices !== "universal") {
  failures.push("iOS devices must be universal");
}

if (String(ios.deploymentTarget || "") !== "12.0") {
  failures.push("iOS deploymentTarget must be 12.0");
}

if (!Array.isArray(pages.pages) || pages.pages[0]?.path !== "pages/index/index") {
  failures.push("pages.json must route the first page to pages/index/index");
}

if (!config.includes("http://106.14.194.186:10086")) {
  failures.push("config/app.js must point to the configured BioMentor deployment");
}

if (!index.includes("<web-view") || !index.includes("APP_CONFIG.targetUrl")) {
  failures.push("pages/index/index.vue must load APP_CONFIG.targetUrl through web-view");
}

for (const expectedReadmeText of ["iOS", "Apple Developer", ".p12", ".mobileprovision", "HTTPS"]) {
  if (!readme.includes(expectedReadmeText)) {
    failures.push(`README.md must document iOS packaging requirement: ${expectedReadmeText}`);
  }
}

const secretLikeToken = /sk-[a-z0-9]{20,}/i;
const envKeyNames = [
  ["DEEP", "SEEK", "API", "KEY"].join("_"),
  ["BIOMENTOR", "DEEP", "SEEK", "API", "KEY"].join("_"),
];

if (secretLikeToken.test(allSource) || envKeyNames.some((name) => allSource.includes(name))) {
  failures.push("App shell source must not contain API keys or server-side AI environment variable names");
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("App shell validation passed.");
