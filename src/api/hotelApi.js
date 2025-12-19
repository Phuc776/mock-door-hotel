import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080",
});

export const getPublicHotels = () =>
  api.get("/khach-san/public");
