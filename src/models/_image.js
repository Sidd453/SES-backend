import { Schema } from 'mongoose';

/** Reusable embedded image: { url, publicId } (publicId empty for local/static assets). */
export const imageField = { type: new Schema({ url: { type: String, trim: true }, publicId: { type: String, default: '' } }, { _id: false }), default: undefined };
