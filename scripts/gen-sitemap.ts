import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const SITE = 'https://commutertransit.com.au';

type Entry = { loc: string; changefreq: string; priority: string };

const routes: Entry[] = [
  { loc: '/', changefreq: 'weekly', priority: '1.0' },
  { loc: '/services/chauffeur', changefreq: 'monthly', priority: '0.9' },
  { loc: '/services/wheelchair-accessible', changefreq: 'monthly', priority: '0.9' },
  { loc: '/services/airport-transfers', changefreq: 'monthly', priority: '0.9' },
  { loc: '/services/event-corporate', changefreq: 'monthly', priority: '0.9' },
  { loc: '/services/logistics', changefreq: 'monthly', priority: '0.9' },
  { loc: '/services/rail-replacement', changefreq: 'monthly', priority: '0.9' },
  { loc: '/services/vehicle-hire', changefreq: 'monthly', priority: '0.9' },
  { loc: '/privacy', changefreq: 'yearly', priority: '0.3' },
  { loc: '/terms', changefreq: 'yearly', priority: '0.3' },
];

const today = new Date().toISOString().split('T')[0];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    (r) => `  <url>
    <loc>${SITE}${r.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;

const out = join(process.cwd(), 'public', 'sitemap.xml');
writeFileSync(out, xml, 'utf8');
console.log(`✓ Sitemap written: ${out} (${routes.length} entries, lastmod ${today})`);
