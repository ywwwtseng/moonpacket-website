#!/usr/bin/env node
import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, rmSync, cpSync, writeFileSync, readdirSync } from 'node:fs';
import { resolve, join } from 'node:path';

const ROOT = process.cwd();
const OUT = resolve(ROOT, 'dist');
const TMP = resolve(ROOT, '.tmp-public');
const PUBLIC_REPO = process.env.PUBLIC_REPO || 'git@github.com:ywwwtseng/moonpacket-site.git';

function sh(cmd, opts={}) {
  return execSync(cmd, { stdio: 'inherit', ...opts });
}

function parseRepo(repoUrl) {
  try {
    // git@github.com:owner/repo.git
    let m = repoUrl.match(/^git@github.com:([^/]+)\/([^\.]+)(?:\.git)?$/);
    if (m) return { owner: m[1], name: m[2] };
    // https://github.com/owner/repo(.git)
    m = repoUrl.match(/^https?:\/\/github.com\/([^/]+)\/([^\.]+)(?:\.git)?$/);
    if (m) return { owner: m[1], name: m[2] };
  } catch {}
  return { owner: 'ywwwtseng', name: 'moonpacket-site' };
}

const { owner, name } = parseRepo(PUBLIC_REPO);
const PAGES_URL = process.env.SITE || `https://${owner}.github.io/${name}/`;

// Always rebuild with correct base for GitHub Pages
sh(`SITE=${PAGES_URL} pnpm build`);

rmSync(TMP, { recursive: true, force: true });
mkdirSync(TMP, { recursive: true });
sh(`git clone --depth=1 ${PUBLIC_REPO} ${TMP}`);

// set identity & disable gpg signing in temp repo
try {
  sh('git config user.name "moonpocket-deploy"', { cwd: TMP });
  sh('git config user.email "deploy@moonpacket.example"', { cwd: TMP });
  sh('git config commit.gpgSign false', { cwd: TMP });
} catch {}

// if empty repo, create initial tree structure
const hasAny = (() => { try { return readdirSync(TMP).filter(n=>n!=='.git').length>0; } catch { return false; } })();
if (!hasAny) {
  mkdirSync(join(TMP, 'docs'), { recursive: true });
}

// copy whitelist
const WL = [
  ['dist', '.'],
  ['README.md', 'README.md'],
  ['UI-GUIDELINES.md', 'UI-GUIDELINES.md'],
  ['docs/CHANGELOG.md', 'docs/CHANGELOG.md'],
  ['docs/PUBLICATION-POLICY.md', 'docs/PUBLICATION-POLICY.md'],
];

function copyItem(srcRel, dstRel) {
  const src = resolve(ROOT, srcRel);
  const dst = resolve(TMP, dstRel);
  const dstDir = dstRel.includes('/') ? join(TMP, dstRel.substring(0, dstRel.lastIndexOf('/'))) : TMP;
  mkdirSync(dstDir, { recursive: true });
  cpSync(src, dst, { recursive: true });
}

for (const [src, dst] of WL) {
  if (existsSync(resolve(ROOT, src))) copyItem(src, dst);
}

try { sh("find . -name '*.map' -delete", { cwd: TMP }); } catch {}

writeFileSync(join(TMP, '.nojekyll'), '');
sh('git add .', { cwd: TMP });
sh('git commit -m "chore: publish public site" || true', { cwd: TMP });
sh('git push origin HEAD:main', { cwd: TMP });

console.log(`\n[publish-public] done -> ${owner}/${name} (SITE=${PAGES_URL})`);
