#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const file = path.join(root, 'marketplace.json');
const fails = [];
const warns = [];
const ids = new Set();
const capOk = new Set(['tools', 'hooks', 'embedding', 'tts', 'singing']);

function fail(m) { fails.push(m); }
function warn(m) { warns.push(m); }

let j;
try { j = JSON.parse(fs.readFileSync(file, 'utf8')); }
catch (e) { console.error('marketplace.json 解析失败：' + e.message); process.exit(1); }

if (j.version !== 1) fail('version 必须是 1');
if (!Array.isArray(j.plugins) || !j.plugins.length) fail('plugins 必须是非空数组');

for (const p of j.plugins || []) {
  const id = String(p.id || '');
  if (!/^[A-Za-z0-9._-]{1,64}$/.test(id)) fail(`id 不合法：${id}`);
  if (ids.has(id)) fail(`id 重复：${id}`);
  ids.add(id);
  for (const k of ['name', 'version', 'path', 'download', 'description', 'author', 'guideUrl', 'setup']) {
    if (!p[k]) fail(`${id}: 缺 ${k}`);
  }
  if (!Array.isArray(p.capabilities) || !p.capabilities.length) fail(`${id}: capabilities 为空`);
  for (const c of p.capabilities || []) if (!capOk.has(c)) fail(`${id}: 未知能力 ${c}`);
  if (!p.requires?.core) fail(`${id}: 缺 requires.core`);

  if (p.path && !fs.existsSync(path.join(root, p.path))) fail(`${id}: path 不存在 ${p.path}`);
  if (p.guide && !fs.existsSync(path.join(root, p.guide))) fail(`${id}: guide 不存在 ${p.guide}`);
  if (p.setupScript && !fs.existsSync(path.join(root, p.setupScript))) fail(`${id}: setupScript 不存在 ${p.setupScript}`);
  if (p.download) {
    const z = path.join(root, p.download);
    if (!fs.existsSync(z)) fail(`${id}: download 不存在 ${p.download}`);
    else {
      const b = fs.readFileSync(z).subarray(0, 4);
      if (b.toString('hex') !== '504b0304') fail(`${id}: ${p.download} 不是 zip`);
    }
  }
  if (!p.guideUrl?.startsWith('http')) warn(`${id}: guideUrl 不是完整 URL`);
}

for (const w of warns) console.warn('WARN ' + w);
for (const f of fails) console.error('FAIL ' + f);
if (fails.length) {
  console.error(`\n校验失败：${fails.length} 项`);
  process.exit(1);
}
console.log(`✓ 市场格式通过：${(j.plugins || []).length} 个插件`);
