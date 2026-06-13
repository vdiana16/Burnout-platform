/**
 * authApi.js
 * @description Definește metodele de comunicare cu API-ul pentru autentificare.
 * Fiecare funcție returnează o promisiune (Promise) bazată pe instanța Axios configurată.
 */
import api from "../../api/axios";

export const authApi = {
  login: (credentials) => {
    return api.post("login/", credentials);
  },

  register: (userData) => {
    return api.post("auth/register/", userData);
  },

  logout: () => {
    return api.post("logout/");
  },

  me: () => {
    return api.get("me/");
  }
};