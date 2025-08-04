// Langsung definisikan base URL di sini
const API_BASE_URL = "http://localhost:8070/api";

// Cek jika URL tidak sengaja kosong
if (!API_BASE_URL) {
  throw new Error("API_BASE_URL is not defined in config/api.ts");
}

export { API_BASE_URL };