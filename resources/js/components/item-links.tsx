import { Form, Link, router, useForm } from '@inertiajs/react';
import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NativeSelect } from '@/components/ui/native-select';
import { Spinner } from '@/components/ui/spinner';
import { usePermissions } from '@/hooks/use-permissions';
import { destroy, store } from '@/routes/item-links';
import type { ItemLink, ItemLinkProps } from '@/types';

function LinkRows({
    heading,
    links,
    canWrite,
}: {
    heading: string;
    links: ItemLink[];
    canWrite: boolean;
}) {
    return (
        <div className="space-y-2">
            <h3 className="font-medium">{heading}</h3>

            {links.length === 0 ? (
                <p className="text-sm text-muted-foreground">None.</p>
            ) : (
                <ul className="space-y-2">
                    {links.map((link) => (
                        <li
                            key={link.id}
                            className="flex items-start justify-between gap-4 rounded-lg border border-sidebar-border/70 p-3"
                        >
                            <div className="space-y-1">
                                <div className="flex flex-wrap items-center gap-2 text-sm">
                                    <span className="text-muted-foreground">
                                        {link.link_type_label}
                                    </span>
                                    {link.other ? (
                                        <>
                                            <span className="text-muted-foreground">
                                                {link.other.module}:
                                            </span>
                                            <Link
                                                href={link.other.url}
                                                className="hover:underline"
                                            >
                                                {link.other.label}
                                            </Link>
                                        </>
                                    ) : (
                                        <span className="text-muted-foreground">
                                            record no longer exists
                                        </span>
                                    )}
                                </div>
                                {link.note && (
                                    <p className="text-sm text-muted-foreground">
                                        {link.note}
                                    </p>
                                )}
                            </div>

                            {canWrite && (
                                <Form
                                    {...destroy.form(link.id)}
                                    options={{ preserveScroll: true }}
                                >
                                    <Button
                                        type="submit"
                                        variant="ghost"
                                        size="icon"
                                        aria-label="Remove link"
                                    >
                                        <Trash2 />
                                    </Button>
                                </Form>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

/**
 * The cross-module link panel shared by every module's show page: what this
 * record points at, what points at it, and a form to add another.
 */
export default function ItemLinks({
    itemLinks,
    itemLinkTargets,
    itemLinkTypes,
    itemLinkSource,
}: ItemLinkProps) {
    const { canWrite } = usePermissions();
    const [adding, setAdding] = useState(false);
    const [module, setModule] = useState('');

    const targets = itemLinkTargets ?? [];
    const activeModule = module || targets[0]?.type || '';
    const records =
        targets.find((group) => group.type === activeModule)?.records ?? [];

    const form = useForm({
        source_type: itemLinkSource.type,
        source_id: itemLinkSource.id,
        target_type: '',
        target_id: 0,
        link_type: itemLinkTypes[0]?.value ?? '',
        note: '',
    });

    const { data, setData, processing, errors, reset } = form;

    // Any visit, including the one after adding a link, replaces the props
    // without the optional targets, so they are fetched whenever the form is
    // open and they are missing.
    const loading = adding && itemLinkTargets === undefined;

    useEffect(() => {
        if (loading) {
            router.reload({ only: ['itemLinkTargets'] });
        }
    }, [loading]);

    const changeModule = (type: string) => {
        setModule(type);
        setData('target_id', 0);
    };

    return (
        <section className="space-y-6">
            <h2 className="text-lg font-medium">Linked records</h2>

            <LinkRows
                heading="This record points at"
                links={itemLinks.outgoing}
                canWrite={canWrite}
            />
            <LinkRows
                heading="Pointed at by"
                links={itemLinks.incoming}
                canWrite={canWrite}
            />

            {canWrite && !adding && (
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => setAdding(true)}
                >
                    <Plus /> Add a link
                </Button>
            )}

            {canWrite && adding && loading && (
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Spinner /> Loading records…
                </p>
            )}

            {canWrite && adding && !loading && targets.length === 0 && (
                <p className="text-sm text-muted-foreground">
                    Nothing else to link to yet.
                </p>
            )}

            {canWrite && adding && !loading && targets.length > 0 && (
                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        // The picker's defaults are resolved at submit time,
                        // since the records arrive after the form is created.
                        form.transform((current) => ({
                            ...current,
                            target_type: activeModule,
                            target_id:
                                current.target_id || (records[0]?.id ?? 0),
                        }));
                        form.submit(store(), {
                            preserveScroll: true,
                            preserveState: true,
                            onSuccess: () => {
                                reset('note', 'target_id');
                                setAdding(false);
                            },
                        });
                    }}
                    className="space-y-4 rounded-xl border border-sidebar-border/70 p-4"
                >
                    <h3 className="font-medium">Add a link</h3>

                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="grid gap-2">
                            <Label htmlFor="item_link_type">Relationship</Label>
                            <NativeSelect
                                id="item_link_type"
                                options={itemLinkTypes}
                                value={data.link_type}
                                onChange={(event) =>
                                    setData('link_type', event.target.value)
                                }
                            />
                            <InputError message={errors.link_type} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="item_link_module">Module</Label>
                            <NativeSelect
                                id="item_link_module"
                                options={targets.map((group) => ({
                                    value: group.type,
                                    label: group.label,
                                }))}
                                value={activeModule}
                                onChange={(event) =>
                                    changeModule(event.target.value)
                                }
                            />
                            <InputError message={errors.target_type} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="item_link_record">Record</Label>
                            <NativeSelect
                                id="item_link_record"
                                options={records.map((record) => ({
                                    value: String(record.id),
                                    label: record.label,
                                }))}
                                value={String(
                                    data.target_id || (records[0]?.id ?? ''),
                                )}
                                onChange={(event) =>
                                    setData(
                                        'target_id',
                                        Number(event.target.value),
                                    )
                                }
                            />
                            <InputError message={errors.target_id} />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="item_link_note">Note</Label>
                        <Input
                            id="item_link_note"
                            value={data.note}
                            onChange={(event) =>
                                setData('note', event.target.value)
                            }
                            placeholder="Why these two are connected"
                        />
                        <InputError message={errors.note} />
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Button type="submit" disabled={processing}>
                            {processing && <Spinner />}
                            Add link
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setAdding(false)}
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            )}
        </section>
    );
}
