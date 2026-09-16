import { useForm } from '@inertiajs/react';
import { Check, Undo2, X } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import MarkdownField from '@/components/markdown-field';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { usePermissions } from '@/hooks/use-permissions';
import { triage } from '@/routes/radar';
import type { SelectOption } from '@/types';
import type { RadarItem } from './types';

const RELEVANT = 'relevant';

const ACTIONS: Record<
    string,
    { label: string; icon: typeof X; variant: 'default' | 'outline' | 'ghost' }
> = {
    relevant: { label: 'Relevant', icon: Check, variant: 'default' },
    discarded: { label: 'Discard', icon: X, variant: 'outline' },
    pending: { label: 'Back to queue', icon: Undo2, variant: 'ghost' },
};

/**
 * Triage for a single item: keep it with a note, dismiss it, or put it back
 * in the queue. Dismissing hides the item rather than deleting it. Everything
 * but keeping is one tap; keeping asks for the note first.
 */
export default function TriageForm({
    item,
    statuses,
}: {
    item: RadarItem;
    statuses: SelectOption[];
}) {
    const { canWrite } = usePermissions();
    const [isNoting, setIsNoting] = useState(false);

    const form = useForm({
        triage_status: item.triage_status,
        relevance_note: item.relevance_note ?? '',
    });

    const { data, setData, processing, errors } = form;

    const currentLabel =
        statuses.find((status) => status.value === item.triage_status)?.label ??
        item.triage_status;

    if (!canWrite) {
        return <p className="text-sm text-muted-foreground">{currentLabel}</p>;
    }

    const submitAs = (status: string) => {
        form.transform((current) => ({ ...current, triage_status: status }));
        form.submit(triage(item.id), {
            preserveScroll: true,
            onSuccess: () => setIsNoting(false),
        });
    };

    return (
        <form
            onSubmit={(event) => {
                event.preventDefault();
                submitAs(RELEVANT);
            }}
            className="w-full space-y-3"
        >
            <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{currentLabel}</Badge>

                {statuses
                    .filter(
                        (status) =>
                            status.value !== item.triage_status ||
                            status.value === RELEVANT,
                    )
                    .map((status) => {
                        const action = ACTIONS[status.value] ?? {
                            label: status.label,
                            icon: Check,
                            variant: 'outline',
                        };
                        const Icon = action.icon;
                        const label =
                            status.value === item.triage_status
                                ? 'Edit note'
                                : action.label;

                        return (
                            <Button
                                key={status.value}
                                type="button"
                                size="sm"
                                variant={action.variant}
                                className="flex-1 sm:flex-none"
                                disabled={processing}
                                aria-label={`${label}: ${item.title}`}
                                onClick={() =>
                                    status.value === RELEVANT
                                        ? setIsNoting(true)
                                        : submitAs(status.value)
                                }
                            >
                                <Icon /> {label}
                            </Button>
                        );
                    })}
            </div>

            {isNoting && (
                <>
                    <MarkdownField
                        id={`relevance-note-${item.id}`}
                        label="Why this is relevant"
                        value={data.relevance_note}
                        onChange={(next) => setData('relevance_note', next)}
                        error={errors.relevance_note}
                        placeholder="Why this one is worth keeping"
                        rows={3}
                        required
                    />

                    <div className="flex gap-2">
                        <Button
                            type="submit"
                            size="sm"
                            className="flex-1 sm:flex-none"
                            disabled={processing}
                        >
                            Keep
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="flex-1 sm:flex-none"
                            onClick={() => setIsNoting(false)}
                        >
                            Cancel
                        </Button>
                    </div>
                </>
            )}

            <InputError message={errors.triage_status} />
        </form>
    );
}
