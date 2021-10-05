import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { EditNews, EditTask } from '../types/types'
import { RootState } from '../app/store'

export interface uiState {
    editedTask: EditTask
    editedNews: EditNews
}
// 初期値
const initialState: uiState = {
    editedTask: {
        id: '',
        title: '',
    },
    editedNews: {
        id: '',
        content: '',
    }
}
// Sliceの作成,reducersはcomponentsから呼び出される。editedTaskのstateに格納したい,新しいobjectの内容を引数で渡す
// 引数にaction.payloadでアクセスすることができる。引数のデータ型はPayloadActionのジェネリックスの中に指定することができる。
// resetEditedTaskはeditedTaskを初期値にリセットするための関数
export const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers:{
        setEditedTask: (state, action: PayloadAction<EditTask>) => {
            state.editedTask = action.payload
        },
        resetEditedTask: (state) => {
            state.editedTask = initialState.editedTask
        },
        setEditedNews: (state, action: PayloadAction<EditNews>) => {
            state.editedNews = action.payload
        },
        resetEditedNews: (state) => {
            state.editedNews = initialState.editedNews
        },
    },
})
export const {
    setEditedTask,
    resetEditedTask,
    setEditedNews,
    resetEditedNews,
} = uiSlice.actions


// Reactのcomponetからreduxの中のstateを取得するための関数
export const selectTask = (state: RootState) => state.ui.editedTask
export const selectNews = (state: RootState) => state.ui.editedNews


export default uiSlice.reducer