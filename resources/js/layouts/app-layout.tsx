import { router } from '@inertiajs/react';
import { useEffect } from 'react';
import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { search } from '@/routes';
import type { BreadcrumbItem } from '@/types';

/**
 * "/" opens search from anywhere, the way most tools do, unless you are
 * already typing into something.
 */
function useSearchShortcut() {
    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            const target = event.target as HTMLElement | null;
            const typing =
                target?.isContentEditable ||
                ['INPUT', 'TEXTAREA', 'SELECT'].includes(target?.tagName ?? '');

            if (
                event.key !== '/' ||
                typing ||
                event.metaKey ||
                event.ctrlKey ||
                event.altKey
            ) {
                return;
            }

            event.preventDefault();
            router.visit(search());
        };

        window.addEventListener('keydown', onKeyDown);

        return () => window.removeEventListener('keydown', onKeyDown);
    }, []);
}

export default function AppLayout({
    breadcrumbs = [],
    children,
}: {
    breadcrumbs?: BreadcrumbItem[];
    children: React.ReactNode;
}) {
    useSearchShortcut();

    return (
        <AppLayoutTemplate breadcrumbs={breadcrumbs}>
            {children}
        </AppLayoutTemplate>
    );
}
