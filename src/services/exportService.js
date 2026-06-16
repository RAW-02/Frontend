import api from "./api";

export const exportVulnerability = async (cveId, format) => {
  const response = await api.get(
    `/api/vulnerability/${cveId}/export/${format}`,
    {
      responseType: "blob",
    }
  );

  return response.data;
};