import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import { index, show, update, edit } from '@/routes/vetting';
import type { SelectOption } from '@/types';
import type { VettingItem } from './types';
import VettingForm from './vetting-form';

export default function EditVettingItem({
    item,
    statuses,
    sourceTypes,
    projects,
}: {
    item: VettingItem;
    statuses: SelectOption[];
    sourceTypes: SelectOption[];
    projects: SelectOption[];
}) {
    return (
        <>
            <Head title={`Edit ${item.title}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <Heading title="Edit vetting item" description={item.title} />

                <VettingForm
                    item={item}
                    statuses={statuses}
                    sourceTypes={sourceTypes}
                    projects={projects}
                    cancelHref={show(item.id)}
                    submitLabel="Save changes"
                    submit={(form) => form.submit(update(item.id))}
                />
            </div>
        </>
    );
}

// The record's own name, so the trail says where you are.
EditVettingItem.layout = (props: { item: { title: string; id: number } }) => ({
    breadcrumbs: [
        { title: 'Vetting log', href: index() },
        { title: props.item.title, href: show(props.item.id) },
        { title: 'Edit', href: edit(props.item.id) },
    ],
});
