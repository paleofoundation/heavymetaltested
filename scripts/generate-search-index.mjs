import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const root = process.cwd();
const types = ['metals', 'categories', 'news', 'primers', 'mechanisms', 'playbooks'];
const records = [];
for (const type of types) {
  const dir = path.join(root, 'content', type);
  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith('.mdx')) continue;
    const raw = fs.readFileSync(path.join(dir, file), 'utf8');
    const { data, content } = matter(raw);
    const slug = data.slug;
    const routeMap = { metals: `/metals/${slug}`, categories: `/categories/${slug}`, news: `/news/${slug}`, primers: `/testing/${slug}`, mechanisms: `/mechanisms/${slug}`, playbooks: `/playbooks/${slug}` };
    records.push({
      title: data.title,
      description: data.description,
      body: content.slice(0, 1200),
      metals: data.metals || [data.metalKey].filter(Boolean),
      categories: data.categories || [data.categoryKey].filter(Boolean),
      href: routeMap[type]
    });
  }
}
fs.writeFileSync(path.join(root, 'public', 'search-index.json'), JSON.stringify(records, null, 2));
console.log(`search-index: ${records.length} records`);
