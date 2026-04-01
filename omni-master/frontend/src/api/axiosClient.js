/**
 * Axios client pre-configured for the OmniShield backend API.
 */
import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:4000/api",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default apiClient;
