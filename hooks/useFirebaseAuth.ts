import { useState, useCallback, ChangeEvent, FormEvent } from 'react'
import firebase from '../firebaseConfig'

export const useFirebaseAuth = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLogin, setIsLogin] = useState(true)

    const emailChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value)
    },[])
    const pwChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value)
    },[])
    const resetInput = useCallback(() => {
        setEmail('')
        setPassword('')
    },[])
    // isLoginのtrue,falseを反転する関数。toggleModeに対してuseCallbackを適応する場合は第二引数に[isLogin]を指定する必要がある
    // toggleModeの関数の中でisLoginのstateを参照して使っているので第二引数に[isLogin]を指定しないと、
    // useCallbackを使って最初にtoggleModeがmemo化される時はisLoginのstateは初期値が使われる、それ以降isLoginが変化してもtoggleModeの中のisLoginのstateが初期値になってしまい正常な動作をしない
    const toggleMode = useCallback(() => {
        setIsLogin(!isLogin)
    },[isLogin])
    // userがEmailとpasswordを入力してsubmitbuttonが押した時の関数
    const authUser = useCallback(
        async (e:FormEvent<HTMLFormElement>) => {
            e.preventDefault()
            if(isLogin){
                try {
                    await firebase.auth().signInWithEmailAndPassword(email, password)
                } catch (e) {
                    alert(e.message)
                }
                resetInput()
            } else {
                try {
                    await firebase.auth().createUserWithEmailAndPassword(email, password)
                } catch (e) {
                    alert(e.message)
                }
                resetInput()
            }
        },
        [email, password, isLogin]
    )

    return {
        email,
        password,
        emailChange,
        pwChange,
        resetInput,
        isLogin,
        toggleMode,
        authUser,
    }
}