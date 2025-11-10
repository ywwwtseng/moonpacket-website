#!/usr/bin/env node
import { readdirSync, statSync, mkdirSync } from 'node:fs';
import { resolve, extname, basename, dirname, join } from 'node:path';
import sharp from 'sharp';

const ROOT = process.cwd();
const SRC_DIR = resolve(ROOT, 'public/images');
const OUT_DIR = resolve(ROOT, 'public/images-optimized');
const SIZES = [480, 768, 1024, 1440, 1920];
const FORMATS = ['webp', 'avif'];

function walk(dir){
  const out = [];
  for (const name of readdirSync(dir)){
    const p = resolve(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

async function processOne(file){
  const ext = extname(file).toLowerCase();
  if (!['.jpg','.jpeg','.png','.webp','.avif','.gif','.tiff','.svg'].includes(ext)) return;
  const rel = file.substring(SRC_DIR.length+1);
  for (const width of SIZES){
    for (const fmt of FORMATS){
      const outDir = resolve(OUT_DIR, dirname(rel));
      mkdirSync(outDir, { recursive: true });
      const name = basename(rel, ext) + `-${width}.${fmt}`;
      const outPath = join(outDir, name);
      const img = sharp(file).resize({ width, withoutEnlargement: true });
      if (fmt === 'webp') await img.webp({ quality: 82 }).toFile(outPath);
      else if (fmt === 'avif') await img.avif({ quality: 50 }).toFile(outPath);
      console.log('✅', outPath);
    }
  }
}

async function main(){
  console.log('🔄 Optimizing images from', SRC_DIR);
  const files = walk(SRC_DIR);
  for (const f of files) await processOne(f);
  console.log('🎉 Done');
}

main().catch((e)=>{ console.error(e); process.exit(1); });



