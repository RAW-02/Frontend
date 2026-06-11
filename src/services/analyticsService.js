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
export const getAnalytics = () => {
  return api.get("/api/analytics");
};