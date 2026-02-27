import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Editorial Standards — Heavy Metal Facts',
  description:
    'How Heavy Metal Facts sources, verifies, and publishes evidence-based content on heavy metal contamination.',
};

export default function EditorialStandardsPage() {
  return (
    <>
      <header style={{ background: 'var(--iu-text)', color: 'var(--iu-white)' }}>
        <div className="container" style={{ paddingBlock: 'var(--iu-space-3xl) var(--iu-space-xl)' }}>
          <h1 style={{ fontFamily: 'var(--iu-font-serif)', fontSize: 'var(--iu-ts-41)', marginBottom: 'var(--iu-space-sm)' }}>
            Editorial Standards
          </h1>
          <p style={{ fontSize: 'var(--iu-ts-16)', color: 'rgba(255,255,255,0.55)' }}>
            Last updated: February 2026
          </p>
        </div>
      </header>

      <section className="container container-narrow section">
        <div className="article-content">

          <h2>Mission</h2>
          <p>
            Heavy Metal Facts exists to make heavy metal contamination data accessible, understandable,
            and actionable. We translate peer-reviewed research, regulatory developments, and laboratory
            findings into evidence-based content that serves consumers, brands, researchers, and policymakers.
          </p>

          <h2>Editorial Independence</h2>
          <p>
            Heavy Metal Facts operates editorially independent from HMTc (Heavy Metal Tested &amp; Certified)
            and any commercial certification activity. Our newsroom coverage, metal profiles, testing primers,
            mechanisms content, and playbooks are produced based on the strength of available evidence — not on
            the certification status of any product or brand. We do not accept payment for coverage, and no
            advertiser or certification client influences what we publish or how we frame it.
          </p>
          <p>
            When we reference HMTc&rsquo;s certification framework, we disclose the organizational
            relationship explicitly.
          </p>

          <h2>Evidence Hierarchy</h2>
          <p>
            Every claim published on Heavy Metal Facts is grounded in sourced evidence. We assign one of the
            following evidence-tier labels to source material, listed from strongest to most provisional:
          </p>
          <table>
            <thead>
              <tr>
                <th>Tier</th>
                <th>Label</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td><strong>Peer-reviewed</strong></td>
                <td>Published in a peer-reviewed journal with disclosed methodology</td>
              </tr>
              <tr>
                <td>2</td>
                <td><strong>Regulatory</strong></td>
                <td>Official guidance, action levels, or rulings from agencies (FDA, EPA, EFSA, WHO, etc.)</td>
              </tr>
              <tr>
                <td>3</td>
                <td><strong>Consensus-standard</strong></td>
                <td>Codex Alimentarius, ASTM, ISO, or equivalent body standards</td>
              </tr>
              <tr>
                <td>4</td>
                <td><strong>Industry report</strong></td>
                <td>Testing data or analysis from recognized organizations (e.g., Consumer Reports, ATSDR toxicological profiles)</td>
              </tr>
              <tr>
                <td>5</td>
                <td><strong>Expert commentary</strong></td>
                <td>Statements from credentialed subject-matter experts, used for context, not as standalone proof</td>
              </tr>
            </tbody>
          </table>
          <p>
            When multiple tiers apply to a single claim, we cite the strongest available tier. When only
            lower-tier evidence exists, we state that explicitly so readers can calibrate confidence.
          </p>

          <h2>Sourcing Requirements</h2>
          <ul>
            <li>
              <strong>Primary sources preferred.</strong> We link to original journal articles, regulatory
              documents, or laboratory reports — not secondary summaries — whenever the primary source is
              publicly available.
            </li>
            <li>
              <strong>Minimum two independent sources</strong> for any factual claim about contamination
              levels, health effects, or regulatory thresholds, except where only a single authoritative
              source exists (e.g., a specific FDA action level). In single-source cases, we note that
              limitation.
            </li>
            <li>
              <strong>No anonymous sourcing</strong> for factual claims about contamination or health risk.
              Expert commentary may be attributed by name and credential only.
            </li>
            <li>
              <strong>Preprints and non-peer-reviewed work</strong> may be referenced when they are the only
              available data on a timely topic, but must be labeled as such and may not be presented as
              settled evidence.
            </li>
          </ul>

          <h2>Content Types &amp; Standards</h2>

          <h3>Newsroom (Weekly Briefings)</h3>
          <ul>
            <li>Cover developments from the current reporting cycle: new research, regulatory actions, marketplace changes, and investigative findings relevant to heavy metal contamination</li>
            <li>Contextualize new findings within the existing body of evidence — a single study does not rewrite consensus</li>
            <li>Attribute all claims and link to source material</li>
            <li>Disclose when coverage intersects with HMTc&rsquo;s certification scope</li>
          </ul>

          <h3>Metal Profiles (Big 8)</h3>
          <ul>
            <li>Evidence-oriented overviews of exposure pathways, health mechanisms, testing methods, and regulatory standards for each of the eight metals we cover: Aluminum, Arsenic, Cadmium, Chromium, Lead, Mercury, Nickel, and Tin</li>
            <li>Updated when material new evidence emerges, with update timestamps and change notes</li>
          </ul>

          <h3>Testing Primers</h3>
          <ul>
            <li>Technical explainers written for a non-specialist audience, covering analytical methods (ICP-MS, speciation), laboratory interpretation (COAs, LOQ vs. LOD), and sampling methodology</li>
            <li>Reviewed for accuracy by at least one team member with relevant analytical or auditing expertise</li>
          </ul>

          <h3>Standards</h3>
          <ul>
            <li>Reference pages documenting regulatory thresholds, action levels, and consensus standards across jurisdictions</li>
            <li>Cite the issuing authority and effective date for every standard listed</li>
          </ul>

          <h3>Mechanisms</h3>
          <ul>
            <li>Explain the biological and environmental pathways by which heavy metals cause harm (bioaccumulation, toxicokinetics, organ-system effects)</li>
            <li>Grounded in peer-reviewed toxicology; no speculative health claims</li>
          </ul>

          <h3>Playbooks</h3>
          <ul>
            <li>Actionable guidance for consumers and brands on reducing heavy metal exposure or achieving compliance</li>
            <li>Clearly distinguish between regulatory requirements and best-practice recommendations</li>
          </ul>

          <h2>Accuracy &amp; Fact-Checking</h2>
          <ul>
            <li>Every article undergoes editorial review by at least one person other than the primary author before publication</li>
            <li>Quantitative claims (contamination levels, regulatory limits, study sample sizes) are verified against the cited source during review</li>
            <li>We do not round, truncate, or reframe numerical data in ways that change its meaning</li>
            <li>Units of measurement follow the International System of Units (SI) unless a regulatory standard uses a different convention, in which case both are provided</li>
          </ul>

          <h2>Conflicts of Interest</h2>
          <ul>
            <li>Authors and editors disclose any financial, professional, or personal relationships that could be perceived as influencing their coverage</li>
            <li>Heavy Metal Facts&rsquo; relationship to HMTc is disclosed on our About page and in any content where HMTc&rsquo;s work or certification is discussed</li>
            <li>We do not accept sponsored content, native advertising, or affiliate compensation</li>
            <li>If an author has a conflict with respect to a particular story, that author recuses from editorial decisions on that piece</li>
          </ul>

          <h2>Corrections &amp; Updates Policy</h2>
          <p>We take errors seriously. When we get something wrong, we fix it openly.</p>
          <ul>
            <li>
              <strong>Corrections:</strong> Factual errors are corrected as soon as they are identified.
              A correction note is appended to the article with the date of the correction and a
              description of what changed.
            </li>
            <li>
              <strong>Substantive updates:</strong> When material new evidence changes the weight or
              interpretation of a previously published claim, we update the article, add an
              &ldquo;Updated&rdquo; timestamp, and include an archived diff summary describing what
              changed and why.
            </li>
            <li>
              <strong>Minor edits:</strong> Typographical fixes, broken links, and formatting changes do
              not require a correction note but are reflected in the &ldquo;Updated At&rdquo; timestamp.
            </li>
            <li>
              <strong>Reporting errors:</strong> Readers, sources, and subject-matter experts can report
              errors by contacting our editorial team. We review all reported errors and respond with
              the outcome.
            </li>
          </ul>

          <h2>AI Use &amp; Disclosure</h2>
          <ul>
            <li>Heavy Metal Facts may use AI-assisted tools for research support, drafting, data analysis, or content formatting</li>
            <li>All AI-assisted content is reviewed, verified, and approved by a human editor before publication</li>
            <li>AI tools are never the sole source for any factual claim — every claim must trace to a citable, human-verifiable source</li>
            <li>When AI-generated imagery is used, it is labeled as such in the image caption or alt text</li>
          </ul>

          <h2>Accessibility &amp; Inclusivity</h2>
          <ul>
            <li>All images include descriptive alt text</li>
            <li>Data tables include proper headers and semantic markup</li>
            <li>Content is written at a level accessible to an informed general audience; technical terms are defined on first use or linked to our Testing Literacy Center glossary</li>
            <li>We follow WCAG 2.1 AA guidelines as a baseline accessibility standard</li>
          </ul>

          <h2>Reader Trust Signals</h2>
          <p>To help readers evaluate our content at a glance, every article includes:</p>
          <ul>
            <li>Author byline(s) with linked bios and credentials</li>
            <li>Published date and updated date (both visible in frontmatter)</li>
            <li>Evidence-tier labels on source references</li>
            <li>Metal tags identifying which of the Big 8 metals are discussed</li>
            <li>Category tags for topical classification</li>
            <li>Linked references to all source material cited</li>
          </ul>

          <hr style={{ border: 'none', borderTop: '1px solid var(--iu-border)', margin: 'var(--iu-space-xl) 0' }} />
          <p style={{ fontSize: 'var(--iu-ts-14)', color: 'var(--iu-text-muted)' }}>
            These standards are reviewed annually and updated when our editorial practices evolve.
            Questions or concerns about our editorial standards can be directed to our editorial team.
          </p>
        </div>
      </section>
    </>
  );
}
