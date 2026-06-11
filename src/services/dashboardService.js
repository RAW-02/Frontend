import api from "./api";

export const getStats = () => {
  // api.get() sends GET http://localhost:8000/api/stats
  return api.get("/api/stats");
};

// fetches the latest CVEs for the recent list.
// We pass it as a query param: GET /api/recent?limit=5
export const getRecentVulnerabilities = (limit = 5) => {
  return api.get("/api/recent", {
    params: { limit },
  });
};

// fetches the vendor bar chart data.
export const getTopVendors = (limit = 5) => {
  return api.get("/api/top-vendors", {
    params: { limit },
  });
};

// fetches the 7-day CVE count chart data.
export const getTrendData = () => {
  return api.get("/api/trend");
};