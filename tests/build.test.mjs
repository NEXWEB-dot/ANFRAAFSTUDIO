import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, mkdtemp, mkdir, copyFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';

test('production build injects public settings and regenerates matching CSP hashes', async () => {
  const settings={LAUNCH_MODE:'production',SITE_ORIGIN:'https://store.test',BACKEND_ORIGIN:'https://api.store.test',PUBLIC_CDN_ORIGIN:'https://images.store.test',WHATSAPP_URL:'https://wa.me/923219876543'};
  const previous=Object.fromEntries(Object.keys(settings).map(k=>[k,process.env[k]]));
  try {
    Object.assign(process.env,settings);
    await import('../tools/build.mjs?production-test');
    const html=await readFile('dist/checkout.html','utf8');
    const headers=await readFile('dist/_headers','utf8');
    assert.ok(html.includes('923219876543'));
    assert.ok(!html.includes('923000000000'));
    assert.ok(headers.includes('https://images.store.test'));
    for (const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
      if (/\bsrc\s*=/.test(m[1]) || !m[2].trim()) continue;
      const hash=createHash('sha256').update(m[2].replace(/\r\n?/g,'\n')).digest('base64');
      assert.ok(headers.includes(`'sha256-${hash}'`));
    }
    assert.deepEqual(JSON.parse(await readFile('dist/_routes.json','utf8')).include,['/api/*']);
  } finally {
    for (const [key,value] of Object.entries(previous)) {
      if (value===undefined) delete process.env[key]; else process.env[key]=value;
    }
    await import('../tools/build.mjs?restore-build');
  }
});

test('backend builds without any adjacent frontend or admin files', {skip:!existsSync('anraf backend/scripts/build.mjs')}, async()=>{
  const directory=await mkdtemp(path.join(tmpdir(),'anraf-api-build-'));
  await mkdir(path.join(directory,'scripts'));
  const file=path.join(directory,'scripts','build.mjs');
  await copyFile('anraf backend/scripts/build.mjs',file);
  await import(pathToFileURL(file).href);
  assert.ok((await readFile(path.join(directory,'dist','index.html'),'utf8')).includes('ANRAF API'));
  assert.ok(!existsSync(path.join(directory,'dist','admin')));
});
