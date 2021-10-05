import Head from 'next/head'
import Image from 'next/image'
import { Auth } from '../components/Auth'
import { Layout } from '../components/Layout'
import { GetStaticProps } from 'next'
import { dehydrate } from 'react-query/hydration'
import { fetchNews } from '../hooks/useQueryNews'
import { News } from '../types/types'
import { QueryClient, useQueryClient } from 'react-query'

// queryClientの中に、_app.tsxのHydrateで注入されたcaheのdataが入ってくるのでgetQueryDataで取り出す
export default function Home() {
  const queryClient = useQueryClient();
  const data = queryClient.getQueryData<News[]>("news");
  return (
    <Layout title="Home">
      <p className="mb-5 text-blue-500 text-xl">News list by SSG</p>
      {data?.map((news) => (
        <p className="font-bold" key={news.id}>
          {news.content}
        </p>
      ))}
      <Auth />
    </Layout>
  )
}
// ReactQueryでprefetchをする場合はprefetchQuery関数を使う。第一引数はcacheのkey,第二引数はfetchを行うための関数
// GetStaticPropsはアプリケーションをビルドするときに、サーバーサイドで実行される、又はISRが呼び出された時にgetStaticPropsの内容が実行される
// 第二引数のfetch関数を使ってHasuraのgrahqlSaverから、newsのdataの一覧を取得してqueryClientのcacheに格納する
// dehydrate,fetchしたdataを取り出して、index.jsonファイルに書き出してくれる。
// revalidate: 3secの間はuserからアクセスがあってもHtmlファイルの再生成は行わない
export const getStaticProps: GetStaticProps = async () => {
  const queryClient = new QueryClient()
  await queryClient.prefetchQuery('news', fetchNews)
  return {
    props:{
      dehydratedState: dehydrate(queryClient),
    },
    revalidate: 3,
  }
}