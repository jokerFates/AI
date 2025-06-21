declare namespace Session {

    export interface SessionAddParams {
        title: string
        chat?: string
        user?:string
    }

    export interface SessionUpdateParams {
        title?: string
        chat?: string
        update_time?: string
    }

    export interface SessionData {
        title: string
        chat?: string
        id: number
        createTime?: string
        update_time: string
        group?: string
    }
}