import { useState } from "react";
import { NavLink } from "react-router-dom";

const navLinks = [
  { label: "Home",      path: "/",          icon: "ti-home"        },
  { label: "Search",    path: "/search",    icon: "ti-search"      },
  { label: "Analytics", path: "/analytics", icon: "ti-chart-bar"   },
  { label: "About",     path: "/about",     icon: "ti-info-circle" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  const linkClass = ({ isActive }) =>
    `flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors duration-150 ${
      isActive
        ? "bg-blue-900/50 text-blue-400"                            // active: blue highlight
        : "text-slate-400 hover:text-slate-100 hover:bg-slate-800" // default
    }`;

  return (
    <nav className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800">

      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        <div className="flex items-center justify-between h-16">
          <NavLink to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <i className="ti ti-shield-lock text-white text-base" aria-hidden="true" />
            </div>
            <span className="text-slate-100 font-semibold text-base tracking-tight">
              UniVulner <span className="text-blue-400">Platform</span>
            </span>
          </NavLink>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}  
                to={link.path}
                className={linkClass}  // our function that returns the right classes
                // "end" on the Home link means it only highlights on exactly "/"
                // Without this, "/" would also match "/search", "/analytics" etc.
                end={link.path === "/"}
              >
                <i className={`ti ${link.icon} text-base`} aria-hidden="true" />
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* ── HAMBURGER BUTTON (mobile only) ── */}
          {/* md:hidden = visible only on screens smaller than 768px */}
          <button
            className="md:hidden text-slate-400 hover:text-slate-100 p-2 rounded-md"
            onClick={() => setMenuOpen(!menuOpen)} // toggle open/closed
            aria-label="Toggle navigation menu"    // accessibility for screen readers
          >
            {/* Show X icon when menu is open, hamburger icon when closed */}
            <i className={`ti ${menuOpen ? "ti-x" : "ti-menu-2"} text-xl`} />
          </button>

        </div>
      </div>

      {/* ── MOBILE DROPDOWN MENU ── */}
      {menuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-900 px-4 py-2">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={linkClass}
              end={link.path === "/"}
              onClick={closeMenu}   // close menu when user taps a link
            >
              <i className={`ti ${link.icon} text-base`} aria-hidden="true" />
              {link.label}
            </NavLink>
          ))}
        </div>
      )}

    </nav>
  );
}