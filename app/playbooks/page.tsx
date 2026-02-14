import Link from 'next/link';

export default function PlaybooksIndexPage() {
  const items = [
    ['consumers', 'Consumers', 'Practical household decisions without fear-mongering.'],
    ['brands', 'Brands', 'Supplier qualification and substitution strategies.'],
    ['manufacturers', 'Manufacturers', 'Process control and quality engineering guidance.']
  ];
  return <section className="container section"><h1>Prevention & remediation playbooks</h1><div className="grid-3">{items.map(([slug,title,desc])=><Link key={slug} className="card" href={`/playbooks/${slug}`}><h3>{title}</h3><p>{desc}</p></Link>)}</div></section>;
}
