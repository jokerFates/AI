export class ApiResponse<T> {
    code: number;
    message: string;
    data: T;

    constructor(code?: number, message?: string, data?: T) {
        this.code = code ?? 200;
        this.message = message ?? '';
        this.data = data ?? null;
    }

    static success<T>(message?: string, data?: T): ApiResponse<T> {
        return new ApiResponse(200, message, data);
    }

    static fail<T>(message?: string, data?: T): ApiResponse<T> {
        return new ApiResponse(400, message, data);
    }
}
