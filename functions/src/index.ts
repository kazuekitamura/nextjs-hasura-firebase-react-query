import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

admin.initializeApp()
// // firebase cloudfunction
// // authenticationのuserが新規作成される時にJWTtokenを返す、その時にhasuraのendpointの認証に必要な情報を、
// // このJWTtokenの内容に埋め込む(customClaims={}が認証に必要な情報)
// // hasuraのroleはclientからアクセスするとheaderの情報としてroleの値を上書きすることができる。上書きの指定がない場合defaultで定義されるrole
// // x-hasura-allowed-roles(存在するroleの一覧を配列で指定する)
// // x-hasura-user-id（今Loginしているuserのidを格納することができる、FirebaseのIDをhasuraのuserIDにも割り当てる）
export const setCustomClaims = functions.auth.user().onCreate(async (user) => {
  const customClaims = {
    'https://hasura.io/jwt/claims': {
      'x-hasura-default-role': 'staff',
      'x-hasura-allowed-roles': ['staff'],
      'x-hasura-user-id': user.uid,
    },
  }
  // customClaimsの設定は新規でuserを登録した時に実行される。customClaimsが付与されるまでの時間にバラツキがある。
// 毎回Reactのアプリケーション側と同期をとるために、customClaimsの設定が終わったことをReact側に通知する
// customClaimsの処理が終わった後にFirebaseのFirestoreの方にuserのmeta情報を終わった後に書き込む
// 後ほど、onSnapshotでuser_metaに変更があるか監視をして、書き込まれたタイミングを検知して同期化する
  try {
    await admin.auth().setCustomUserClaims(user.uid, customClaims)
    await admin.firestore().collection('user_meta').doc(user.uid).create({
      refreshTime: admin.firestore.FieldValue.serverTimestamp(),
    })
  } catch (e) {
    console.log(e)
  }
})