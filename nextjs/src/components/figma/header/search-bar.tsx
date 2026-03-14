/**
 * SearchBar - поиск с иконкой
 */

'use client';

import { Input } from '@/components/ui/input';
import { Icon } from '@iconify/react';
import type { SearchBarProps } from './types';

export function SearchBar({
  className,
  placeholder = 'Имплантация зубов...',
  onSearch,
  fullWidth,
}: SearchBarProps) {
  return (
    <div className={`relative ${fullWidth ? 'w-full' : 'w-full'} ${className}`}>
      <Icon icon="mynaui:search" className="absolute left-3 top-1/2 h-[25px] w-[25px] -translate-y-1/2 text-unident-textGray" />
      <Input
        type="search"
        placeholder={placeholder}
        className={`h-[44px] rounded-[27px] border-0 bg-unident-bgElements pl-[45px] pr-4 font-gilroy text-[clamp(0.875rem,0.82rem+0.19vw,1rem)] font-medium tracking-[-0.16px] text-unident-dark placeholder:text-unident-textGray focus-visible:ring-2 focus-visible:ring-unident-primary focus-visible:ring-offset-0 ${fullWidth ? 'w-full' : 'min-w-[200px] max-w-[clamp(200px,25vw,301px)] w-full min-w-0'}`}
        onChange={(e) => onSearch?.(e.target.value)}
      />
    </div>
  );
}
