declare namespace Book {
  export interface BookItem {
    key: string;
    checked: boolean;
    title: string;
    fileExtension: string;
  }

  export interface MergeParams {
    fileName: string;
    fileType: string;
    user: string;
    md5: string;
    totalChunks: number;
    fileExtension: string;
  }

  export interface PreviewRes {
    content: string;
    html: string;
    fileName: string;
    fileType: string;
    fileExtension: string;
    type: string;
  }

  export interface BookListResponse {
    id: number;
    name: string;
    fileType: string;
    fileExtension:string;
    userAccount: string;
    fileMd5: string;
    size: string;
    path: string;
    create_time: string;
  }
}
