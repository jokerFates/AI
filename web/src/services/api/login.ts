import request from "..";

// 登录
export const login = (params: Login.LoginParams): Promise<API.ResponseData<Login.LoginResponse>> => {
    return request.post('/auth/login', params);
};

// 注册
export const logon = (params: Login.LogonParams): Promise<API.ResponseData<Login.LoginResponse>> => {
    return request.post('/auth/logon', params);
};

// 登出
export const logout = (): Promise<API.ResponseData<null>> => {
  return request.post('/auth/logout');
};