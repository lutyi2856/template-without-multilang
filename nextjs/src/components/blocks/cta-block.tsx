"use client";

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
import type { CtaBlockAttrs } from "./types";

export function CtaBlock({
  title,
  description,
  urlPaid = "/zapis",
  urlOms = "",
  showPaid = true,
  showOms = false,
  showCallback = true,
  marginBottom = 40,
}: CtaBlockAttrs) {
  const hasContent = title || description || showPaid || showOms || showCallback;
  if (!hasContent) return null;

  return (
    <section style={{ marginBottom: `${marginBottom}px` }}>
      <div className="bg-unident-bgElements rounded-[25px] p-8 md:p-10">
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
    </section>
  );
}
