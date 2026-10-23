import Media from '../models/Media.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { uploadBuffer, destroyImage } from '../utils/image.js';
import { toSlug } from '../utils/slug.js';

const FOLDERS = ['general', 'services', 'projects', 'team', 'clients', 'pages', 'branding'];

export const list = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, parseInt(req.query.limit, 10) || 40);
  const filter = req.query.folder ? { folder: req.query.folder } : {};
  const [data, total] = await Promise.all([Media.find(filter).sort('-createdAt').skip((page - 1) * limit).limit(limit), Media.countDocuments(filter)]);
  res.json({ success: true, data, total, page, pages: Math.ceil(total / limit) || 1 });
});

export const upload = asyncHandler(async (req, res) => {
  if (!req.files?.length) throw ApiError.badRequest('No image received (field name: files)');
  const folder = FOLDERS.includes(req.body.folder) ? req.body.folder : 'general';
  const saved = [];
  for (const f of req.files) {
    const base = toSlug(f.originalname.replace(/\.[^.]+$/, '')) || 'image';
    let r;
    try { r = await uploadBuffer(f.buffer, { folder, filename: base }); } catch (e) { throw new ApiError(502, `Image upload failed: ${e.message}`); }
    saved.push(await Media.create({
      url: r.secure_url, publicId: r.public_id, folder, originalName: f.originalname,
      format: r.format, bytes: r.bytes, width: r.width, height: r.height, uploadedBy: req.user._id,
    }));
  }
  res.status(201).json({ success: true, data: saved });
});

export const remove = asyncHandler(async (req, res) => {
  const m = await Media.findById(req.params.id);
  if (!m) throw ApiError.notFound();
  await destroyImage(m.publicId);
  await m.deleteOne();
  res.json({ success: true, message: 'Image deleted' });
});
