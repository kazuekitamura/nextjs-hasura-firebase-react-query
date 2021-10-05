import { configureStore } from '@reduxjs/toolkit'
import uiReducer from '../slices/uiSlice'

// RootStateはstoreに定義されている全てのstateを取得。typeofでそのstateのデータ型を取得。データ型をひとまとめにしたものがRootState
export const store = configureStore({
    reducer: {
        ui: uiReducer,
    },
})
export type RootState = ReturnType<typeof store.getState>;