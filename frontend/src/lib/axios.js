import axios from "axios";

const BASE_URL = "/api"
export const axiosInstance = axios.create({
    baseURL: BASE_URL,
    withCredentials: true, //send teh cookies with request jwt token
    
});