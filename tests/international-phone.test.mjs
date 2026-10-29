import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {normalizePhone} from '../js/safety.js';

test('Pakistani formats keep their existing canonical mobile number', () => {
  for (const input of ['03001234567', '300 1234567', '923001234567', '+92 300 1234567', '0092 300 1234567']) {
    assert.equal(normalizePhone(input), '+923001234567', input);
  }
});

test('UAE numbers and international country codes normalize without changing country', () => {
  const cases = [
    ['+971 50 123 4567', '+971501234567'],
    ['00971 50 123 4567', '+971501234567'],
    ['0501234567', '+971501234567'],
    ['501234567', '+971501234567'],
    ['+44 7700 900123', '+447700900123'],
    ['0044 7700 900123', '+447700900123'],
    ['+1 (202) 555-0123', '+12025550123'],
    ['+1 300 123 4567', '+13001234567'],
    ['+966 50 123 4567', '+966501234567'],
    ['+61 412 345 678', '+61412345678'],
  ];
  for (const [input, expected] of cases) {
    assert.equal(normalizePhone(input), expected, input);
    assert.equal(normalizePhone(expected), expected, 'normalization is stable');
  }
});

test('invalid or ambiguous international phone input is rejected', () => {
  for (const input of [null, 123456789, '', ' ', '+', '+0123456789', '+1234567',
    '+1234567890123456', '++971501234567', '+971+501234567', '971+501234567',
    '+971501234567 ext 1', '<script>', '300123', '+92300123', '00447700900123x',
    '447700900123']) {
    assert.equal(normalizePhone(input), '', String(input));
  }
});

test('checkout explains international dialing without a fixed Pakistani prefix', () => {
  const html = readFileSync(new URL('../checkout.html', import.meta.url), 'utf8');
  assert.doesNotMatch(html, /<span class="phone-prefix">\+92<\/span>/);
  assert.match(html, /aria-describedby="phoneHelp"/);
  assert.match(html, /For international numbers, include your country code/);
  assert.doesNotMatch(html, /Please enter a valid Pakistani mobile number/);
});
