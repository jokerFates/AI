import { login, logon } from "@/services/api/login";
import { getSessionList } from "@/services/api/session";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

type UserState = {
  username?: string;
  password?: string;
  token?: string;
  sessionList?: Session.SessionData[];
  selectedBookId?: string | null;
  id: number;
};

const initialState: UserState = {
  username: localStorage.getItem("username") || "",
  password: "",
  token: "",
  sessionList: [],
  id: 0,
};

const logonAction = createAsyncThunk(
  "auth/logon",
  async (values: Login.LogonParams) => {
    const res = await logon(values);
    return res.data;
  }
);

const loginAction = createAsyncThunk<Login.LoginResponse, Login.LoginParams>(
  "auth/login",
  async (values: Login.LoginParams) => {
    const res = await login(values);
    return res.data;
  }
);

const getSessionListAction = createAsyncThunk<Session.SessionData[], string>(
  "auth/get/sessionList",
  async (user: string) => {
    const res = await getSessionList(user);
    return res.data;
  }
);

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    // 你可以在这里添加更多的reducer函数
    changeSessionList(state, { payload }: { payload: UserState }) {
      state.sessionList = [...payload.sessionList];
    },
    changeSelectedBookId(state, { payload }: { payload: string | null }) {
      state.selectedBookId = payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loginAction.fulfilled, (state, { payload }) => {
      state.token = payload?.token;
      state.username = payload?.username;
      state.id = payload?.id;
      localStorage.setItem("username", payload?.username);
      localStorage.setItem("token", payload?.token);
      localStorage.setItem("id", payload?.id.toString());
    });
    builder.addCase(getSessionListAction.fulfilled, (state, { payload }) => {
      state.sessionList = [...payload];
    });
  },
});

// 导出action creators
export const { changeSessionList,changeSelectedBookId } = userSlice.actions;
export { loginAction, logonAction, getSessionListAction };

// 导出slice的reducer
export default userSlice.reducer;
