import dns from "node:dns";

dns.setServers(["8.8.8.8", "1.1.1.1"]);
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { connectDB } from '../config/db.js';
import { cloudinaryEnabled } from '../config/cloudinary.js';
import { uploadFile } from '../utils/image.js';
import { DEFAULT_ROLES } from '../utils/permissions.js';
import Role from '../models/Role.js';
import User from '../models/User.js';
import Setting from '../models/Setting.js';
import Menu from '../models/Menu.js';
import Category from '../models/Category.js';
import Service from '../models/Service.js';
import Project from '../models/Project.js';
import TeamMember from '../models/TeamMember.js';
import Client from '../models/Client.js';
import Software from '../models/Software.js';
import Expertise from '../models/Expertise.js';
import Standard from '../models/Standard.js';
import Page from '../models/Page.js';
import Content from '../models/Content.js';
import { toSlug } from '../utils/slug.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const FRONT = path.resolve(here, '../../../frontend');
const data = JSON.parse(fs.readFileSync(path.join(here, 'data.json'), 'utf8'));
const { pages, content } = JSON.parse(fs.readFileSync(path.join(here, 'content.json'), 'utf8'));

const RESET = process.argv.includes('--reset');
const CLOUD = process.argv.includes('--cloudinary');
if (CLOUD && !cloudinaryEnabled) { console.error('Set CLOUDINARY_* in backend/.env first.'); process.exit(1); }

const cache = new Map();
/** Returns an image object for a bundled asset path ("assets/images/x.jpg") or remote URL. */
const image = async (src, folder = 'general') => {
  if (!src) return undefined;
  if (!CLOUD) return /^https?:/.test(src) ? { url: src, publicId: '' } : { url: `/${src.replace(/^\//, '')}`, publicId: '' };
  if (cache.has(src)) return cache.get(src);
  const file = /^https?:/.test(src) ? src : path.join(FRONT, src);
  process.stdout.write(`  uploading ${path.basename(src)} ... `);
  const r = await uploadFile(file, folder);
  console.log('ok');
  const v = { url: r.secure_url, publicId: r.public_id };
  cache.set(src, v);
  return v;
};
const localName = (n) => `assets/images/${n}.jpg`;

const emptyOrReset = async (Model) => {
  if (RESET) await Model.deleteMany({});
  return (await Model.countDocuments()) === 0;
};

await connectDB();

/* ---- roles + super admin ---- */
for (const r of DEFAULT_ROLES) await Role.findOneAndUpdate({ name: r.name }, { $set: r }, { upsert: true });
const superRole = await Role.findOne({ name: 'superadmin' });
const email = (process.env.SEED_ADMIN_EMAIL || 'admin@sesdesigns.com').toLowerCase();
if (!(await User.findOne({ email }))) {
  await User.create({ name: process.env.SEED_ADMIN_NAME || 'Super Admin', email, password: process.env.SEED_ADMIN_PASSWORD || 'ChangeMe@123', role: superRole._id });
  console.log(`Super admin created: ${email}  (password from SEED_ADMIN_PASSWORD - change it after first login!)`);
}

/* ---- settings ---- */
if (RESET) await Setting.deleteMany({});
if (!(await Setting.findOne({ key: 'site' }))) {
  await Setting.create({
    key: 'site', siteName: 'Samarth Engineering Services', brandPrimary: 'SAMARTH', brandSecondary: 'Engineering Services',
    tagline: 'Engineering Structures. Building Confidence.',
    logo: await image('assets/images/ses-emblem.png', 'branding'), favicon: await image('assets/icons/favicon.png', 'branding'),
    footerAbout: 'Civil and structural design, 3D modelling and detailing for industrial, refinery, commercial, residential and infrastructure projects — from Pune, India.',
    copyright: 'Samarth Engineering Services. All rights reserved.',
    headerCtaLabel: 'Request a Consultation', headerCtaHref: 'contact.html#enquiry',
    tickerItems: data.ticker || [],
    contact: data.contact,
    enquiryNotifyEmail: data.contact.people?.[0]?.email,
  });
  console.log('Settings seeded');
}

