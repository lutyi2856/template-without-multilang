/**
 * 404 Not Found страница
 * 
 * Отображается когда страница не найдена
 * 
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/not-found
 */

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Страница не найдена | УниДент',
  description: 'Запрашиваемая страница не существует',
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-20">
      <div className="w-full max-w-2xl space-y-6 text-center">
        {/* 404 Illustration */}
        <div className="relative">
          <h1 className="font-gilroy text-9xl font-bold text-unident-bgLight">
            404
          </h1>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <svg
              className="h-32 w-32 text-unident-primary opacity-20"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>

        {/* Message */}
        <div className="space-y-3">
          <h2 className="font-gilroy text-3xl font-semibold text-unident-dark md:text-4xl">
            Страница не найдена
          </h2>
          <p className="font-gilroy text-lg text-unident-textGray md:text-xl">
            К сожалению, запрашиваемая страница не существует или была удалена.
          </p>
        </div>

        {/* Navigation Links */}
        <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-center">
          <Button
            asChild
            className="bg-unident-primary font-gilroy text-white hover:bg-unident-primaryLight"
          >
            <Link href="/">
              Вернуться на главную
            </Link>
          </Button>
          
          <Button
            asChild
            variant="outline"
            className="border-unident-primary font-gilroy text-unident-primary hover:bg-unident-bgLight"
          >
            <Link href="/doctors">
              Наши врачи
            </Link>
          </Button>
          
          <Button
            asChild
            variant="outline"
            className="border-unident-primary font-gilroy text-unident-primary hover:bg-unident-bgLight"
          >
            <Link href="/services">
              Услуги
            </Link>
          </Button>
        </div>

        {/* Popular Links */}
        <div className="pt-8">
          <h3 className="mb-4 font-gilroy text-lg font-semibold text-unident-dark">
            Популярные разделы
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Link
              href="/appointment"
              className="rounded-lg border border-unident-borderGray bg-white p-4 transition-all hover:border-unident-primary hover:shadow-md"
            >
              <h4 className="font-gilroy font-semibold text-unident-dark">
                Запись на прием
              </h4>
              <p className="mt-1 font-gilroy text-sm text-unident-textGray">
                Записаться к врачу онлайн
              </p>
            </Link>
            
            <Link
              href="/prices"
              className="rounded-lg border border-unident-borderGray bg-white p-4 transition-all hover:border-unident-primary hover:shadow-md"
            >
              <h4 className="font-gilroy font-semibold text-unident-dark">
                Цены на услуги
              </h4>
              <p className="mt-1 font-gilroy text-sm text-unident-textGray">
                Прайс-лист клиники
              </p>
            </Link>
            
            <Link
              href="/contacts"
              className="rounded-lg border border-unident-borderGray bg-white p-4 transition-all hover:border-unident-primary hover:shadow-md"
            >
              <h4 className="font-gilroy font-semibold text-unident-dark">
                Контакты
              </h4>
              <p className="mt-1 font-gilroy text-sm text-unident-textGray">
                Адрес и телефоны клиники
              </p>
            </Link>
            
            <Link
              href="/about"
              className="rounded-lg border border-unident-borderGray bg-white p-4 transition-all hover:border-unident-primary hover:shadow-md"
            >
              <h4 className="font-gilroy font-semibold text-unident-dark">
                О клинике
              </h4>
              <p className="mt-1 font-gilroy text-sm text-unident-textGray">
                Информация о нас
              </p>
            </Link>
          </div>
        </div>

        {/* Contact */}
        <div className="pt-6">
          <p className="font-gilroy text-sm text-unident-textGray">
            Если вы считаете, что это ошибка, свяжитесь с нами:
            <br />
            <a
              href="tel:+79999999999"
              className="text-unident-primary hover:underline"
            >
              +7 (999) 999-99-99
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

