import api from "./api";

// getAnalytics - fetches all four chart datasets in one call.
// Sends: GET /api/analytics
// Expected response shape:
// {
//   severity_distribution : [{ name: "Critical", value: 8510 }, ...],
//   top_vendors           : [{ name: "Microsoft", value: 4210 }, ...],
//   top_cwes              : [{ name: "CWE-79",    value: 3812 }, ...],
//   top_products          : [{ name: "Windows",   value: 2940 }, ...]
// }

export const getDashboardAnalytics = () =>
  api.get("/api/analytics/dashboard");

export const getSeverityAnalytics = () =>
  api.get("/api/analytics/severity");

export const getVendorAnalytics = () =>
  api.get("/api/analytics/vendors");

export const getTopCweAnalytics = () =>
  api.get("/api/analytics/top-cwe");

export const getEpssAnalytics = () =>
  api.get("/api/analytics/epss");

export const getThreatScoreAnalytics = () =>
  api.get("/api/analytics/threat-score");