import axios, { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from "axios";
import { API_URL } from "../../../environment/environment";

export class BaseApi {
  protected axios: AxiosInstance;

  constructor() {
    this.axios = axios.create({
      baseURL: API_URL,
      timeout: 10000
    });

    // Interceptor request
    this.axios.interceptors.request.use((config: InternalAxiosRequestConfig) => {
      // 1. Kiểm tra môi trường để tránh lỗi ReferenceError: localStorage
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem("token");

        // 2. Chỉ đính kèm Token nếu nó thực sự tồn tại và hợp lệ
        // Tránh gửi "Bearer null" hoặc "Bearer undefined" khiến BE báo lỗi 401
        if (token && token !== "null" && token !== "undefined") {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }

      return config;
    }, (error) => {
      return Promise.reject(error);
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