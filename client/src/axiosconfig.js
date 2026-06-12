import axios from "../axiosConfig";

const axiosInstance = axios.create({
  baseURL: "https://doctor-appointment-system-v4sp.onrender.com"
});

export default axiosInstance;