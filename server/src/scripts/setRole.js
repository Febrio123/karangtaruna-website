// Script manual: mengubah peran (role) user di MongoDB.
// ALAT BANTU — jalankan secara sadar, bukan bagian dari produksi.
//
// Penggunaan:
//   node src/scripts/setRole.js --username admin --role ketua
//
// Catatan:
//   - Role hanya diterima bila termasuk whitelist ROLES (import dari constants).
//   - Normalisasi: username & role di-trim + lowercase agar cocok dengan data
//     tersimpan (skema user: lowercase + trim).
//   - Tidak pernah mencetak password / passwordHash.

import 'dotenv/config';
import { connectDB, disconnectDB } from '../config/db.js';
import { User } from '../models/user.model.js';
import { ROLES } from '../utils/constants.js';

const EXIT_USAGE = 1;

/** Parse argumen CLI sederhana: `--flag value` atau `--flag=value`. */
function parseArgs(argv) {
  const args = { username: null, role: null };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (!arg.startsWith('--')) {
      console.error(`[set-role] Argumen tak dikenal: "${arg}"`);
      process.exit(EXIT_USAGE);
    }

    let flag;
    let value;

    if (arg.includes('=')) {
      // Format: --flag=value
      const eq = arg.indexOf('=');
      flag = arg.slice(2, eq);
      value = arg.slice(eq + 1);
    } else {
      // Format: --flag value
      flag = arg.slice(2);
      value = argv[i + 1];

      if (value === undefined || value.startsWith('--')) {
        console.error(`[set-role] Flag --${flag} membutuhkan nilai.`);
        process.exit(EXIT_USAGE);
      }
      i += 1; // konsumsi nilai
    }

    if (flag === 'username') {
      args.username = value;
    } else if (flag === 'role') {
      args.role = value;
    } else {
      console.error(`[set-role] Flag tak dikenal: --${flag}`);
      process.exit(EXIT_USAGE);
    }
  }

  return args;
}

function printUsage() {
  console.log('Penggunaan: node src/scripts/setRole.js --username <username> --role <role>');
  console.log(`Role valid: ${ROLES.join(', ')}`);
}

async function main() {
  const { username, role } = parseArgs(process.argv.slice(2));

  if (!username || !role) {
    console.error('[set-role] ERROR: --username dan --role wajib diisi.');
    printUsage();
    process.exit(EXIT_USAGE);
  }

  // Validasi whitelist — sekaligus menolak nilai berbahaya (mis. "__proto__")
  // karena hanya nilai eksplisit di ROLES yang diterima.
  const normalizedRole = role.trim().toLowerCase();
  if (!ROLES.includes(normalizedRole)) {
    console.error(`[set-role] ERROR: role "${role}" tidak dikenal.`);
    console.error(`[set-role] Role yang valid: ${ROLES.join(', ')}`);
    process.exit(EXIT_USAGE);
  }

  // Username di skema: lowercase + trim -> normalisasi agar query cocok.
  const normalizedUsername = username.trim().toLowerCase();

  try {
    await connectDB();

    const updatedUser = await User.findOneAndUpdate(
      { username: normalizedUsername },
      { $set: { role: normalizedRole } },
      { new: true } // kembalikan dokumen terbaru
    );

    if (!updatedUser) {
      console.log(`[set-role] User "${normalizedUsername}" tidak ditemukan. Tidak ada perubahan.`);
      return;
    }

    console.log(
      `[set-role] Berhasil — username: "${updatedUser.username}" | role: "${updatedUser.role}"`
    );
  } catch (err) {
    console.error('[set-role] Gagal mengubah role:', err.message);
    process.exitCode = EXIT_USAGE;
  } finally {
    try {
      await disconnectDB();
    } catch (err) {
      console.error('[set-role] Gagal menutup koneksi MongoDB:', err.message);
      process.exitCode = EXIT_USAGE;
    }
  }
}

main().catch((err) => {
  console.error('[set-role] Error fatal:', err);
  process.exit(EXIT_USAGE);
});