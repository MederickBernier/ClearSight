import { router } from '@inertiajs/react';
import { useEffect } from 'react';

const MESSAGE = 'You have unsaved changes. Leave without saving them?';

/**
 * Asks before leaving a form with unsaved changes, whether by closing the tab
 * or by following a link inside the app. Submitting the form itself is a
 * non-GET visit and is let through.
 */
export function useUnsavedChanges(isDirty: boolean): void {
    useEffect(() => {
        if (!isDirty) {
            return;
        }

        const onBeforeUnload = (event: BeforeUnloadEvent) => {
            event.preventDefault();
        };

        window.addEventListener('beforeunload', onBeforeUnload);

        const removeRouterListener = router.on('before', (event) => {
            const visit = event.detail.visit;

            if (visit.method !== 'get' || visit.only.length > 0) {
                return;
            }

            if (!window.confirm(MESSAGE)) {
                event.preventDefault();
            }
        });

        return () => {
            window.removeEventListener('beforeunload', onBeforeUnload);
            removeRouterListener();
        };
    }, [isDirty]);
}
