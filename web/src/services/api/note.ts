import request from "..";

// 新增笔记
export const addNote = (
  params: Note.NoteParams
): Promise<API.ResponseData<number>> => {
  return request.post("/note", params);
};

// 新增笔记预览接口
export const previewNote = (
  params: Note.NotePreviewOrDeleteParams
): Promise<API.ResponseData<string>> => {
  return request.post("/note/preview", params);
};

// 删除笔记
export const deleteNote = (
  params: Note.NotePreviewOrDeleteParams
): Promise<API.ResponseData<number>> => {
  return request.post("/note/delete", params);
};
