import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const root = process.cwd();
const newsDir = path.join(root, 'content', 'news');
const base = 'https://heavymetalfacts.com';
const posts = fs.readdirSync(newsDir).filter((f) => f.endsWith('.mdx')).map((file) => {
  const raw = fs.readFileSync(path.join(newsDir, file), 'utf8');
  const { data } = matter(raw);
  return data;
}).sort((a,b) => new Date(b.publishedAt)-new Date(a.publishedAt));

const items = posts.map((p) => `<item><title>${p.title}</title><link>${base}/news/${p.slug}</link><pubDate>${new Date(p.publishedAt).toUTCString()}</pubDate><description>${p.description}</description></item>`).join('');
const rss = `<?xml version="1.0" encoding="UTF-8" ?><rss version="2.0"><channel><title>Heavy Metal Facts Newsroom</title><link>${base}/news</link><description>Weekly heavy metal contamination briefing.</description>${items}</channel></rss>`;
fs.writeFileSync(path.join(root, 'public', 'rss.xml'), rss);

const staticRoutes=['','/big-8','/categories','/news','/standards','/testing','/mechanisms','/playbooks','/playbooks/consumers','/playbooks/brands','/playbooks/manufacturers','/editorial-standards','/tools','/tools/metals-matrix','/tools/risk-orientation'];
const dynamic=[...posts.map((p)=>`/news/${p.slug}`)];
for (const dir of ['metals','categories','primers','mechanisms']) {
  for (const file of fs.readdirSync(path.join(root,'content',dir))) {
    const {data}=matter(fs.readFileSync(path.join(root,'content',dir,file),'utf8'));
    const map={metals:'metals',categories:'categories',primers:'testing',mechanisms:'mechanisms'};
    dynamic.push(`/${map[dir]}/${data.slug}`)
  }
}
const urls=[...staticRoutes,...dynamic].map((r)=>`<url><loc>${base}${r}</loc></url>`).join('');
fs.writeFileSync(path.join(root,'public','sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`);
fs.writeFileSync(path.join(root,'public','robots.txt'),`User-agent: *\nAllow: /\nSitemap: ${base}/sitemap.xml\n`);
console.log('feeds generated');
