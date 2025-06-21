import { ConversationsProps } from "@ant-design/x";
import { createAction, createSlice } from "@reduxjs/toolkit";
import { GetProp } from "antd";

type SessionColum = GetProp<ConversationsProps, "items">;

interface SessionState {
  activeKey: string;
  items: SessionColum;
  collapsed: boolean;
}

const initialState: SessionState = {
  activeKey: "-1",
  items: [],
  collapsed: false,
};

const toggleCollapsed = createAction("session/toggleCollapsed");

const sessionSlice = createSlice({
  name: "session",
  initialState,
  reducers: {
    changeActiveKey(state, { payload }: { payload: string }) {
      state.activeKey = payload;
    },
    changeItems(state, { payload }: { payload: SessionColum }) {
      state.items = [...payload];
    },
    changeCollapsed(state, { payload }: { payload: boolean }) {
      state.collapsed = payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(toggleCollapsed, (state) => {
      state.collapsed = !state.collapsed;
    });
  },
});

// 导出action creators
export const { changeActiveKey, changeItems, changeCollapsed } =
  sessionSlice.actions;
export { toggleCollapsed };

// 导出slice的reducer
export default sessionSlice.reducer;
