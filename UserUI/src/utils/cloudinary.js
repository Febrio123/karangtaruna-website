const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'demo';

export function getCloudinaryUrl(publicId, options = {}) {
  if (!publicId) return null;

  const base = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload`;
  const transformations = [
    options.width && `w_${options.width}`,
    options.height && `h_${options.height}`,
    'f_auto',
    'q_auto',
    options.crop && `c_${options.crop}`,
    options.gravity && `g_${options.gravity}`,
  ].filter(Boolean).join(',');

  return `${base}/${transformations}/${publicId}`;
}
