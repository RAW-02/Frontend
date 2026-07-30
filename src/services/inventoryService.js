import api from "./api";

/**
 * analyzeInventory
 * Sends the CSV file to the backend as multipart/form-data.
 *
 * @param {File} file  — the CSV File object from the browser
 * @returns {Promise}  — resolves with the full analysis JSON
 *
 * Backend:  POST /api/inventory/analyze
 * Param:    file  (multipart/form-data)
 * Response: { summary: {...}, components: [...] }
 */
export const analyzeInventory = (file) => {
  const formData = new FormData();

  // "file" must match the FastAPI parameter name exactly
  formData.append("file", file);

  return api.post("/api/inventory/analyze", formData, {
    headers: {
      // Let the browser set the boundary automatically
      // Do NOT hardcode Content-Type here — Axios handles it
      "Content-Type": "multipart/form-data",
    },
  });
};
