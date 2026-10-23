import Setting from '../models/Setting.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { destroyImage } from '../utils/image.js';

const getDoc = async () => (await Setting.findOne({ key: 'site' })) || Setting.create({ key: 'site' });

export const get = asyncHandler(async (_req, res) => res.json({ success: true, data: await getDoc() }));

export const update = asyncHandler(async (req, res) => {
  const doc = await getDoc();
  const body = { ...req.body };
  ['_id', '__v', 'key', 'createdAt', 'updatedAt'].forEach((k) => delete body[k]);
  const stale = ['logo', 'favicon'].filter((f) => f in body && doc[f]?.publicId && doc[f].publicId !== body[f]?.publicId).map((f) => doc[f].publicId);
  doc.set(body);
  await doc.save();
  await Promise.all(stale.map(destroyImage));
  res.json({ success: true, data: doc });
});
