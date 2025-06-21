declare namespace Login {
    // 定义请求数据的类型（可选）
    export interface LoginParams {
        username: string;
        password: string;
    }

    export interface LogonParams {
        username: string;
        password: string;
    }

    export interface LoginResponse {
        id?: number;
        token?: string;
        username?: string;
    }
}