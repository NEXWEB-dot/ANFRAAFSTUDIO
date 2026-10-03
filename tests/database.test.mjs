import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { PGlite } from '@electric-sql/pglite';

test('database migrations, access rules, sizes, idempotency and stock transactions', {skip: !fs.existsSync('anraf backend/supabase/migrations/001_init.sql')}, async () => {
  const savedWindow = globalThis.window;
  const savedLocation = globalThis.location;
  delete globalThis.window;
  delete globalThis.location;
  const db = new PGlite();
  try {
    await db.exec('create role anon; create role authenticated; create role service_role bypassrls;');
    await db.exec(fs.readFileSync('anraf backend/supabase/migrations/001_init.sql','utf8'));
    await db.exec(fs.readFileSync('anraf backend/supabase/migrations/002_order_sizes.sql','utf8'));
    for (const role of ['anon','authenticated']) {
      await db.exec(`set role ${role}`);
      for (const query of [
        'select * from orders', 'select * from products', 'select catalog_admin()',
        "select place_order('ref','Name','03001234567','Address','', '[]'::jsonb, true)",
      ]) await assert.rejects(db.query(query), /permission denied/);
      await db.exec('reset role');
    }
    const id='11111111-1111-4111-8111-111111111111';
    await db.query("insert into products(id,slug,name,price,track_stock,stock) values ($1,'test','Test Shirt',100,true,5)",[id]);
    const place = (ref, qty, size='Medium') => db.query(
      "select place_order($1,'Test Customer','03001234567','Test address','', $2::jsonb,false) as result",
      [ref,JSON.stringify([{product_id:id,qty,size}])]
    );
    const first=(await place('same-reference',2)).rows[0].result;
    const duplicate=(await place('same-reference',2)).rows[0].result;
    assert.equal(duplicate.order_id,first.order_id);
    assert.equal(duplicate.duplicate,true);
    assert.equal(first.total,200);
    assert.equal((await db.query('select stock from products')).rows[0].stock,3);
    assert.equal((await db.query('select size from order_items')).rows[0].size,'Medium');
    await assert.rejects(place('too-many',4),/OUT_OF_STOCK/);
    assert.equal((await db.query('select count(*)::int as count from orders')).rows[0].count,1);
    await db.query("select set_order_status($1,'cancelled')",[first.order_id]);
    assert.equal((await db.query('select stock from products')).rows[0].stock,5);
    await assert.rejects(db.query("select set_order_status($1,'cancelled')",[first.order_id]),/BAD_TRANSITION/);
    assert.equal((await db.query('select stock from products')).rows[0].stock,5);
  } finally {
    await db.close();
    globalThis.window = savedWindow;
    globalThis.location = savedLocation;
  }
});
