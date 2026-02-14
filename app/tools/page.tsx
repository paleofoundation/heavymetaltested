import Link from 'next/link';

export default function ToolsPage() {
  return <section className="container section"><h1>Interactive tools</h1><div className="grid-3"><Link href="/tools/metals-matrix" className="card"><h3>Metal-to-category matrix</h3><p>Explore common mapping patterns and rationale.</p></Link><Link href="/tools/risk-orientation" className="card"><h3>Risk orientation</h3><p>Educational orientation based on life stage and category.</p></Link></div></section>;
}
