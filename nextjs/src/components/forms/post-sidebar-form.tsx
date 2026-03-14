/**
 * PostSidebarForm — форма «Прикинуть стоимость лечения» в sidebar поста
 *
 * Client Component: textarea (problem) + phone + submit.
 * Submits to /api/jetform-submit with _formEndpoint "jet-fb/v1/sidebar-calc".
 */
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Text, Heading } from "@/components/design-system";

const sidebarFormSchema = z.object({
  problem: z.string().optional(),
  phone: z
    .string()
    .min(1, "Введите номер телефона")
    .refine(
      (val) => val.replace(/\D/g, "").length >= 10,
      "Введите корректный номер (минимум 10 цифр)"
    ),
});

type SidebarFormData = z.infer<typeof sidebarFormSchema>;
type SubmitStatus = "idle" | "loading" | "success" | "error";

interface PostSidebarFormProps {
  title?: string;
  description?: string;
  buttonText?: string;
  className?: string;
}

export function PostSidebarForm({
  title = "Прикинуть стоимость лечения",
  description,
  buttonText = "Получить расчёт",
  className = "",
}: PostSidebarFormProps) {
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SidebarFormData>({
    resolver: zodResolver(sidebarFormSchema),
    defaultValues: { problem: "", phone: "" },
  });

  const onSubmit = async (data: SidebarFormData) => {
    setSubmitStatus("loading");
    try {
      const res = await fetch("/api/jetform-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          _formEndpoint: "jet-fb/v1/sidebar-calc",
          problem: data.problem || "",
          phone: data.phone,
        }),
      });

      await res.json().catch(() => ({}));

      if (!res.ok) {
        setSubmitStatus("error");
        return;
      }

      setSubmitStatus("success");
      reset({ problem: "", phone: "" });
    } catch {
      setSubmitStatus("error");
    }
  };

  return (
    <div className={`rounded-[25px] bg-unident-bgElements p-[27px] ${className}`}>
      <Heading level={3} className="text-[28px] font-semibold leading-[1.2] tracking-[-0.02em] text-unident-dark mb-2">
        {title}
      </Heading>

      {description && (
        <Text variant="small" className="text-unident-textGray mb-4">
          {description}
        </Text>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-5 flex flex-col gap-3"
        noValidate
      >
        <div>
          <textarea
            placeholder="Какая у вас проблема?"
            {...register("problem")}
            className="w-full resize-none rounded-[15px] bg-white px-5 py-4 font-gilroy text-[16px] leading-[1.4] text-unident-dark placeholder:text-unident-textGray focus:outline-none focus:ring-2 focus:ring-unident-primary/30 min-h-[198px]"
            disabled={submitStatus === "loading"}
          />
        </div>

        <div>
          <input
            type="tel"
            placeholder="Телефон"
            {...register("phone")}
            className="w-full rounded-[15px] bg-white px-5 py-4 font-gilroy text-[16px] leading-[1.4] text-unident-dark placeholder:text-unident-textGray focus:outline-none focus:ring-2 focus:ring-unident-primary/30 h-[66px]"
            disabled={submitStatus === "loading"}
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? "sidebar-phone-error" : undefined}
          />
          {errors.phone && (
            <span
              id="sidebar-phone-error"
              role="alert"
              className="mt-1 block text-sm text-red-500"
            >
              {errors.phone.message}
            </span>
          )}
        </div>

        <Button
          type="submit"
          unidentVariant="primary"
          className="w-full min-h-[44px] py-4 rounded-[15px] text-[16px] font-semibold"
          disabled={submitStatus === "loading"}
        >
          {submitStatus === "loading" ? "Отправка…" : buttonText}
        </Button>

        {submitStatus === "success" && (
          <span
            role="status"
            aria-live="polite"
            className="text-sm text-green-600"
          >
            Заявка отправлена! Мы свяжемся с вами.
          </span>
        )}
        {submitStatus === "error" && (
          <span
            role="alert"
            aria-live="assertive"
            className="text-sm text-red-500"
          >
            Ошибка отправки. Попробуйте снова.
          </span>
        )}

        <Text variant="xs" className="text-unident-textGray text-center">
          Нажимая кнопку, вы соглашаетесь с{" "}
          <a href="/privacy" className="underline">
            политикой конфиденциальности
          </a>
        </Text>
      </form>
    </div>
  );
}
