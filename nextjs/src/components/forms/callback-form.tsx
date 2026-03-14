/**
 * CallbackForm — форма обратного звонка (телефон + Записаться)
 *
 * Client Component для отправки данных в JetFormBuilder через /api/jetform-submit.
 * Поддерживает два варианта стилей: cta (белый фон для CTA-секции) и default (стандартные стили).
 *
 * @example
 * <CallbackForm variant="cta" />
 * <CallbackForm variant="default" privacyText="Текст политики" />
 */
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Text } from "@/components/design-system";

const callbackFormSchema = z.object({
  phone: z
    .string()
    .min(1, "Введите номер телефона")
    .refine(
      (val) => val.replace(/\D/g, "").length >= 10,
      "Введите корректный номер (минимум 10 цифр)"
    ),
});

type CallbackFormData = z.infer<typeof callbackFormSchema>;

type SubmitStatus = "idle" | "loading" | "success" | "error";

interface CallbackFormProps {
  /** cta — белые placeholder/фон для CTA-секции; default — стандартные стили */
  variant?: "cta" | "default";
  /** Текст политики конфиденциальности (отображается под формой) */
  privacyText?: string;
  /** URL страницы политики конфиденциальности (фраза «политикой конфиденциальности» станет ссылкой) */
  privacyLink?: string | null;
  /** CSS класс */
  className?: string;
}

export function CallbackForm({
  variant = "default",
  privacyText,
  privacyLink,
  className = "",
}: CallbackFormProps) {
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CallbackFormData>({
    resolver: zodResolver(callbackFormSchema),
    defaultValues: { phone: "" },
  });

  const onSubmit = async (data: CallbackFormData) => {
    setSubmitStatus("loading");
    try {
      const res = await fetch("/api/jetform-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: data.phone }),
      });

      await res.json().catch(() => ({}));

      if (!res.ok) {
        setSubmitStatus("error");
        return;
      }

      setSubmitStatus("success");
      reset({ phone: "" });
    } catch {
      setSubmitStatus("error");
    }
  };

  const inputClasses =
    variant === "cta"
      ? "w-full max-w-[400px] rounded-[15px] bg-white px-4 md:px-6 py-3 font-gilroy text-base font-medium text-unident-textGray placeholder:text-unident-textGray focus:outline-none focus:ring-2 focus:ring-white min-h-[44px]"
      : "w-full px-4 py-3 rounded-[15px] border border-unident-borderGray text-unident-dark focus:outline-none focus:border-unident-primary min-h-[44px]";

  const buttonClasses =
    variant === "cta"
      ? "inline-flex items-center justify-center rounded-[15px] border-2 border-white bg-transparent w-full max-w-[400px] min-h-[44px] py-4 font-gilroy text-base font-semibold text-white transition-colors hover:bg-white/10 disabled:opacity-70"
      : "";

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={`flex flex-col gap-4 ${className}`}
      noValidate
    >
      <div className="flex flex-col gap-2">
        <input
          type="tel"
          placeholder="Телефон"
          {...register("phone")}
          className={inputClasses}
          disabled={submitStatus === "loading"}
          aria-invalid={!!errors.phone}
          aria-describedby={errors.phone ? "phone-error" : undefined}
        />
        {errors.phone && (
          <span
            id="phone-error"
            role="alert"
            className={
              variant === "cta"
                ? "text-sm text-red-300"
                : "text-sm text-red-500"
            }
          >
            {errors.phone.message}
          </span>
        )}
      </div>

      {variant === "cta" ? (
        <button
          type="submit"
          disabled={submitStatus === "loading"}
          className={buttonClasses}
        >
          {submitStatus === "loading" ? "Отправка…" : "Записаться"}
        </button>
      ) : (
        <Button
          type="submit"
          unidentVariant="primary"
          className="w-full"
          disabled={submitStatus === "loading"}
        >
          {submitStatus === "loading" ? "Отправка…" : "Записаться"}
        </Button>
      )}

      {submitStatus === "success" && (
        <span
          role="status"
          aria-live="polite"
          className={
            variant === "cta"
              ? "text-sm text-green-300"
              : "text-sm text-green-600"
          }
        >
          Заявка отправлена! Мы свяжемся с вами в ближайшее время.
        </span>
      )}
      {submitStatus === "error" && (
        <span
          role="alert"
          aria-live="assertive"
          className={
            variant === "cta"
              ? "text-sm text-red-300"
              : "text-sm text-red-500"
          }
        >
          Ошибка отправки. Попробуйте снова.
        </span>
      )}

      {privacyText && variant === "cta" && (
        <Text variant="xs" className="text-white/80">
          {privacyLink?.trim() ? (
            <>
              {(() => {
                const phrase = "политикой конфиденциальности";
                const idx = privacyText.indexOf(phrase);
                if (idx !== -1) {
                  return (
                    <>
                      {privacyText.slice(0, idx)}
                      <a
                        href={privacyLink}
                        className="underline hover:no-underline transition-all"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {phrase}
                      </a>
                      {privacyText.slice(idx + phrase.length)}
                    </>
                  );
                }
                return (
                  <a
                    href={privacyLink}
                    className="underline hover:no-underline transition-all"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {privacyText}
                  </a>
                );
              })()}
            </>
          ) : (
            privacyText
          )}
        </Text>
      )}
    </form>
  );
}
