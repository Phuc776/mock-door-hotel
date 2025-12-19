import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/door",
});

export const getRoomsByHotel = (hotelId) =>
  api.get(`/rooms/${hotelId}`);

export const openDoor = (phongId, token) =>
  api.post(`/room/${phongId}/open-door`, null, {
    params: { token },
  });
