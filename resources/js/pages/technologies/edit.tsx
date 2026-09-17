import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import { index, show, update, edit } from '@/routes/technologies';
import type { SelectOption } from '@/types';
import TechnologyForm from './technology-form';
import type { Technology } from './types';

export default function EditTechnology({
    technology,
    ...options
}: {
    technology: Technology;
    categories: SelectOption[];
    rings: SelectOption[];
    statuses: SelectOption[];
}) {
    return (
        <>
            <Head title={`Edit ${technology.name}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <Heading
                    title="Edit technology"
                    description={technology.name}
                />

                <TechnologyForm
                    technology={technology}
                    {...options}
                    cancelHref={show(technology.id)}
                    submitLabel="Save changes"
                    submit={(form) => form.submit(update(technology.id))}
                />
            </div>
        </>
    );
}

// The record's own name, so the trail says where you are.
EditTechnology.layout = (props: {
    technology: { name: string; id: number };
}) => ({
    breadcrumbs: [
        { title: 'Technologies', href: index() },
        { title: props.technology.name, href: show(props.technology.id) },
        { title: 'Edit', href: edit(props.technology.id) },
    ],
});
