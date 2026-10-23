import Content from '../models/Content.js';
import Page from '../models/Page.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { destroyImage } from '../utils/image.js';

export const pages = asyncHandler(async (_req, res) => {
  const counts = await Content.aggregate([{ $group: { _id: '$page', blocks: { $sum: 1 } } }]);
  res.json({ success: true, data: counts.map((c) => ({ page: c._id, blocks: c.blocks })).sort((a, b) => a.page.localeCompare(b.page)) });
});

export const list = asyncHandler(async (req, res) => {
  const filter = req.query.page ? { page: req.query.page } : {};
  res.json({ success: true, data: await Content.find(filter).sort('page order') });
});

const EDITABLE = ['value', 'suffix', 'href', 'alt', 'image'];

const applyUpdate = async (doc, body) => {
  const stale = 'image' in body && doc.image?.publicId && doc.image.publicId !== body.image?.publicId ? doc.image.publicId : null;
  EDITABLE.forEach((k) => { if (k in body) doc[k] = body[k]; });
  await doc.save();
  if (stale) await destroyImage(stale);
  return doc;
};

export const update = asyncHandler(async (req, res) => {
  const doc = await Content.findById(req.params.id);
  if (!doc) throw ApiError.notFound('Content block not found');
  res.json({ success: true, data: await applyUpdate(doc, req.body) });
});

// PUT /content/bulk  body: { items: [{ id, value, href, ... }] }
export const bulkUpdate = asyncHandler(async (req, res) => {
  const items = Array.isArray(req.body.items) ? req.body.items : [];
  const out = [];
  for (const it of items) {
    const doc = await Content.findById(it.id);
    if (doc) out.push(await applyUpdate(doc, it));
  }
  res.json({ success: true, data: out, updated: out.length });
});
