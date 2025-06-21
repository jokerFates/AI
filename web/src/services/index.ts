// src/api/axiosInstance.ts

import axios, { AxiosInstance, AxiosResponse } from "axios";
import { message } from "antd"; // 假设你使用了antd来处理消息提示

// 定义基础URL，你可以根据环境变量来设置不同的URL
export const baseURL = "http://localhost:8085";

// 创建Axios实例
const request: AxiosInstance = axios.create({
  baseURL,
  timeout: 30000, // 请求超时时间
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // 如果需要携带cookie，请将此设置为true
});

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 添加文件上传的特殊处理
    if (config.data instanceof FormData) {
      // 移除默认的JSON Content-Type，浏览器会自动设置multipart/form-data
     config.headers["Content-Type"] = 'multipart/form-data';
      // 设置文件上传专用超时时间（30秒）
      config.timeout = 30_000;
    }

    // 在这里可以添加token或其他自定义请求头
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // 处理请求错误
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse) => {
    // 在这里可以统一处理响应数据，例如根据code判断请求是否成功
    if (response.data && response.data.code === 200) {
      response.data.msg && message.success(response.data.msg);
      return response.data;
    } else {
      // 处理请求失败的情况，例如弹出错误消息
      message.error(response.data.msg || "请求失败");
      return response.data;
    }
  },
  (error) => {
    // 处理响应错误，例如网络错误或服务器错误
    const { response } = error;
    // 处理 HTTP 网络错误
    let msg = "";
    // HTTP 状态码
    const status = response?.status;
    switch (status) {
      case 401:
        msg = "token 失效，请重新登录";
        // 这里可以触发退出的 action
        location.href = "/login";
        break;
      case 403:
        msg = "拒绝访问";
        break;
      case 404:
        msg = "请求地址错误";
        break;
      case 500:
        msg = "服务器故障";
        break;
      default:
        msg = "网络连接故障";
    }
    message.error(msg);
    return error;
  }
);

// 导出Axios实例
export default request;
