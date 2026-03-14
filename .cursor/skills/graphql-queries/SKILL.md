---
name: graphql-queries
description: GraphQL queries optimization for WPGraphQL and Apollo Client - query structure, type safety, caching, pagination. Use when writing GraphQL queries, working with WPGraphQL, or optimizing data fetching.
---

# GraphQL Queries (WPGraphQL + Apollo Client)

- Use Context7 (resolve-library-id → query-docs) for latest API before relying on examples.

## Query Optimization

### Fetch Only Necessary Data

```graphql
# ✅ Correct - only needed fields
query GetPosts {
  posts {
    nodes {
      id
      title
      excerpt
      date
    }
  }
}

# ❌ Wrong - over-fetching
query GetPosts {
  posts {
    nodes {
      id
      title
      excerpt
      content  # Not needed
      author { ... }  # Not needed
      categories { ... }  # Not needed
    }
  }
}
```

## WPGraphQL-Specific Syntax

### Filtering

```graphql
query GetPublishedPosts {
  posts(where: { status: PUBLISH }) {
    nodes {
      id
      title
    }
  }
}
```

### Sorting

```graphql
query GetPostsByDate {
  posts(where: { orderby: { field: DATE, order: DESC } }) {
    nodes {
      id
      title
      date
    }
  }
}
```

### Pagination

```graphql
query GetPostsPaginated($first: Int!, $after: String) {
  posts(first: $first, after: $after) {
    nodes {
      id
      title
    }
    pageInfo {
      endCursor
      hasNextPage
    }
  }
}
```

## GraphQL Fragments

```graphql
fragment PostFields on Post {
  id
  title
  excerpt
  date
  featuredImage {
    node {
      sourceUrl
      altText
    }
  }
}

query GetPosts {
  posts {
    nodes {
      ...PostFields
    }
  }
}
```

## Type Safety with TypeScript

### Export Interfaces

```typescript
// queries/posts.ts
import { gql } from '@apollo/client';

export interface Post {
  id: string;
  title: string;
  excerpt?: string | null;
  date: string;
}

export interface GetPostsResponse {
  posts: {
    nodes: Post[];
  };
}

export const GET_POSTS = gql`
  query GetPosts {
    posts {
      nodes {
        id
        title
        excerpt
        date
      }
    }
  }
`;
```

### Use with Apollo Client

```typescript
const { data, loading, error } = useQuery<GetPostsResponse>(GET_POSTS);

if (loading) return <div>Loading...</div>;
if (error) return <div>Error: {error.message}</div>;

const posts = data?.posts.nodes || [];
```

## Error Handling

```typescript
const { data, error } = useQuery(GET_POSTS);

if (error) {
  // GraphQL errors
  if (error.graphQLErrors.length > 0) {
    console.error('GraphQL errors:', error.graphQLErrors);
  }
  
  // Network errors
  if (error.networkError) {
    console.error('Network error:', error.networkError);
  }
  
  return <div>Error loading data</div>;
}
```

## Caching (Apollo Client)

```typescript
// apollo-client.ts
const client = new ApolloClient({
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          posts: {
            merge(existing, incoming) {
              return incoming;
            },
          },
        },
      },
    },
  }),
});
```

## Handle Nullable Fields

```graphql
query GetPost($id: ID!) {
  post(id: $id) {
    id
    title
    excerpt  # Can be null
    featuredImage {  # Can be null
      node {
        sourceUrl
      }
    }
  }
}
```

```typescript
const post = data?.post;
const excerpt = post?.excerpt || 'No excerpt available';
const imageUrl = post?.featuredImage?.node?.sourceUrl || '/default.jpg';
```

## Multiple Queries in One Request (Aliases)

```graphql
query GetMultiple {
  recentPosts: posts(first: 5) {
    nodes { id, title }
  }
  
  popularPosts: posts(where: { orderby: { field: COMMENT_COUNT, order: DESC } }, first: 5) {
    nodes { id, title }
  }
}
```

## WordPress Authentication (JWT)

```typescript
const client = new ApolloClient({
  link: createHttpLink({
    uri: process.env.WORDPRESS_GRAPHQL_URL,
    headers: {
      authorization: `Bearer ${jwtToken}`,
    },
  }),
});
```

## Best Practices

✅ Request only needed fields  
✅ Use WPGraphQL filtering (`where: { status: PUBLISH }`)  
✅ Implement pagination with `first`, `after` cursors  
✅ Use GraphQL fragments for reusable parts  
✅ Export TypeScript interfaces for responses  
✅ Handle nullable fields (check for null)  
✅ Use Apollo Client caching  
✅ Log errors for debugging  

❌ Over-fetch data  
❌ Hardcode queries without variables  
❌ Ignore error handling  
❌ Skip type safety  

## Project-Specific: УниДент

### WordPress GraphQL Endpoint

```
https://your-domain.com/graphql
```

### Common Queries Location

```
nextjs/src/lib/wordpress/queries/
  ├── header.ts
  ├── posts.ts
  └── pages.ts
```

### Apollo Client Configuration

```typescript
// nextjs/src/lib/apollo-client.ts
import { ApolloClient, InMemoryCache } from '@apollo/client';

const client = new ApolloClient({
  uri: process.env.NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL,
  cache: new InMemoryCache(),
});

export default client;
```
