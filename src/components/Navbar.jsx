

import { useState } from "react";
import { NavLink } from "react-router";

const navLinks = [
  { label: "Dashboard", path: "/",          icon: "ti-layout-dashboard" },
  { label: "Search",    path: "/search",    icon: "ti-search"           },
  { label: "Analytics", path: "/analytics", icon: "ti-chart-bar"        },
  { label: "Inventory", path: "/inventory", icon: "ti-file-spreadsheet" },
  { label: "About",     path: "/about",     icon: "ti-info-circle"      },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const linkClass = ({ isActive }) =>
    `relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300
    ${isActive
      ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
      : "text-slate-400 hover:text-white hover:bg-slate-800/70"}`;

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-2xl bg-slate-950/80 border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex h-20 items-center justify-between">

          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-4 group">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20 transition-transform duration-300 group-hover:rotate-6">
              <i className="ti ti-shield-lock text-xl text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight text-white">UniVulner</h1>
              <p className="text-xs text-slate-500">Threat Intelligence Platform</p>
            </div>
          </NavLink>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={linkClass}
                end={link.path === "/"}
              >
                <i className={`ti ${link.icon} text-lg`} />
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Right Side */}
          <div className="hidden lg:flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5">
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-emerald-300">Live Feed</span>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-800 text-cyan-400">
              <i className="ti ti-user text-lg" />
            </div>
          </div>

          {/* Mobile toggle */}
          <button
            className="lg:hidden rounded-xl border border-slate-800 bg-slate-900 p-2 text-slate-300"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <i className={`ti ${menuOpen ? "ti-x" : "ti-menu-2"} text-xl`} />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-slate-950/95 backdrop-blur-xl">
          <div className="space-y-2 p-4">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={linkClass}
                end={link.path === "/"}
                onClick={() => setMenuOpen(false)}
              >
                <i className={`ti ${link.icon}`} />
                {link.label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
