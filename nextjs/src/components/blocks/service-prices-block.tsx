import Link from "next/link";
import { Button } from "@/components/design-system";
import { Heading, Text } from "@/components/design-system";
import { typography } from "@/design-tokens/typography";
import { cn } from "@/lib/utils";
import type { ServicePricesBlockAttrs } from "./types";

export function ServicePricesBlock({
  sectionTitle = "Цены",
  headline,
  prices = [],
  focusPrice,
  urlPaid = "/zapis",
  urlOms = "",
  showPaid = true,
  showOms = false,
  marginBottom = 40,
}: ServicePricesBlockAttrs) {
  const hasContent = headline || prices.length > 0 || showPaid || showOms;
  if (!hasContent) return null;

  return (
    <section style={{ marginBottom: `${marginBottom}px` }}>
      <div className="rounded-[25px] bg-unident-bgElements p-6 md:p-8">
        <header className="mb-6 flex flex-col gap-4 max-md:items-stretch md:flex-row md:items-center md:justify-between">
          <Heading
            level={2}
            className={cn(typography.figma["block-content-title"], "text-unident-dark")}
          >
            {sectionTitle}
          </Heading>
          {(showPaid || showOms) && (
            <div className="flex flex-wrap gap-3">
              {showPaid && (
                <Button asChild unidentVariant="primary">
                  <Link href={urlPaid}>Записаться платно</Link>
                </Button>
              )}
              {showOms && urlOms && (
                <Button asChild unidentVariant="primary">
                  <Link href={urlOms}>Записаться по ОМС</Link>
                </Button>
              )}
            </div>
          )}
        </header>

        {(headline || focusPrice) && (
          <div className="mb-6 rounded-[15px] bg-unident-bgLightBlue px-6 py-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              {headline && (
                <Text variant="block-content-body" className="font-semibold text-unident-dark">
                  {headline}
                </Text>
              )}
              {focusPrice?.price && (
                <Text variant="block-content-body" className="text-unident-dark">
                  <span className="text-unident-textGray">от </span>
                  {focusPrice.price}
                  <span className="ml-1">{focusPrice.currency ?? "₽"}</span>
                </Text>
              )}
            </div>
          </div>
        )}

        {prices.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[400px] border-collapse">
              <tbody>
                {prices.map((row, idx) => (
                  <tr
                    key={row.uid ?? idx}
                    className="border-b border-unident-borderGray last:border-b-0"
                  >
                    <td className="py-3 pr-4 text-unident-textGray">
                      {idx + 1}
                    </td>
                    <td className="py-3 pr-4 text-unident-dark">{row.name}</td>
                    <td className="py-3 text-right font-medium text-unident-dark">
                      {row.price}{" "}
                      <span className="text-unident-textGray">
                        {row.currency ?? "₽"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