/* ---- menus ---- */
if (await emptyOrReset(Menu)) {
  const links = [['Home', 'index.html', 'home'], ['About Us', 'about.html', 'about'], ['Services', 'services.html', 'services'], ['Projects', 'projects.html', 'projects'], ['Contact', 'contact.html', 'contact']];
  await Menu.insertMany(['header', 'footer'].flatMap((location) => links.map(([label, href, page], i) => ({ location, label, href, page, order: i }))));
  console.log('Menus seeded');
}

/* ---- categories ---- */
if (await emptyOrReset(Category)) {
  await Category.insertMany(data.filters.filter((f) => f.key !== 'all').map((f, i) => ({ key: f.key, label: f.label, order: i })));
  console.log('Categories seeded');
}
const catId = Object.fromEntries((await Category.find()).map((c) => [c.key, c._id]));

/* ---- services ---- */
if (await emptyOrReset(Service)) {
  const created = {};
  for (const [i, s] of data.services.entries()) {
    created[s.id] = await Service.create({
      slug: s.id, title: s.title, icon: s.icon, image: await image(localName(s.img), 'services'),
      short: s.short, overview: s.overview, involves: s.involves, uses: s.uses, order: i,
    });
  }
  for (const s of data.services) await Service.updateOne({ _id: created[s.id]._id }, { related: s.related.map((r) => created[r]?._id).filter(Boolean) });
  console.log('Services seeded');
}

/* ---- projects ---- */
if (await emptyOrReset(Project)) {
  for (const [i, p] of data.projects.entries()) {
    await Project.create({
      slug: p.id, title: p.title, categories: p.cats.map((c) => catId[c]).filter(Boolean), catLabel: p.catLabel, location: p.loc,
      image: await image(localName(p.img), 'projects'), type: p.type, description: p.desc, status: p.status || '', featured: !!p.featured, order: i,
    });
  }
  console.log('Projects seeded');
}

if (await emptyOrReset(TeamMember)) { await TeamMember.insertMany(data.team.map((m, i) => ({ name: m.name, role: m.role, qualification: m.qual, experience: m.exp, bio: m.text, order: i }))); console.log('Team seeded'); }
if (await emptyOrReset(Client)) { await Client.insertMany(data.clients.map((name, i) => ({ name, order: i }))); console.log('Clients seeded'); }
if (await emptyOrReset(Software)) { await Software.insertMany(data.software.map((s, i) => ({ ...s, order: i }))); console.log('Software seeded'); }
if (await emptyOrReset(Expertise)) { await Expertise.insertMany(data.expertise.map((e, i) => ({ ...e, order: i }))); console.log('Expertise seeded'); }
if (await emptyOrReset(Standard)) { await Standard.insertMany(data.codes.map((text, i) => ({ text, order: i }))); console.log('Standards seeded'); }

/* ---- pages (SEO) + body content ---- */
if (RESET) { await Page.deleteMany({}); await Content.deleteMany({}); }
for (const p of pages) {
  if (await Page.exists({ slug: p.slug })) continue;
  await Page.create({ slug: p.slug, name: p.name, seoTitle: p.seoTitle, seoDescription: p.seoDescription, ogImage: p.ogImage ? await image(p.ogImage, 'pages') : undefined });
}
let added = 0;
for (const b of content) {
  if (await Content.exists({ key: b.key })) continue;
  const doc = { ...b };
  if (b.type === 'image') doc.image = await image(b.value, 'pages');
  await Content.create(doc);
  added += 1;
}
console.log(`Pages seeded (${pages.length} pages, ${added} new content blocks)`);

console.log('\nDone.');
await mongoose.disconnect();
