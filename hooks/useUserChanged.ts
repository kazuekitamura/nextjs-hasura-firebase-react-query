import { useEffect } from 'react'
import firebase from '../firebaseConfig'
import { useRouter } from 'next/router'
import Cookie from 'universal-cookie'

// Firebaseのuserが変わった時に実行される関数（user新規作成、logoutして違うuserがLoginした場合など実行）
// onsnapshotのsubscriptionをunSubスクライブで停止するための関数.Logoutのタイミングで行う
export let unSubMeta: () => void

export const useUserChanged = () => {
    const cookie = new Cookie()
    const router = useRouter()
    const HASURA_TOKEN_KEY = 'https://hasura.io/jwt/claims'

    // マウントされた時に一度だけ実行する、第二引数は空[]
    // onAuthStateChanged(userが変わるタイミングでその内容を検知する)引数の(user)に変更後の新しいuser情報が入る
    // 返り値としてsubscriptionを停止するための関数が帰ってくるのでunSubUserに格納する
    // retrunでunSubUserを実行する様にして、customfookを使っているコンポーネントがunmountされた時にonAuthStateChangedを停止する
    // if(user)userが存在するときの処理
    // hasuraのcustomClaimsが含まれているか判定するために、idTokenResultのclaimsの属性にアクセスしてHASURA_TOKEN_KEYに対応するdataを取得して、その結果をhasuraClaimsに格納する
    // if (hasuraClaims)hasuraClaimsが存在する場合は、取得したtokenをcookieにセットして/taskへ遷移する
    // else(hasuraClaimsがない場合)onSnapshotでuser.uidへの書き込みを検知する
    // 書き込みがあった場合の処理、最新のtoken,idTokenResultの取得.hasuraの情報が書き込まれているか判定をする
    // if (hasuraClaimsSnap)が存在する場合,cokieに最新のtokenを設定して
    // use_metaのonSnapshotのsubscriptionをunサブスクライブするための関数の返り値はunSubMetaに格納して、exportして他のcomponetでlogoutした時にuser_metaに対するsubscriptionをunサブスクライブする様にしておく
    useEffect(() => {
        const unSubUser = firebase.auth().onAuthStateChanged(async (user) => {
            if(user){
                const token = await user.getIdToken(true)
                const idTokenResult = await user.getIdTokenResult()
                const hasuraClaims = idTokenResult.claims[HASURA_TOKEN_KEY]
                if (hasuraClaims){
                    cookie.set('token', token, { path:'/' })
                    router.push('/tasks')
                } else {
                    const userRef = firebase
                    .firestore()
                    .collection('user_meta')
                    .doc(user.uid)
                    unSubMeta = userRef.onSnapshot(async () => {
                        const tokenSnap = await user.getIdToken(true)
                        const idTokenResultSnap = await user.getIdTokenResult()
                        const hasuraClaimsSnap = idTokenResultSnap.claims[HASURA_TOKEN_KEY]
                        if (hasuraClaimsSnap){
                            cookie.set('token', tokenSnap, { path: '/' })
                            router.push('/tasks')
                        }
                    })
                }
            }
        })
        return () => {
            unSubUser()
        }
    },[])
    return {}
}