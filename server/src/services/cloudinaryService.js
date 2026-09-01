// ============================================================================
// services/cloudinaryService.js — wrapper Cloudinary upload/destroy
// ============================================================================

import cloudinary, { isConfigured } from '../config/cloudinary.js';
import { ApiError } from '../utils/ApiError.js';
import { DEFAULT_FOLDER_CLOUDINARY } from '../utils/constants.js';

function assertConfigured() {
  if (!isConfigured) {
    throw new ApiError(503, 'Cloudinary belum dikonfigurasi. Isi CLOUDINARY_* di .env untuk mengaktifkan upload media.');
  }
}

/**
 * Upload buffer (hasil multer memoryStorage) ke Cloudinary.
 * @param {Buffer} buffer
 * @param {{folder?: string, resourceType?: 'auto'|'image'|'video', publicId?: string}} options
 * @returns {Promise<{public_id: string, secure_url: string}>}
 */
export function uploadBuffer(buffer, { folder = DEFAULT_FOLDER_CLOUDINARY, resourceType = 'auto', publicId = null } = {}) {
  assertConfigured();
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        ...(publicId ? { public_id: publicId } : {}),
        // Hemat kuota tier gratis: optimasi kualitas, format webp untuk gambar
        ...(resourceType === 'image' ? { quality: 'auto:good', fetch_format: 'auto' } : {}),
      },
      (error, result) => {
        if (error) {
          return reject(new ApiError(502, `Upload media gagal: ${error.message}`));
        }
        return resolve({
          public_id: result.public_id,
          secure_url: result.secure_url,
        });
      }
    );
    stream.end(buffer);
  });
}

/**
 * Hapus aset dari Cloudinary (dipanggil saat item DB dihapus).
 * @param {string|null|undefined} publicId
 * @param {'image'|'video'|'raw'|'auto'} resourceType
 */
export async function destroy(publicId, resourceType = 'image') {
  if (!publicId) return { result: 'ok' };
  assertConfigured();
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, { resource_type: resourceType }, (error, result) => {
      if (error) return reject(new ApiError(502, `Hapus media gagal: ${error.message}`));
      return resolve(result);
    });
  });
}