import '../styles/globals.css'
import { useState } from 'react'
import { QueryClient, QueryClientProvider } from "react-query"
import { ReactQueryDevtools } from 'react-query/devtools'
import { AppProps } from 'next/app'
import { useUserChanged } from '../hooks/useUserChanged'
import { Provider } from 'react-redux'
import { store } from '../app/store'
import { Hydrate } from 'react-query/hydration'

// retry: defaultは3回までretryする。
// refetchOnWindowFocus：userがFoucusを当てる度にdataをとってくるが過剰なFetchを発生させてしまう
// HydrateのpageProps.dehydratedStateでindex.jsonにあるdataが渡される
function MyApp({ Component, pageProps }: AppProps) {
    const {} = useUserChanged()
    const [queryClient] = useState(
        () =>
        new QueryClient({
            defaultOptions: {
                queries: {
                    retry: false,
                    refetchOnWindowFocus: false,
                },
            },
        })
    )
    return (
    <QueryClientProvider client={queryClient}>
        <Hydrate state={pageProps.dehydratedState}>
            <Provider store={store}>
                <Component {...pageProps} />
            </Provider>
        </Hydrate>
        <ReactQueryDevtools />
    </QueryClientProvider>
    )}

export default MyApp