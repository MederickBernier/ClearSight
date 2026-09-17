import { Link, useForm } from '@inertiajs/react';
import type { InertiaLinkProps } from '@inertiajs/react';
import InputError from '@/components/input-error';
import MarkdownField from '@/components/markdown-field';
import SegmentedControl from '@/components/segmented-control';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NativeSelect } from '@/components/ui/native-select';
import { Spinner } from '@/components/ui/spinner';
import { useUnsavedChanges } from '@/hooks/use-unsaved-changes';
import type { SelectOption } from '@/types';
import type { Technology } from './types';

type TechnologyFormData = {
    name: string;
    category: string;
    ring: string;
    status: string;
    vendor: string;
    homepage_url: string;
    notes: string;
};

export default function TechnologyForm({
    technology,
    categories,
    rings,
    statuses,
    submit,
    submitLabel,
    cancelHref,
}: {
    technology?: Technology;
    categories: SelectOption[];
    rings: SelectOption[];
    statuses: SelectOption[];
    submit: (form: ReturnType<typeof useForm<TechnologyFormData>>) => void;
    submitLabel: string;
    /** Where Cancel goes: the record when editing, the list when creating. */
    cancelHref: NonNullable<InertiaLinkProps['href']>;
}) {
    const form = useForm<TechnologyFormData>({
        name: technology?.name ?? '',
        category: technology?.category ?? categories[0]?.value ?? '',
        ring: technology?.ring ?? 'assess',
        status: technology?.status ?? 'current',
        vendor: technology?.vendor ?? '',
        homepage_url: technology?.homepage_url ?? '',
        notes: technology?.notes ?? '',
    });

    const { data, setData, processing, errors } = form;

    useUnsavedChanges(form.isDirty && !processing);

    return (
        <form
            onSubmit={(event) => {
                event.preventDefault();
                submit(form);
            }}
            className="space-y-6"
        >
            <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                        id="name"
                        value={data.name}
                        onChange={(event) =>
                            setData('name', event.target.value)
                        }
                        required
                    />
                    <InputError message={errors.name} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="category">Category</Label>
                    <NativeSelect
                        id="category"
                        options={categories}
                        value={data.category}
                        onChange={(event) =>
                            setData('category', event.target.value)
                        }
                    />
                    <InputError message={errors.category} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="ring">Ring</Label>
                    <SegmentedControl
                        id="ring"
                        label="Ring"
                        options={rings}
                        value={data.ring}
                        onChange={(next) => setData('ring', next)}
                    />
                    <p className="text-sm text-muted-foreground">
                        What you would start something new with today.
                    </p>
                    <InputError message={errors.ring} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="status">Status</Label>
                    <SegmentedControl
                        id="status"
                        label="Status"
                        options={statuses}
                        value={data.status}
                        onChange={(next) => setData('status', next)}
                    />
                    <p className="text-sm text-muted-foreground">
                        What is actually running, which can differ from the
                        ring.
                    </p>
                    <InputError message={errors.status} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="vendor">Vendor</Label>
                    <Input
                        id="vendor"
                        value={data.vendor}
                        onChange={(event) =>
                            setData('vendor', event.target.value)
                        }
                        placeholder="Who is behind it, if that matters"
                    />
                    <InputError message={errors.vendor} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="homepage_url">Homepage</Label>
                    <Input
                        id="homepage_url"
                        type="url"
                        value={data.homepage_url}
                        onChange={(event) =>
                            setData('homepage_url', event.target.value)
                        }
                        placeholder="https://"
                    />
                    <InputError message={errors.homepage_url} />
                </div>
            </div>

            <MarkdownField
                id="notes"
                label="Notes"
                value={data.notes}
                onChange={(next) => setData('notes', next)}
                error={errors.notes}
                rows={6}
                placeholder="Why it is here, what it costs, what it would take to leave it"
            />

            <div className="flex flex-wrap items-center gap-2">
                <Button type="submit" disabled={processing}>
                    {processing && <Spinner />}
                    {submitLabel}
                </Button>
                <Button type="button" variant="ghost" asChild>
                    <Link href={cancelHref}>Cancel</Link>
                </Button>
            </div>
        </form>
    );
}
