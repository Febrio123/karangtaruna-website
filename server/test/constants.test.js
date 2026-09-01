// ============================================================================
// test/constants.test.js
// Unit test untuk utils/constants.js — validasi nilai konstanta RBAC
// Tanpa MongoDB. Jalankan: npm test
// ============================================================================

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  ROLES,
  ROLE_PENGURUS,
  ROLE_CONTENT,
  ROLE_ANGGARAN,
  ROLE_SITE_CONFIG,
  ROLE_PARAMETER,
  ROLE_REGISTER,
  EVENT_TYPE,
  EVENT_STATUS,
  GALERI_TYPE,
  TRANSAKSI_JENIS,
  TOKEN_EXPIRED_CODE,
} from '../src/utils/constants.js';

describe('ROLES', () => {
  test('ROLES punya 5 role sesuai requirement', () => {
    assert.equal(ROLES.length, 5);
    assert.ok(ROLES.includes('ketua'));
    assert.ok(ROLES.includes('wakil-ketua'));
    assert.ok(ROLES.includes('sekretaris'));
    assert.ok(ROLES.includes('bendahara'));
    assert.ok(ROLES.includes('anggota'));
  });
});

describe('RBAC matrix', () => {
  test('ROLE_PENGURUS = ketua + wakil-ketua', () => {
    assert.deepEqual(ROLE_PENGURUS, ['ketua', 'wakil-ketua']);
  });

  test('ROLE_CONTENT = ketua + wakil-ketua + sekretaris', () => {
    assert.deepEqual(ROLE_CONTENT, ['ketua', 'wakil-ketua', 'sekretaris']);
  });

  test('ROLE_ANGGARAN = ketua + wakil-ketua + bendahara', () => {
    assert.deepEqual(ROLE_ANGGARAN, ['ketua', 'wakil-ketua', 'bendahara']);
  });

  test('ROLE_SITE_CONFIG = ketua + wakil-ketua + sekretaris', () => {
    assert.deepEqual(ROLE_SITE_CONFIG, ['ketua', 'wakil-ketua', 'sekretaris']);
  });

  test('ROLE_PARAMETER = ketua + wakil-ketua', () => {
    assert.deepEqual(ROLE_PARAMETER, ['ketua', 'wakil-ketua']);
  });

  test('ROLE_REGISTER = ketua + wakil-ketua', () => {
    assert.deepEqual(ROLE_REGISTER, ['ketua', 'wakil-ketua']);
  });

  test('anggota TIDAK punya izin tulis apapun', () => {
    assert.ok(!ROLE_PENGURUS.includes('anggota'));
    assert.ok(!ROLE_CONTENT.includes('anggota'));
    assert.ok(!ROLE_ANGGARAN.includes('anggota'));
    assert.ok(!ROLE_SITE_CONFIG.includes('anggota'));
    assert.ok(!ROLE_PARAMETER.includes('anggota'));
    assert.ok(!ROLE_REGISTER.includes('anggota'));
  });

  test('sekretaris TIDAK bisa kelola anggaran & parameter', () => {
    assert.ok(!ROLE_ANGGARAN.includes('sekretaris'));
    assert.ok(!ROLE_PARAMETER.includes('sekretaris'));
  });

  test('bendahara TIDAK bisa kelola pengurus & parameter', () => {
    assert.ok(!ROLE_PENGURUS.includes('bendahara'));
    assert.ok(!ROLE_PARAMETER.includes('bendahara'));
  });
});

describe('Enum constants', () => {
  test('EVENT_TYPE', () => {
    assert.ok(EVENT_TYPE.includes('event'));
    assert.ok(EVENT_TYPE.includes('pengumuman'));
  });

  test('EVENT_STATUS', () => {
    assert.ok(EVENT_STATUS.includes('Mendatang'));
    assert.ok(EVENT_STATUS.includes('Selesai'));
  });

  test('GALERI_TYPE', () => {
    assert.ok(GALERI_TYPE.includes('image'));
    assert.ok(GALERI_TYPE.includes('video'));
  });

  test('TRANSAKSI_JENIS', () => {
    assert.ok(TRANSAKSI_JENIS.includes('pemasukan'));
    assert.ok(TRANSAKSI_JENIS.includes('pengeluaran'));
  });
});

describe('Token constants', () => {
  test('TOKEN_EXPIRED_CODE = TOKEN_EXPIRED', () => {
    assert.equal(TOKEN_EXPIRED_CODE, 'TOKEN_EXPIRED');
  });
});
