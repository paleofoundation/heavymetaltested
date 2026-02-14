import Link from 'next/link';
import { getAll } from '@/lib/content';

type Topic = { title: string; slug: string; description: string };
export default function MechanismsIndexPage() {
  const items = getAll<Topic>('mechanisms');
  return <section className="container section"><h1>Mechanisms Library</h1><div className="grid-3">{items.map((i)=><Link key={i.slug} className="card" href={`/mechanisms/${i.slug}`}><h3>{i.title}</h3><p>{i.description}</p></Link>)}</div></section>;
}
