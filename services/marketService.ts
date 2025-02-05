import api from "./api";

export const getMarkets = async () => {
  try {
    const response = await api.get("/markets");
    return response.data;
  } catch (error) {
    console.error("Error fetching markets:", error);
    throw error;
  }
};
