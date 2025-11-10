import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import pngToIco from 'png-to-ico';

async function main() {
  const src = resolve(process.cwd(), 'public', 'favicon.png');
  const out = resolve(process.cwd(), 'public', 'favicon.ico');
  try {
    const buf = await readFile(src);
    const ico = await pngToIco(buf);
    await mkdir(dirname(out), { recursive: true });
    await writeFile(out, ico);
    console.log('Generated', out);
  } catch (err) {
    console.error('Failed to generate favicon.ico. Ensure public/favicon.png exists.', err);
    process.exit(1);
  }
}

main();


