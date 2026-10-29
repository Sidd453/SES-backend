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
import { asyncHandler } from '../utils/asyncHandler.js';
import { optimise } from '../utils/image.js';

const active = { isActive: true };
const sorted = 'order createdAt';
const img = (i, w) => optimise(i?.url, w);

/**
 * One call returns everything the public site needs, already shaped like the
 * `SES.data` object the frontend uses. GET /api/public/site?page=home
 */
export const site = asyncHandler(async (req, res) => {
  const pageSlug = String(req.query.page || '').toLowerCase();
  const [settings, menus, categories, services, projects, team, clients, software, expertise, standards, page, content] = await Promise.all([
    Setting.findOne({ key: 'site' }).lean(),
    Menu.find({ isVisible: true }).sort('order').lean(),
    Category.find(active).sort(sorted).lean(),
    Service.find(active).sort(sorted).lean(),
    Project.find(active).sort(sorted).populate('categories', 'key').lean(),
    TeamMember.find(active).sort(sorted).lean(),
    Client.find(active).sort('order name').lean(),
    Software.find(active).sort(sorted).lean(),
    Expertise.find(active).sort(sorted).lean(),
    Standard.find(active).sort(sorted).lean(),
    pageSlug ? Page.findOne({ slug: pageSlug }).lean() : null,
    pageSlug ? Content.find({ page: pageSlug }).lean() : [],
  ]);
  const s = settings || {};
  const slugById = new Map(services.map((x) => [String(x._id), x.slug]));

  const blocks = {};
  content.forEach((c) => {
    blocks[c.key] = c.type === 'image'
      ? { type: 'image', src: img(c.image, 1600) || c.value, alt: c.alt, href: c.hasHref ? c.href : undefined }
      : { type: c.type, value: c.value, suffix: c.suffix, href: c.hasHref ? c.href : undefined };
  });

  res.set('Cache-Control', 'public, max-age=5, must-revalidate');
  res.json({
    success: true,
    settings: {
      siteName: s.siteName, brandPrimary: s.brandPrimary, brandSecondary: s.brandSecondary, tagline: s.tagline,
      logo: s.logo?.url || '', favicon: s.favicon?.url || '', footerAbout: s.footerAbout, copyright: s.copyright,
      headerCtaLabel: s.headerCtaLabel, headerCtaHref: s.headerCtaHref, tickerItems: s.tickerItems || [], social: s.social || [],
    },
    menus: {
      header: menus.filter((m) => m.location === 'header').map(({ label, href, page: p, openInNewTab }) => ({ label, href, page: p, openInNewTab })),
      footer: menus.filter((m) => m.location === 'footer').map(({ label, href, page: p, openInNewTab }) => ({ label, href, page: p, openInNewTab })),
    },
    page: page ? { slug: page.slug, title: page.seoTitle, description: page.seoDescription, ogImage: page.ogImage?.url } : null,
    content: blocks,
    data: {
      contact: s.contact || { addressLines: [], people: [] },
      services: services.map((x) => ({
        id: x.slug, icon: x.icon, title: x.title, img: img(x.image, 900), short: x.short, overview: x.overview,
        involves: x.involves, uses: x.uses, related: (x.related || []).map((r) => slugById.get(String(r))).filter(Boolean),
      })),
      filters: [{ key: 'all', label: 'All' }, ...categories.map((c) => ({ key: c.key, label: c.label }))],
      projects: projects.map((p) => ({
        id: p.slug, featured: p.featured ? 1 : 0, title: p.title, cats: (p.categories || []).map((c) => c.key), catLabel: p.catLabel,
        loc: p.location, img: img(p.image, 900), type: p.type, desc: p.description, status: p.status || undefined,
      })),
      expertise: expertise.map((e) => ({ icon: e.icon, title: e.title, text: e.text })),
      codes: standards.map((c) => c.text),
      software: software.map((x) => ({ name: x.name, note: x.note })),
      clients: clients.map((c) => c.name),
      team: team.map((m) => ({ name: m.name, role: m.role, qual: m.qualification, exp: m.experience, text: m.bio, photo: img(m.photo, 300) })),
    },
  });
});
