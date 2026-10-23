import cloudinary, { cloudinaryEnabled } from '../config/cloudinary.js';
import { env } from '../config/env.js';

export const uploadBuffer = (buffer, { folder = 'general', filename } = {}) =>
  new Promise((resolve, reject) => {
    if (!cloudinaryEnabled) return reject(new Error('Cloudinary is not configured. Set CLOUDINARY_* in backend/.env'));
    const stream = cloudinary.uploader.upload_stream(
      { folder: `${env.cloudinary.folder}/${folder}`, resource_type: 'image', public_id: filename, overwrite: false, unique_filename: true },
      (err, result) => (err ? reject(err) : resolve(result)),
    );
    stream.end(buffer);
  });

export const uploadFile = (path, folder) =>
  cloudinary.uploader.upload(path, { folder: `${env.cloudinary.folder}/${folder}`, resource_type: 'image', unique_filename: true });

/** Remove an image from Cloudinary. Safe no-op for local/empty ids. */
export const destroyImage = async (publicId) => {
  if (!publicId || !cloudinaryEnabled) return;
  try { await cloudinary.uploader.destroy(publicId); } catch (e) { console.warn('Cloudinary destroy failed:', e.message); }
};

/** Optimised delivery URL (f_auto,q_auto + optional width). Non-cloudinary URLs pass through. */
export const optimise = (url, width) => {
  if (!url || !url.includes('/res.cloudinary.com/') || !url.includes('/upload/')) return url || '';
  return url.replace('/upload/', `/upload/f_auto,q_auto${width ? `,w_${width}` : ''}/`);
};
