import api from "./api";

interface QuoteParams {
  market: string;
  from_amount: number;
  side: "buy" | "sell";
  prefunded?: boolean;
}

export const getQuote = async ({ market, from_amount, side, prefunded = false }: QuoteParams) => {
  try {
    const response = await api.get("/rfq/get_quote", {
      params: {
        market,
        from_amount,
        side,
        prefunded: prefunded ? 1 : 0,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching quote:", error);
    throw error;
  }
};
