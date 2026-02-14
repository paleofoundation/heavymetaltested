import Link from 'next/link';
import { getAll } from '@/lib/content';

type Metal = { title: string; slug: string; description: string };

export default function Big8Page() {
  const items = getAll<Metal>('metals');
  return (
    <section className="container section">
      <h1>Big 8 Metals Hub</h1>
      <p>Use this hub to compare pathways, testing nuances, and newsroom coverage for each certified heavy metal profile.</p>
      <div className="grid-3">
        {items.map((m) => (
          <Link className="card" href={`/metals/${m.slug}`} key={m.slug}><h3>{m.title}</h3><p>{m.description}</p></Link>
        ))}
      </div>
    </section>
  );
}
