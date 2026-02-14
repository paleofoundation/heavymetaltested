import Link from 'next/link';

export default function StandardsPage() {
  return (
    <section className="container section">
      <h1>How contaminant limits are set</h1>
      <p>Limits can be framed as feasibility-based (what supply chains and labs can reliably meet today) or safety-threshold-informed (what toxicology suggests should be targeted). Practical standards usually combine both to support measurable improvement.</p>
      <p>Concentration-based limits matter because they provide consistent acceptance criteria across batches, suppliers, and geographies.</p>
      <p>Sampling plans, analyte preparation, and instrument method details all influence final values and therefore compliance decisions.</p>
      <div id="hmtc" className="card"><h2>How HMTc operationalizes this</h2><p>HMTc translates these concepts into auditable requirements for limit setting, verification cadence, and method comparability in a neutral and implementable framework.</p><Link href="/editorial-standards">Read the neutral explainer context</Link></div>
    </section>
  );
}
