import { useState } from "react";

// ── Static data ────────────────────────────────────────────────

const DATA_SOURCES = [
  { icon: "ti-database",     name: "NVD",       color: "#3b82f6", desc: "CVSS scores, CWE, affected products" },
  { icon: "ti-shield",       name: "MITRE",     color: "#a78bfa", desc: "CVE definitions and official identifiers" },
  { icon: "ti-percentage",   name: "EPSS",      color: "#facc15", desc: "30-day exploitation probability" },
  { icon: "ti-bug",          name: "CISA KEV",  color: "#f87171", desc: "Confirmed active exploitation watchlist" },
  { icon: "ti-brand-github", name: "GitHub",    color: "#e2e8f0", desc: "PoC repos, exploit code and scanners" },
  { icon: "ti-flame",        name: "ExploitDB", color: "#fb923c", desc: "Public exploit archive" },
];

const FEATURES = [
  { icon: "ti-antenna",      color: "#3b82f6", title: "Multi-source Collection",  desc: "Aggregates CVE intelligence from 6 trusted public sources in a unified pipeline." },
  { icon: "ti-sparkles",     color: "#a78bfa", title: "Automated Enrichment",     desc: "Each CVE is enriched with EPSS, KEV status, GitHub intelligence and exploit data." },
  { icon: "ti-chart-dots",   color: "#f97316", title: "Composite Threat Score",   desc: "Proprietary algorithm combines CVSS, EPSS, KEV and exploit data into one risk number." },
  { icon: "ti-search",       color: "#06b6d4", title: "Full-text CVE Search",     desc: "Search across CVE IDs, descriptions, vendors, products and weakness categories." },
  { icon: "ti-chart-pie",    color: "#facc15", title: "Analytics Dashboard",      desc: "Severity distribution, top vendors, top CWEs and EPSS trends across all indexed data." },
  { icon: "ti-download",     color: "#4ade80", title: "Export Reports",           desc: "Export any CVE report as PDF, JSON, CSV or Excel for team sharing." },
];


const TEAM = [
  {
    name:    "Atharva",
    avatar:  "A",
    color:   "#a78bfa",
    passion: "Cybersecurity & Network Engineering",
    quote:   "Hackers don't break in — they log in.",
    interests: ["Cybersecurity", "Network Engineering"],
  },
  {
    name:    "Rishabh",
    avatar:  "R",
    color:   "#3b82f6",
    passion: "Cybersecurity & Network Engineering",
    quote:   "The quieter you become, the more you are able to hear.",
    interests: ["Cybersecurity", "Network Engineering"],
  },
];

// ── Sub-components ─────────────────────────────────────────────

function SectionTitle({ icon, label, color = "#06b6d4" }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      <div className="h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0"
           style={{ background: `${color}18`, border: `1px solid ${color}28` }}>
        <i className={`ti ${icon} text-sm`} style={{ color }} />
      </div>
      <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
        {label}
      </h2>
    </div>
  );
}

function Card({ children, className = "" }) {
  return (
    <div className={`bg-slate-900/70 border border-slate-800 rounded-2xl p-6 ${className}`}>
      {children}
    </div>
  );
}

