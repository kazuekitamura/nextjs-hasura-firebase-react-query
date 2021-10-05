import { useEffect } from 'react'
import { GraphQLClient } from 'graphql-request'
import { useQueryClient, useMutation } from 'react-query'
import Cookie from 'universal-cookie'
import {
    CREATE_TASK,
    DELETE_TASK,
    UPDATE_TASK,
    CREATE_NEWS,
    DELETE_NEWS,
    UPDATE_NEWS,
} from '../queries/queries'
import { Task, EditTask, News, EditNews } from '../types/types'
import { useDispatch } from 'react-redux'
import { resetEditedTask, resetEditedNews } from '../slices/uiSlice'

const cookie = new Cookie();
const endpoint = process.env.NEXT_PUBLIC_HASURA_ENDPOINT
let graphQLClient: GraphQLClient

// CREATE_TASKで新しくtaskを作成した場合、Reactqueryのcacheの方も自分で更新する必要がある、
// 既存のcacheにアクセスするためにuseQueryClientを使う
export const useAppMutate = () => {
    const dispatch = useDispatch();
    const queryClient = useQueryClient();

    useEffect(() => {
        graphQLClient = new GraphQLClient(endpoint,{
            headers:{
                Authorization: `Bearer ${cookie.get('token')}`,
            },
        })
    },[cookie.get('token')])
    // graphQLClient.requestで第一引数に実行したいコマンド（CREATE_TASK）, 第二引数にgraphQLserverに渡していくdata（title: title)
    // onSuccess（成功した）場合、既存のcacheの内容に今作成した新しいtaskを自分で追加する必要がある。
    // (res)にはgraphQLのレスポンスが入ってくる。previousTodosに既存のcacheの一覧を取得する
    // if(previousTodos)既存の配列が存在する場合は、スプレッドで展開して、末尾に新しいtaskを追加して、新しい配列としてsetQueryDataでcacheに格納する
    const createTaskMutation = useMutation(
        (title: string) => graphQLClient.request(CREATE_TASK, { title: title }),
        {
            onSuccess: (res) => {
                const previousTodos = queryClient.getQueryData<Task[]>('tasks')
                if(previousTodos){
                    queryClient.setQueryData('tasks', [
                        ...previousTodos,
                        res.insert_tasks_one,
                    ])
                }
                dispatch(resetEditedTask())
            },
            onError: () => {
                dispatch(resetEditedTask())
            },
        }
    )
    // previousTodos.map((task)既存のcaheの内容をmapで展開して、今更新したdataのIDに一致するものは、更新後のobjectに置き換える
    // それ以外のものは既存のobjectの内容をそのまま渡す
    const updateTaskMutation = useMutation(
        (task: EditTask) => graphQLClient.request(UPDATE_TASK, task),
        {
            onSuccess: (res, variables) => {
                const previousTodos = queryClient.getQueryData<Task[]>('tasks')
                if(previousTodos){
                    queryClient.setQueryData<Task[]>(
                        'tasks',
                        previousTodos.map((task) =>
                            task.id === variables.id ? res.update_tasks_by_pk :task
                        )
                    )
                }
                dispatch(resetEditedTask())
            },
            onError: () => {
                dispatch(resetEditedTask())
            },
        }
    )
    // variablesにはrequestで渡した、第二引数の内容が入ってくる（削除したいtaskのid）。
    // 今削除したID以外のタスクをfilterで取り出す
    const deleteTaskMutation = useMutation(
        (id: string) => graphQLClient.request(DELETE_TASK, { id: id }),
        {
            onSuccess: (res, variables) => {
                const previousTodos = queryClient.getQueryData<Task[]>('tasks')
                if(previousTodos){
                    queryClient.setQueryData<Task[]>(
                        'tasks',
                        previousTodos.filter((task) =>
                            task.id !== variables
                        )
                    )
                }
                dispatch(resetEditedTask())
            },
        }
    )

    const createNewsMutation = useMutation(
        (content: string) => graphQLClient.request(CREATE_NEWS, { content: content }),
        {
            onSuccess: (res) => {
                const previousNews = queryClient.getQueryData<News[]>('news')
                if(previousNews){
                    queryClient.setQueryData('news', [
                        ...previousNews,
                        res.insert_news_one,
                    ])
                }
                dispatch(resetEditedNews())
            },
            onError: () => {
                dispatch(resetEditedNews())
            },
        }
    )

    const updateNewsMutation = useMutation(
        (news: EditNews) => graphQLClient.request(UPDATE_NEWS, news),
        {
            onSuccess: (res, variables) => {
                const previousNews = queryClient.getQueryData<News[]>('news')
                if(previousNews){
                    queryClient.setQueryData<News[]>(
                        'news',
                        previousNews.map((news) =>
                            news.id === variables.id ? res.update_news_by_pk : news
                        )
                    )
                }
                dispatch(resetEditedNews())
            },
            onError: () => {
                dispatch(resetEditedNews())
            },
        }
    )

    const deleteNewsMutation = useMutation(
        (id: string) => graphQLClient.request(DELETE_NEWS, { id: id }),
        {
            onSuccess: (res, variables) => {
                const previousNews = queryClient.getQueryData<News[]>('news')
                if(previousNews){
                    queryClient.setQueryData<News[]>(
                        'news',
                        previousNews.filter((news) =>
                            news.id !== variables
                        )
                    )
                }
                dispatch(resetEditedNews())
            },
        }
    )
    return {
        createTaskMutation,
        updateTaskMutation,
        deleteTaskMutation,
        createNewsMutation,
        updateNewsMutation,
        deleteNewsMutation,
    }
}