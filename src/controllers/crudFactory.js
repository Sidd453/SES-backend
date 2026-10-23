import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { destroyImage } from '../utils/image.js';

const STRIP = ['_id', '__v', 'createdAt', 'updatedAt'];
const clean = (body) => { const b = { ...body }; STRIP.forEach((k) => delete b[k]); return b; };
const escapeRx = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Generic CRUD controller used by most content resources.
 * opts: { searchFields, filterable, populate, sort, imageFields, select }
 */
export const crud = (Model, opts = {}) => {
  const { searchFields = [], filterable = [], populate = null, sort = 'order -createdAt', imageFields = [] } = opts;

  // Only populate when a populate option was actually supplied.
  // doc.populate('') makes Mongoose look for a path named '' and throws StrictPopulateError.
  const hasPopulate = Array.isArray(populate) ? populate.length > 0 : !!populate;
  const withPopulate = (query) => (hasPopulate ? query.populate(populate) : query);
  const populateDoc = (doc) => (hasPopulate ? doc.populate(populate) : doc);

  const list = asyncHandler(async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(500, Math.max(1, parseInt(req.query.limit, 10) || 50));
    const filter = {};
    filterable.forEach((f) => { if (req.query[f] !== undefined && req.query[f] !== '') filter[f] = req.query[f]; });
    if (req.query.search && searchFields.length) {
      const rx = new RegExp(escapeRx(String(req.query.search)), 'i');
      filter.$or = searchFields.map((f) => ({ [f]: rx }));
    }
    const [data, total] = await Promise.all([
      withPopulate(Model.find(filter).sort(req.query.sort || sort).skip((page - 1) * limit).limit(limit)),
      Model.countDocuments(filter),
    ]);
    res.json({ success: true, data, total, page, pages: Math.ceil(total / limit) || 1 });
  });

  const get = asyncHandler(async (req, res) => {
    const doc = await withPopulate(Model.findById(req.params.id));
    if (!doc) throw ApiError.notFound();
    res.json({ success: true, data: doc });
  });

  const create = asyncHandler(async (req, res) => {
    const doc = await Model.create(clean(req.body));
    res.status(201).json({ success: true, data: await populateDoc(doc) });
  });

  const update = asyncHandler(async (req, res) => {
    const doc = await Model.findById(req.params.id);
    if (!doc) throw ApiError.notFound();
    const body = clean(req.body);
    const stale = [];
    imageFields.forEach((f) => {
      if (f in body && doc[f]?.publicId && doc[f].publicId !== body[f]?.publicId) stale.push(doc[f].publicId);
    });
    doc.set(body);
    await doc.save();
    await Promise.all(stale.map(destroyImage));
    res.json({ success: true, data: await populateDoc(doc) });
  });

  const remove = asyncHandler(async (req, res) => {
    const doc = await Model.findById(req.params.id);
    if (!doc) throw ApiError.notFound();
    await doc.deleteOne();
    await Promise.all(imageFields.map((f) => destroyImage(doc[f]?.publicId)));
    res.json({ success: true, message: 'Deleted' });
  });

  return { list, get, create, update, remove };
};
