"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/design-system";
import { CallbackForm } from "@/components/forms/callback-form";
import { Heading, Text } from "@/components/design-system";
import { typography } from "@/design-tokens/typography";
import { cn } from "@/lib/utils";
import type { StaLogoBlockAttrs } from "./types";

export function StaLogoBlock({
  title,
  description,
  logotype,
  urlPaid = "/zapis",
  urlOms = "",
  showPaid = true,
  showOms = false,
  showCallback = true,
  marginBottom = 40,
}: StaLogoBlockAttrs) {
  const hasContent = title || description || logotype?.url || showPaid || showOms || showCallback;
  if (!hasContent) return null;

  return (
    <section style={{ marginBottom: `${marginBottom}px` }}>
      <div className="bg-unident-bgElements rounded-[25px] p-8 md:p-10 flex flex-wrap items-start justify-between gap-6">
        <div className="flex-1 min-w-0">
          {title && (
            <Heading level={2} className={cn(typography.figma["block-content-title"], "mb-4")}>
              {title}
            </Heading>
          )}
          {description && (
            <Text variant="block-content-body" className="text-unident-dark mb-6">
              {description}
            </Text>
          )}
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
            {showCallback && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button unidentVariant="outline">
                    Заказать обратный звонок
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogTitle>Заказать обратный звонок</DialogTitle>
                  <CallbackForm variant="default" />
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
        {logotype?.url && (
          <div className="shrink-0">
            <Image
              src={logotype.url}
              alt={logotype.alt || ""}
              width={logotype.width || 200}
              height={logotype.height || 100}
              className="max-w-[200px] h-auto"
            />
          </div>
        )}
      </div>
    </section>
  );
}
