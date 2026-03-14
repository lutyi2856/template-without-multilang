import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  NormalizedCacheObject,
  type DocumentNode,
} from "@apollo/client";

/**
 * Apollo Client для работы с WordPress GraphQL API
 *
 * Используется для всех запросов к WPGraphQL
 * Поддерживает SSR и кэширование
 */

let client: ApolloClient<NormalizedCacheObject> | null = null;

/**
 * Создать Apollo Client
 */
function createApolloClient() {
  const uri =
    process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || "http://localhost:8002/graphql";
  const httpLink = new HttpLink({
    uri,
    credentials: "same-origin",
  });

  return new ApolloClient({
    ssrMode: typeof window === "undefined",
    link: httpLink,
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            // Кэширование для постов с пагинацией
            posts: {
              keyArgs: ["where"],
              merge(existing, incoming, { args }) {
                if (!incoming) return existing;
                if (!existing) return incoming;

                // Объединяем edges для пагинации
                const edges = existing.edges ? [...existing.edges] : [];
                const newEdges = incoming.edges || [];

                return {
                  ...incoming,
                  edges: [...edges, ...newEdges],
                };
              },
            },
            // Аналогично для врачей
            doctors: {
              keyArgs: ["where"],
              merge(existing, incoming) {
                if (!incoming) return existing;
                if (!existing) return incoming;

                const edges = existing.edges ? [...existing.edges] : [];
                const newEdges = incoming.edges || [];

                return {
                  ...incoming,
                  edges: [...edges, ...newEdges],
                };
              },
            },
          },
        },
      },
    }),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: "cache-and-network",
        errorPolicy: "all",
      },
      query: {
        fetchPolicy: "cache-first",
        errorPolicy: "all",
      },
    },
  });
}

/**
 * Получить Apollo Client (singleton для SSR)
 */
export function getApolloClient() {
  // Создаем новый клиент для SSR (server-side)
  if (typeof window === "undefined") {
    return createApolloClient();
  }

  // Переиспользуем клиент на клиенте (client-side)
  if (!client) {
    client = createApolloClient();
  }

  return client;
}

/**
 * Обертка для запросов с обработкой ошибок
 */
export async function fetchGraphQL<T = unknown>(
  query: DocumentNode,
  variables?: Record<string, unknown>
): Promise<T> {
  const client = getApolloClient();

  try {
    const { data, errors } = await client.query({
      query,
      variables,
    });

    if (errors) {
      console.error("GraphQL Errors:", errors);
      throw new Error(errors.map((e) => e.message).join(", "));
    }

    return data as T;
  } catch (error) {
    console.error("GraphQL Request Failed:", error);
    throw error;
  }
}
