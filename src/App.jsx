import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/Dashboad";
import Search from "./pages/Search"
import VulnerabilityDetail from "./pages/VulnerabilityDetail"
import Analytics from "./pages/Analytics"

function About()     { return <h1 className="text-2xl font-semibold">About</h1>; }
function NotFound()  { return <h1 className="text-2xl font-semibold">404 — Page not found</h1>; }

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>

          <Route index element={<Dashboard />} />
          <Route path="search"    element={<Search />} />
          <Route path="vulnerability/:cve" element={<VulnerabilityDetail />} />
          <Route path="analytics" element={<Analytics />} />
          
          <Route path="about"     element={<About />} />

          {/* "*" catches any URL that didn't match above */}
          <Route path="*" element={<NotFound />} />

        </Route>

      </Routes>
    </BrowserRouter>
  );
}