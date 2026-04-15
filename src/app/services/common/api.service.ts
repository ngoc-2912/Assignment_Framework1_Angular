import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { API_URL } from "../../../environment/environment";

export class BaseApi {

  protected axios: AxiosInstance;

  constructor() {

    this.axios = axios.create({
      baseURL: API_URL,
      timeout: 10000
    });

    // interceptor request
    this.axios.interceptors.request.use((config) => {
  let token = null;

 
  if (typeof window !== 'undefined') {
    token = localStorage.getItem("token");
  }
      

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;

    });

  }

  protected async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {

    const res = await this.axios.get<T>(url, config);
    
    return res.data;

  }

  protected async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {

    const res = await this.axios.post<T>(url, data, config);

    return res.data;

  }

  protected async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {

    const res = await this.axios.put<T>(url, data, config);

    return res.data;

  }

  protected async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {

    const res = await this.axios.delete<T>(url, config);

    return res.data;

  }

}