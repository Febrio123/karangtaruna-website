// ============================================================================
// test/sanitize.utils.test.js
// Unit test untuk utils/sanitize.js — escapeRegex, detectDangerousHtml,
// clampLength, safeSearchRegex
// Tanpa MongoDB. Jalankan: npm test
// ============================================================================

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  escapeRegex,
  detectDangerousHtml,
  clampLength,
  safeSearchRegex,
} from '../src/utils/sanitize.js';

// ---- escapeRegex ----
describe('escapeRegex', () => {
  test('menge-escape karakter regex khusus', () => {
    assert.equal(escapeRegex('hello.world'), 'hello\\.world');
    assert.equal(escapeRegex('a+b*c'), 'a\\+b\\*c');
    assert.equal(escapeRegex('test(line)'), 'test\\(line\\)');
    assert.equal(escapeRegex('[abc]'), '\\[abc\\]');
    assert.equal(escapeRegex('a{2}'), 'a\\{2\\}');
    assert.equal(escapeRegex('a|b'), 'a\\|b');
    assert.equal(escapeRegex('a\\b'), 'a\\\\b');
    assert.equal(escapeRegex('^start$'), '\\^start\\$');
    assert.equal(escapeRegex('?'), '\\?');
  });

  test('input non-string mengembalikan ""', () => {
    assert.equal(escapeRegex(null), '');
    assert.equal(escapeRegex(undefined), '');
    assert.equal(escapeRegex(123), '');
    assert.equal(escapeRegex({}), '');
  });

  test('string tanpa karakter khusus tetap sama', () => {
    assert.equal(escapeRegex('hello world'), 'hello world');
    assert.equal(escapeRegex('abc123'), 'abc123');
  });
});

// ---- safeSearchRegex ----
describe('safeSearchRegex', () => {
  test('menghasilkan objek $regex + $options', () => {
    const result = safeSearchRegex('test query');
    assert.deepEqual(result, { $regex: 'test query', $options: 'i' });
  });

  test('karakter khusus di-escape', () => {
    const result = safeSearchRegex('price: $10.00+');
    assert.equal(result.$regex, 'price: \\$10\\.00\\+');
    assert.equal(result.$options, 'i');
  });
});

// ---- clampLength ----
describe('clampLength', () => {
  test('string pendek tidak dipotong', () => {
    assert.equal(clampLength('short', 500), 'short');
  });

  test('string panjang dipotong sesuai maxLen', () => {
    const long = 'a'.repeat(600);
    const result = clampLength(long, 500);
    assert.equal(result.length, 500);
    assert.equal(result, 'a'.repeat(500));
  });

  test('custom maxLen', () => {
    const str = 'abcdefghij';
    assert.equal(clampLength(str, 5), 'abcde');
    assert.equal(clampLength(str, 10), 'abcdefghij');
    assert.equal(clampLength(str, 20), 'abcdefghij');
  });

  test('default maxLen = 500', () => {
    const str = 'a'.repeat(501);
    const result = clampLength(str);
    assert.equal(result.length, 500);
  });

  test('non-string dikembalikan apa adanya', () => {
    assert.equal(clampLength(null, 10), null);
    assert.equal(clampLength(42, 10), 42);
    assert.equal(clampLength(undefined, 10), undefined);
  });
});

// ---- detectDangerousHtml ----
describe('detectDangerousHtml', () => {
  test('HTML aman -> array kosong', () => {
    assert.deepEqual(detectDangerousHtml('<p>Hello <b>world</b></p>'), []);
    assert.deepEqual(detectDangerousHtml(''), []);
    assert.deepEqual(detectDangerousHtml(null), []);
  });

  test('tag <script> terdeteksi', () => {
    const r1 = detectDangerousHtml('<script>alert("xss")</script>');
    assert.ok(r1.length > 0);
    assert.ok(r1.some((p) => p.includes('script')));
  });

  test('tag <Script> (case-insensitive) terdeteksi', () => {
    const r = detectDangerousHtml('<Script src="evil.js"></Script>');
    assert.ok(r.some((p) => p.includes('script')));
  });

  test('tag < script > dengan spasi terdeteksi', () => {
    const r = detectDangerousHtml('< script >alert(1)</ script >');
    assert.ok(r.some((p) => p.includes('script')));
  });

  test('inline event handler terdeteksi', () => {
    const r1 = detectDangerousHtml('<img onload="alert(1)">');
    assert.ok(r1.some((p) => p.includes('handler') || p.includes('on*')));
  });

  test('onclick= terdeteksi', () => {
    const r = detectDangerousHtml('<div onclick="doEvil()">click</div>');
    assert.ok(r.some((p) => p.includes('handler') || p.includes('on*')));
  });

  test('onerror= terdeteksi', () => {
    const r = detectDangerousHtml('<img src=x onerror="alert(1)">');
    assert.ok(r.length > 0);
  });

  test('javascript: URI di href terdeteksi', () => {
    const r1 = detectDangerousHtml('<a href="javascript:alert(1)">link</a>');
    assert.ok(r1.some((p) => p.includes('javascript:')));
  });

  test('javascript: URI tanpa quotes terdeteksi', () => {
    const r = detectDangerousHtml('<a href=javascript:alert(1)>link</a>');
    assert.ok(r.some((p) => p.includes('javascript:')));
  });

  test('HTML aman dengan atribut normal tidak false positive', () => {
    const html = '<a href="https://example.com" target="_blank">link</a>';
    assert.deepEqual(detectDangerousHtml(html), []);
  });

  test('non-string mengembalikan []', () => {
    assert.deepEqual(detectDangerousHtml(123), []);
    assert.deepEqual(detectDangerousHtml(undefined), []);
  });
});