function MemberCard({ member }) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-slate-800 p-7 transition-all duration-300 hover:-translate-y-1 hover:border-slate-600"
      style={{
        background: `radial-gradient(ellipse at top left, ${member.color}0d, transparent 65%), #0e1829`,
      }}
    >
      {/* Top accent */}
      <div className="absolute left-0 top-0 h-[2px] w-full"
           style={{ background: `linear-gradient(90deg, ${member.color}, transparent)` }} />

      {/* Avatar + name */}
      <div className="flex flex-col items-center text-center gap-4">
        <div
          className="h-20 w-20 rounded-3xl flex items-center justify-center text-white text-3xl font-bold shadow-xl"
          style={{
            background:  `linear-gradient(145deg, ${member.color}99, ${member.color})`,
            boxShadow:   `0 12px 32px ${member.color}30`,
          }}
        >
          {member.avatar}
        </div>

        <div>
          <h3 className="text-2xl font-bold text-slate-100">{member.name}</h3>
          <p className="text-xs font-semibold mt-1" style={{ color: member.color }}>
            {member.passion}
          </p>
        </div>

        {/* Quote */}
        <p className="text-xs text-slate-500 italic leading-relaxed max-w-xs">
          "{member.quote}"
        </p>

        {/* Shared interest tags */}
        <div className="flex flex-wrap justify-center gap-2 pt-1">
          {member.interests.map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-medium px-2.5 py-1 rounded-full border"
              style={{
                background:   `${member.color}10`,
                borderColor:  `${member.color}25`,
                color:         member.color,
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────

export default function About() {
  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-16">

      {/* ── HERO ────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden rounded-2xl border border-slate-800 p-8"
        style={{ background: "radial-gradient(ellipse at 60% 0%, #1e3a5f44, transparent 60%), #0e1829" }}
      >
        <div className="absolute left-0 top-0 h-[2px] w-full"
             style={{ background: "linear-gradient(90deg, #06b6d4, #3b82f6, #a78bfa, transparent)" }} />

        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/25">
            <i className="ti ti-shield-bolt text-2xl text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-100">UniVulner</h1>
            <p className="text-sm text-cyan-400 mt-0.5 font-medium">
              Unified Vulnerability Intelligence & Threat Prioritization Platform
            </p>
          </div>
        </div>

        <p className="text-sm text-slate-400 leading-relaxed max-w-3xl">
          UniVulner collects, correlates, enriches, and prioritizes vulnerability intelligence
          from six trusted public sources. Unlike traditional CVE databases, it combines CVSS scores,
          real-time exploit intelligence, CISA KEV confirmation, EPSS probability and GitHub activity
          into a single composite threat score — helping security professionals instantly identify
          what needs patching right now.
        </p>

        <div className="flex flex-wrap gap-2 mt-5">
          {[
            { icon: "ti-database",   label: "6 Data Sources" },
            { icon: "ti-chart-dots", label: "Composite Threat Score" },
            { icon: "ti-antenna",    label: "Automated Enrichment" },
            { icon: "ti-refresh",    label: "Scheduled Sync" },
          ].map((pill) => (
            <span key={pill.label}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 border border-slate-700 bg-slate-800/60 px-3 py-1.5 rounded-full">
              <i className={`ti ${pill.icon} text-cyan-400 text-sm`} />
              {pill.label}
            </span>
          ))}
        </div>
      </div>
      

      {/* ── DATA SOURCES ────────────────────────────────────── */}
      <div>
        <SectionTitle icon="ti-plug-connected" label="Intelligence Sources" color="#06b6d4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {DATA_SOURCES.map((src) => (
            <div key={src.name}
              className="relative overflow-hidden bg-slate-900/70 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-colors">
              <div className="absolute left-0 top-0 h-[2px] w-full"
                   style={{ background: `linear-gradient(90deg, ${src.color}, transparent)` }} />
              <div className="flex items-center gap-3 mb-2">
                <div className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0"
                     style={{ background: `${src.color}18`, border: `1px solid ${src.color}28` }}>
                  <i className={`ti ${src.icon} text-sm`} style={{ color: src.color }} />
                </div>
                <span className="text-sm font-semibold text-slate-200">{src.name}</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">{src.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── KEY FEATURES ────────────────────────────────────── */}
      <div>
        <SectionTitle icon="ti-sparkles" label="Platform Features" color="#a78bfa" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <Card key={f.title} className="hover:border-slate-700 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0"
                     style={{ background: `${f.color}18`, border: `1px solid ${f.color}28` }}>
                  <i className={`ti ${f.icon} text-base`} style={{ color: f.color }} />
                </div>
                <span className="text-sm font-semibold text-slate-200">{f.title}</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
            </Card>
          ))}
        </div>
      </div>

      

      {/* ── TEAM ────────────────────────────────────────────── */}
      <div>
        <SectionTitle icon="ti-users" label="Built By" color="#3b82f6" />

        {/* Shared mission line */}
        <p className="text-sm text-slate-500 text-center mb-6 leading-relaxed">
          Two engineers driven by <span className="text-cyan-400 font-medium">cybersecurity</span> and{" "}
          <span className="text-cyan-400 font-medium">network engineering</span> — built UniVulner
          to make vulnerability intelligence fast, unified, and actionable.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {TEAM.map((member) => (
            <MemberCard key={member.name} member={member} />
          ))}
        </div>
      </div>

      {/* ── FOOTER ──────────────────────────────────────────── */}
      <div className="text-center py-6 border-t border-slate-800/60">
        <p className="text-xs text-slate-600">
          UniVulner · Built by Rishabh & Atharva · All data sourced from public, authoritative feeds
        </p>
        <p className="text-xs text-slate-700 mt-1">
          NVD · MITRE · CISA KEV · EPSS · GitHub · ExploitDB
        </p>
      </div>

    </div>
  );
}
