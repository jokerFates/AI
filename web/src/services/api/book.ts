import request from "..";

// 获取书籍列表
export const getBookList = (
  user: string,
  title?: string
): Promise<API.ResponseData<Book.BookListResponse[]>> => {
  return request.get("/book/list", {
    params: { user, title }
  });
};


// 获取已上传的文件切片
export const checkUploadedChunks = (
  md5: string
): Promise<API.ResponseData<number[]>> => {
  return request.get(`/book/check/${md5}`);
};

// 删除文章
export const deleteBook = (id: string): Promise<API.ResponseData<any>> => {
  return request.delete(`/book/delete/${id}`);
};

// 合并文件切片
export const mergeChunks = (
  params: Book.MergeParams
): Promise<API.ResponseData<any>> => {
  return request.post(`/book/merge`, params);
};

// 检查文件是否存在
export const checkFileExists = (
  md5: string,
  username:string
): Promise<API.ResponseData<boolean>> => {
  return request.get(`/book/existed/${md5}?username=${username}`);
};

export const preview = (
  id: number
): Promise<API.ResponseData<Book.PreviewRes>> => {
  return request.get(`/book/preview/${id}`);
};

export const updateBookTitle = async (
  id: string,
  title: string
): Promise<API.ResponseData<number>> => {
  return request.post(`/book/update-title/${id}`, { title });
};