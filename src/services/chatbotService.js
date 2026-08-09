import api from "./api";

export const sendChatMessage = (question) =>
  api.post(
    "/api/chatbot/query",
    { question },
    {
      timeout: 60000,
    }
  );

export const checkChatbotHealth = () =>
  api.get("/api/chatbot/health");