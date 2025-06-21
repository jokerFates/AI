import { getBookList } from "@/services/api/book";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

interface BookState {
  bookList: Book.BookItem[];
  isUploading?: boolean;

  // 阅览
  isPreview: boolean;
  content: string;
  previewId: number;
  rawData: null | Book.PreviewRes;
}

const initialState: BookState = {
  bookList: [],
  isUploading: false,
  isPreview: false,
  content: "",
  previewId: 0,
  rawData: null,
};

const getBookListAction = createAsyncThunk<Book.BookListResponse[], string>(
  "book/list",
  async (user: string) => {
    const res = await getBookList(user);
    return res.data;
  }
);

const bookSlice = createSlice({
  name: "session",
  initialState,
  reducers: {
    changeBookList(state, { payload }: { payload: Book.BookItem[] }) {
      state.bookList = [...payload];
    },
    changeIsUploading(state, { payload }: { payload: boolean }) {
      state.isUploading = payload;
    },
    changeBookPreview(state, { payload }) {
      state.isPreview = payload.isPreview;
      state.content = payload.content || "";
      state.previewId = payload.previewId || 0;
      state.rawData = payload.rawData;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(
      getBookListAction.fulfilled,
      (state, { payload }: { payload: Book.BookListResponse[] }) => {
        const newList = payload.map((item) => {
          return {
            key: item.id.toString(),
            checked: false,
            title: item.name.split(item.fileType)[0],
            fileExtension:item.fileExtension
          };
        });
        state.bookList = [...newList];
      }
    );
  },
});

// 导出action creators
export const { changeBookList, changeIsUploading, changeBookPreview } =
  bookSlice.actions;
export { getBookListAction };

// 导出slice的reducer
export default bookSlice.reducer;
