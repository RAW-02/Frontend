import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function MainLayout() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#020617] text-slate-100">

      {/* Main Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#020617] via-[#08111f] to-[#020617]" />

      {/* Cyber Grid */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(56,189,248,0.20) 1px, transparent 1px),
            linear-gradient(90deg, rgba(56,189,248,0.20) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Top Left Glow */}
      <div className="absolute -top-52 -left-40 h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[140px]" />

      {/* Top Right Glow */}
      <div className="absolute top-20 right-20 h-72 w-72 rounded-full bg-indigo-500/10 blur-[120px]" />

      {/* Bottom Right Glow */}
      <div className="absolute -bottom-40 right-0 h-[450px] w-[450px] rounded-full bg-blue-600/10 blur-[150px]" />

      {/* Bottom Left Glow */}
      <div className="absolute bottom-10 left-20 h-64 w-64 rounded-full bg-emerald-500/5 blur-[120px]" />

      {/* Decorative Rings */}
      <div className="absolute top-24 right-32 h-64 w-64 rounded-full border border-cyan-500/5" />
      <div className="absolute bottom-20 left-24 h-40 w-40 rounded-full border border-blue-500/5" />

      {/* Noise Layer */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">
          <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8 animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}