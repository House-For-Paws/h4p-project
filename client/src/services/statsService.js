import api from "./api";

export const getAvailablePetsCount = async () => {
  const response = await api.get("/admin/available-count");
  return response.data;
};
