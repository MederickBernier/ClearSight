import type { InertiaLinkProps } from '@inertiajs/react';
import { clsx } from 'clsx';
import type { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function toUrl(url: NonNullable<InertiaLinkProps['href']>): string {
    return typeof url === 'string' ? url : url.url;
}

/**
 * The label for an enum value, from the options the server sends with a page.
 * Falls back to the raw value so an unknown one still shows something.
 */
export function labelFor(
    options: { value: string; label: string }[],
    value: string | null | undefined,
): string {
    if (!value) {
        return '—';
    }

    return options.find((option) => option.value === value)?.label ?? value;
}
