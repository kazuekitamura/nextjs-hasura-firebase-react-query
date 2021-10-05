import Cookie from 'universal-cookie'
import firebase from '../firebaseConfig'
import { unSubMeta } from './useUserChanged'
import { useQueryClient } from 'react-query'
import { useDispatch } from 'react-redux'
import { resetEditedTask, resetEditedNews } from '../slices/uiSlice'

const cookie = new Cookie()

//if (unSubMeta)subscriptionを停止する関数が存在する場合はunSubMetaを実行してsubscriptionを停止する
// dispatch(resetEditedTask()) reduxの中のstateをリセット
// queryClient.removeQueriesでtasksとnewsのcacheの削除
export const useLogout = () => {
    const dispatch = useDispatch()
    const queryClient = useQueryClient()
    const logout = async () => {
        if (unSubMeta){
            unSubMeta()
        }
        dispatch(resetEditedTask())
        dispatch(resetEditedNews())
        await firebase.auth().signOut()
        queryClient.removeQueries("tasks")
        queryClient.removeQueries("news")
        cookie.remove('token')
    }
    return { logout }
}

