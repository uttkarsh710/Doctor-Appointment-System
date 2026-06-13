import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://doctor-appointment-system-v4sp.onrender.com"
});

export default axiosInstance;