/**
 * Диагностика: проверка featuredImage у акций из GraphQL
 * Запуск: npx ts-node --project tsconfig.json scripts/check-promo-images.ts
 * Или: npx tsx scripts/check-promo-images.ts
 */
import { print } from "graphql";
import { gql } from "@apollo/client";

const ENDPOINT =
  process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || "http://localhost:8002/graphql";

const QUERY = gql`
  query CheckPromoImages {
    promotions(first: 5, where: { status: PUBLISH }) {
      nodes {
        id
        title
        slug
        featuredImage {
          node {
            sourceUrl
            altText
          }
        }
      }
    }
  }
`;

async function main() {
  console.log("GraphQL endpoint:", ENDPOINT);
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: print(QUERY) }),
  });
  const json = await res.json();
  if (json.errors) {
    console.error("GraphQL errors:", json.errors);
    process.exit(1);
  }
  const nodes = json.data?.promotions?.nodes ?? [];
  console.log(`\nПроверено акций: ${nodes.length}\n`);
  for (const p of nodes) {
    const url = p.featuredImage?.node?.sourceUrl ?? "(нет)";
    console.log(`- ${p.title} (${p.slug})`);
    console.log(`  featuredImage: ${url}\n`);
  }
}

main().catch(console.error);
