import { useEffect } from 'react'
import { GraphQLClient } from 'graphql-request'
import { useQuery } from 'react-query'
import { Task } from '../types/types'
import { GET_TASKS } from '../queries/queries'
import Cookie from 'universal-cookie'

// tasksのtableのPermissionsについて、selectのGETでタスクの一覧を取得する関数は、
// LoginをしたStaffの権限を持つuserだけが、自分が作ったtaskの一覧を取得することができる
// そのuserが取得しているJWTtokenをheaderに付与して、tasksのendpointにアクセスする必要がある
const cookie = new Cookie();
const endpoint = process.env.NEXT_PUBLIC_HASURA_ENDPOINT
let graphQLClient: GraphQLClient

// taskの一覧のデータ型
interface TasksRes {
    tasks: Task[]
}

// JWTtokenのheaderを付与したい場合、graphQLClient.requestを使う
const fetchTasks = async () => {
    const { tasks: data } = await graphQLClient.request<TasksRes>(GET_TASKS)
    return data
}
// 第二引数にcookieの値を指定することで、userが切り替わった場合は、それぞれ違うJWTtokenを持っているので、
// その新しいtokenを使ってGraphQLClientを新しく作り直される
export const useQueryTasks = () => {
    useEffect(() => {
        graphQLClient = new GraphQLClient(endpoint,{
            headers:{
                Authorization: `Bearer ${cookie.get('token')}`,
            },
        })
    },[cookie.get('token')])
    return useQuery<Task[],Error>({
        queryKey: 'tasks',
        queryFn: fetchTasks,
        staleTime: 0,
    })
}