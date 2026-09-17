import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import { index, show, update, edit } from '@/routes/decisions';
import type { SelectOption } from '@/types';
import DecisionForm from './decision-form';
import type { DecisionRecord } from './types';

export default function EditDecision({
    record,
    statuses,
    projects,
}: {
    record: DecisionRecord;
    statuses: SelectOption[];
    projects: SelectOption[];
}) {
    return (
        <>
            <Head title={`Edit ${record.document_id}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <Heading
                    title={`Edit ${record.document_id}`}
                    description={record.title}
                />

                <DecisionForm
                    record={record}
                    statuses={statuses}
                    projects={projects}
                    cancelHref={show(record.id)}
                    submitLabel="Save changes"
                    submit={(form) => form.submit(update(record.id))}
                />
            </div>
        </>
    );
}

// The record's own name, so the trail says where you are.
EditDecision.layout = (props: { record: { title: string; id: number } }) => ({
    breadcrumbs: [
        { title: 'Decision records', href: index() },
        { title: props.record.title, href: show(props.record.id) },
        { title: 'Edit', href: edit(props.record.id) },
    ],
});
