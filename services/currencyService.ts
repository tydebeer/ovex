import api from "./api";

export const getCurrencies = async (type: "coin" | "fiat" = "coin") => {
  try {
    const response = await api.get(`/currencies?type=${type}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching currencies:", error);
    throw error;
  }
};
