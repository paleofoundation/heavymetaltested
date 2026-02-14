import Link from 'next/link';
import { getAll } from '@/lib/content';

type Primer = { title: string; slug: string; description: string };
export default function TestingIndexPage() {
  const items = getAll<Primer>('primers');
  return <section className="container section"><h1>Testing Literacy Center</h1><div className="grid-3">{items.map((i)=><Link key={i.slug} className="card" href={`/testing/${i.slug}`}><h3>{i.title}</h3><p>{i.description}</p></Link>)}</div></section>;
}
