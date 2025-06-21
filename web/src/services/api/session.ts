import request from "..";

// 新增会话
export const addSession = (
  params: Session.SessionAddParams
): Promise<API.ResponseData<number>> => {
  return request.post("/session", {
    ...params,
    user: localStorage.getItem("username"),
  });
};

// 修改会话
export const updateSession = (
  id: string,
  params: Session.SessionUpdateParams
): Promise<API.ResponseData<number>> => {
  return request.post(`/session/update/${id}`, params);
};

// 获取会话
export const getSessionById = (
  id: string
): Promise<API.ResponseData<Session.SessionData>> => {
  return request.get(`/session/${id}`);
};

// 获取会话列表
export const getSessionList = (
  user: string
): Promise<API.ResponseData<Session.SessionData[]>> => {
  return request.get(`/session/list/${user}`);
};

// 删除会话
export const deleteSession = (
  id: string
): Promise<API.ResponseData<number>> => {
  return request.delete(`/session/${id}`);
};

