// import api from "./api";

// export const getStats = () => {
//   return api.get("/dashboard/summary");
// };

// export const getRecentVulnerabilities = () => {
//   return api.get("/dashboard/recent-cves");
// };

// export const getTopVendors = () => {
//   return api.get("/dashboard/top-products");
// };

// // temporary
// export const getTrendData = () => {
//   return Promise.resolve({
//     data: [],
//   });
// };

















import api from "./api";

export const getStats = () =>
  api.get("/dashboard/summary");

export const getRecentVulnerabilities = () =>
  api.get("/dashboard/recent-cves");

export const getTopVendors = () =>
  api.get("/dashboard/top-products");

/**
 * Tries the real trend endpoint first.
 * Falls back silently to an empty array so the dashboard
 * can compute its own trend from CVE published dates.
 */
export const getTrendData = () =>
  api.get("/dashboard/trend").catch(() => ({ data: [] }));
