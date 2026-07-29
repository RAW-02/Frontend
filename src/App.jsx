


import { BrowserRouter, Routes, Route } from "react-router";
import MainLayout from "./layouts/MainLayout";

import Dashboard          from "./pages/Dashboad";
import Search             from "./pages/Search";
import VulnerabilityDetail from "./pages/VulnerabilityDetail";
import Analytics          from "./pages/Analytics";
import Inventory          from "./pages/Inventory";
import About              from "./pages/About";

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-32 gap-3 text-slate-500">
      <i className="ti ti-map-off text-5xl text-slate-600" aria-hidden="true" />
      <p className="text-2xl font-bold text-slate-400">404</p>
      <p className="text-sm">Page not found</p>
      <a href="/" className="text-xs text-blue-400 hover:text-blue-300 underline mt-2">
        Go to dashboard
      </a>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index                        element={<Dashboard />}           />
          <Route path="search"               element={<Search />}              />
          <Route path="vulnerability/:cve"   element={<VulnerabilityDetail />} />
          <Route path="analytics"            element={<Analytics />}           />
          <Route path="inventory"            element={<Inventory />}           />
          <Route path="about"               element={<About />}               />
          <Route path="*"                   element={<NotFound />}            />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
