import api from "./api";

// searchVulnerabilities — full-text search across the vulnerability database.
// Sends: GET /api/search?q=apache+log4j&page=1&limit=20
// Expected response shape:
// {
//   results: [
//     {
//       cve_id       : "CVE-2021-44228",
//       severity     : "Critical",
//       threat_score : 9.8,
//       epss         : 0.975,
//       kev          : true,
//       poc          : true,
//       exploit      : true,
//       ai_summary   : "Log4Shell is a critical RCE..."
//     },
//     ...
//   ],
//   total: 4
// }
export const searchVulnerabilities = (query, page = 1, limit = 20) => {
  return api.get("/api/search", {
    params: {
      q     : query.trim(),
      page,
      limit,
    },
  });
};