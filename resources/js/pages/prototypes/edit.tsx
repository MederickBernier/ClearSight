import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import { index, show, update, edit } from '@/routes/prototypes';
import type { SelectOption } from '@/types';
import PrototypeForm from './prototype-form';
import type { Prototype } from './types';

export default function EditPrototype({
    prototype,
    statuses,
    confidenceLevels,
    projects,
}: {
    prototype: Prototype;
    statuses: SelectOption[];
    confidenceLevels: SelectOption[];
    projects: SelectOption[];
}) {
    return (
        <>
            <Head title={`Edit ${prototype.title}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <Heading title="Edit prototype" description={prototype.title} />

                <PrototypeForm
                    prototype={prototype}
                    statuses={statuses}
                    confidenceLevels={confidenceLevels}
                    projects={projects}
                    cancelHref={show(prototype.id)}
                    submitLabel="Save changes"
                    submit={(form) => form.submit(update(prototype.id))}
                />
            </div>
        </>
    );
}

// The record's own name, so the trail says where you are.
EditPrototype.layout = (props: {
    prototype: { title: string; id: number };
}) => ({
    breadcrumbs: [
        { title: 'Prototypes', href: index() },
        { title: props.prototype.title, href: show(props.prototype.id) },
        { title: 'Edit', href: edit(props.prototype.id) },
    ],
});
