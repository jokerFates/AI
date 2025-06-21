import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import userReducer from "@/stores/slice/user";
import chatReducer from "@/stores/slice/chat";
import sessionReducer from "@/stores/slice/session";
import bookReducer from "@/stores/slice/book";

const store = configureStore({
  reducer: {
    user: userReducer,
    chat: chatReducer,
    session: sessionReducer,
    book: bookReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;

export default store;
