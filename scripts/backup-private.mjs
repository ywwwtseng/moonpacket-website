import { execSync } from 'node:child_process';
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

function run(cmd) {
  return execSync(cmd, { stdio: 'inherit' });
}

function getStamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

try {
  const root = process.cwd();
  const backupsDir = resolve(root, 'backups');
  if (!existsSync(backupsDir)) mkdirSync(backupsDir);

  // Ensure repo
  run('git rev-parse --is-inside-work-tree');

  // Make sure all changes are staged and committed
  const stamp = getStamp();
  const branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
  const short = execSync('git rev-parse --short HEAD').toString().trim();

  // Commit any pending changes
  try {
    run('git add -A');
    run(`git commit -m "chore(backup): snapshot ${stamp} on ${branch}" || true`);
  } catch (_) {}

  // Create tag with timestamp
  const tag = `backup-${stamp}`;
  try {
    run(`git tag -a ${tag} -m "Backup ${stamp} (${branch}@${short})"`);
  } catch (_) {
    // if tag exists, append -1
    const alt = `${tag}-1`;
    run(`git tag -a ${alt} -m "Backup ${stamp} (${branch}@${short})"`);
  }

  // Archive working tree to backups/
  const tarName = `backup-${stamp}.tar.gz`;
  run(`git archive --format=tar.gz -o ${resolve(backupsDir, tarName)} HEAD`);

  // Write checksum
  const sum = execSync(`shasum -a 256 ${resolve(backupsDir, tarName)}`).toString();
  writeFileSync(resolve(backupsDir, `${tarName}.sha256`), sum);

  // Push if origin exists
  try {
    execSync('git remote get-url origin');
    run('git push');
    run('git push --tags');
  } catch (_) {
    console.log('No origin remote; skipped push.');
  }

  console.log(`Backup complete: backups/${tarName}`);
} catch (e) {
  console.error('Backup failed:', e.message || e);
  process.exit(1);
}
