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
    await db.exec(fs.readFileSync('anraf backend/supabase/migrations/003_sanity_orders.sql','utf8'));
    for (const role of ['anon','authenticated']) {
      await db.exec(`set role ${role}`);
      for (const query of [
        'select * from orders', 'select * from products', 'select catalog_admin()',
        "select place_order('ref','Name','03001234567','Address','', '[]'::jsonb, true)",
        "select place_sanity_order('ref','Name','03001234567','Address','', '[]'::jsonb, true)",
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
    const sanityItems = [{product_id:'SanityGeneratedId123',name:'Sanity shirt',price:125.50,qty:2,size:'Large'}];
    const sanityOrder = (ref, items = sanityItems) => db.query(
      "select place_sanity_order($1,'Customer','03001234567','Address','', $2::jsonb,false) as result",
      [ref, JSON.stringify(items)]);
    const created = (await sanityOrder('sanity-ref')).rows[0].result;
    assert.equal(created.total,251);
    assert.equal((await sanityOrder('sanity-ref')).rows[0].result.duplicate,true);
    const line = (await db.query('select * from order_items where order_id = $1',[created.order_id])).rows[0];
    assert.equal(line.product_id,null);
    assert.equal(line.sanity_product_id,'SanityGeneratedId123');
    assert.equal(line.product_name,'Sanity shirt');
    for (const change of [{qty:1.5},{price:-1},{price:1.001},{product_id:'drafts.abc'},{size:'invalid'},{name:''}])
      await assert.rejects(sanityOrder('bad-sanity',[{...sanityItems[0],...change}]),/BAD_INPUT/);
    await assert.rejects(sanityOrder('duplicate-lines',[sanityItems[0],sanityItems[0]]),/BAD_INPUT/);
    await db.query("select set_order_status($1,'cancelled')",[created.order_id]);
    assert.equal((await db.query('select stock from products')).rows[0].stock,5);
    await assert.rejects(db.query("select set_order_status($1,'cancelled')",[first.order_id]),/BAD_TRANSITION/);
    assert.equal((await db.query('select stock from products')).rows[0].stock,5);
  } finally {
    await db.close();
    globalThis.window = savedWindow;
    globalThis.location = savedLocation;
  }
});
