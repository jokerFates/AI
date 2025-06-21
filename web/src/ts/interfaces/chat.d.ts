declare namespace Chat {
    // 定义请求数据的类型（可选）
    export interface ChatParams {
        prompt: string;
    }

    export interface ChatMessage {
        role: "user" | "assistant" | "system";
        content?: string;
    }

     export interface SummaryParams extends ChatParams {
        bookId: string;
    }
}