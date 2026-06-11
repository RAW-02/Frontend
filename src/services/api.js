import axios from "axios";

// Create a custom Axios instance.
// "instance" is just a pre-configured version of axios.
// Every call made with this instance automatically prepends the baseURL.
// So searchVulnerabilities("/api/search?q=log4j") becomes
// http://localhost:8000/api/search?q=log4j
const instance = axios.create({
  // This is where your FastAPI backend is running locally.
  // When you deploy, you change this one line.
  baseURL: "http://localhost:8000",
  timeout: 10000,
});

// searchVulnerabilities — calls GET /api/search?q=<query>
// query: the string the user typed in the search box
// Returns: the full Axios response object (caller reads .data)
export const searchVulnerabilities = (query) => {
  return instance.get("/api/search", {
    params: { q: query },   // Axios converts this to ?q=<query> in the URL
  });
};

// getVulnerabilityById — calls GET /api/vulnerability/<cveId>
// cveId: string like "CVE-2021-44228"
// Returns the full vulnerability object from your backend
export const getVulnerabilityById = (cveId) => {
  return instance.get(`/api/vulnerability/${cveId}`);
};

// getAnalytics — calls GET /api/analytics
// Returns all four datasets in one response:
// { severity_distribution, top_vendors, top_cwes, top_products }
export const getAnalytics = () => {
  return instance.get("/api/analytics");
};