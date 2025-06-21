
import { getSessionById } from '@/services/api/session';
import { ChatType } from '@/ts/enums/chat';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

interface ChatState {
    modal?: ChatType
    sessionKey?: string
    chat?: string
}

const initialState: ChatState = {
    modal: ChatType['通义千问-LONG'],
    sessionKey: '0',
    chat: '[]'
};

const getCurChatAction = createAsyncThunk<Session.SessionData, string>("chat/get/:id", async (sessionKey: string) => {
    const res = await getSessionById(sessionKey)
    return res.data
})

const chatSlice = createSlice({
    name: 'chat',
    initialState,

    reducers: {
        changeModal(state, { payload }: { payload: ChatState }) {
            state.modal = payload.modal;
        },
        changeSessionKey(state, { payload }: { payload: ChatState }) {
            state.sessionKey = payload.sessionKey
        },
        changeCurChat(state, { payload }: { payload: ChatState }) {
            state.chat = payload.chat
        }
    },
    extraReducers: builder => {
        builder.addCase(getCurChatAction.fulfilled, (state, { payload }) => {
            state.chat = payload.chat
        })
    }
});

// 导出action creators
export const { changeModal, changeSessionKey,changeCurChat } = chatSlice.actions;
export { getCurChatAction }

// 导出slice的reducer
export default chatSlice.reducer;