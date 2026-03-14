/**
 * TypeScript декларации для SVG файлов
 *
 * Позволяет импортировать .svg файлы как React компоненты:
 * import PercentIcon from '@/icons/percent.svg';
 *
 * <PercentIcon className="w-6 h-6 text-primary" />
 */

declare module "*.svg" {
  import { FC, SVGProps } from "react";
  const content: FC<SVGProps<SVGSVGElement>>;
  export default content;
}
