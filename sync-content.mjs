import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

function readDotEnv(dotenvPath) {
  const env = {};
  if (!fs.existsSync(dotenvPath)) return env;
  const lines = fs.readFileSync(dotenvPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const s = line.trim();
    if (!s || s.startsWith("#")) continue;
    const idx = s.indexOf("=");
    if (idx === -1) continue;
    const k = s.slice(0, idx).trim();
    const v = s.slice(idx + 1).trim();
    env[k] = v;
  }
  return env;
}

function run(cmd, opts = {}) {
  execSync(cmd, { stdio: "inherit", ...opts });
}

const root = process.cwd();
const dotenv = readDotEnv(path.join(root, ".env"));

const ENABLE_CONTENT_SYNC =
  (process.env.ENABLE_CONTENT_SYNC ?? dotenv.ENABLE_CONTENT_SYNC ?? "false")
    .toLowerCase() === "true";

const CONTENT_REPO_URL =
  process.env.CONTENT_REPO_URL ?? dotenv.CONTENT_REPO_URL ?? "";

// 可选：指定分支，默认 main
const CONTENT_REPO_BRANCH =
  process.env.CONTENT_REPO_BRANCH ?? dotenv.CONTENT_REPO_BRANCH ?? "main";

// 可选：是否清理未跟踪文件（默认 true，避免残留）
const CONTENT_CLEAN =
  (process.env.CONTENT_CLEAN ?? dotenv.CONTENT_CLEAN ?? "true")
    .toLowerCase() === "true";

if (!ENABLE_CONTENT_SYNC) {
  console.log("[sync-content] ENABLE_CONTENT_SYNC=false, skip.");
  process.exit(0);
}

if (!CONTENT_REPO_URL) {
  console.error("[sync-content] CONTENT_REPO_URL is empty. Set it in .env.");
  process.exit(1);
}

const contentDir = path.join(root, "content");
const gitDir = path.join(contentDir, ".git");
const isGitRepo = fs.existsSync(gitDir);

if (!isGitRepo) {
  // contentDir 存在但不是 git repo：为了避免误删用户内容，这里直接报错
  // 如果你希望自动清空后 clone，可以把这里改成 rmSync(contentDir)
  if (fs.existsSync(contentDir)) {
    console.error(
      "[sync-content] ./content exists but is not a git repo (missing .git). " +
        "Please delete ./content manually or make it a git repo."
    );
    process.exit(1);
  }

  console.log(`[sync-content] Cloning content repo (${CONTENT_REPO_BRANCH}) -> ${contentDir}`);
  run(`git clone --depth 1 --branch "${CONTENT_REPO_BRANCH}" "${CONTENT_REPO_URL}" "${contentDir}"`);
  console.log("[sync-content] Done.");
  process.exit(0);
}

// 增量更新：fetch + reset 到远端分支最新
console.log(`[sync-content] Updating content repo in ./content (branch: ${CONTENT_REPO_BRANCH})...`);

// 确保 origin 指向正确（如果你改过 URL，它也会被更新）
run(`git -C "${contentDir}" remote set-url origin "${CONTENT_REPO_URL}"`);

// 抓取最新提交
run(`git -C "${contentDir}" fetch --prune origin "${CONTENT_REPO_BRANCH}"`);

// 强制对齐到远端（避免 merge，保证构建稳定）
run(`git -C "${contentDir}" reset --hard "origin/${CONTENT_REPO_BRANCH}"`);

// 可选：清理未跟踪文件，避免旧图片/旧 md 残留导致奇怪行为
if (CONTENT_CLEAN) {
  run(`git -C "${contentDir}" clean -fd`);
}

console.log("[sync-content] Done.");