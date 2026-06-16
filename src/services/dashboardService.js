import api from "./api";

export const getStats = () => {
  return api.get("/dashboard/summary");
};

export const getRecentVulnerabilities = () => {
  return api.get("/dashboard/recent-cves");
};

export const getTopVendors = () => {
  return api.get("/dashboard/top-products");
};

// temporary
export const getTrendData = () => {
  return Promise.resolve({
    data: [],
  });
};