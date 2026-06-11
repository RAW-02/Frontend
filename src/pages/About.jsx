export default function About() {
    return (
      <div className="max-w-3xl mx-auto space-y-8">
  
        <div>
          <h1 className="text-2xl font-bold text-slate-100">About</h1>
          <p className="text-sm text-slate-500 mt-1">
            Vulnerability Intelligence & Threat Prioritization Platform
          </p>
        </div>
  
        <section className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-300">
            <i className="ti ti-shield-lock text-blue-400 text-base" aria-hidden="true" />
            What is VITP?
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            The Unified Vulnerability Intelligence & Threat Prioritization Platform is a cybersecurity solution designed to
            collect, correlate, enrich, and prioritize vulnerability information from multiple trusted public sources.
            
            Unlike traditional vulnerability databases that provide isolated information, this platform combines
            vulnerability details, exploit intelligence, active exploitation status, and exploitation probability into a single
            unified view, helping security professionals quickly identify and prioritize high-risk vulnerabilities
          </p>
        </section>
  
      </div>
    );
  }