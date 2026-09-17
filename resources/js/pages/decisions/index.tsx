import { Head, Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import Heading from '@/components/heading';
import ListFilters, { EmptyList } from '@/components/list-filters';
import Pagination from '@/components/pagination';
import RecordStatusBadge from '@/components/record-status-badge';
import { Button } from '@/components/ui/button';
import { usePermissions } from '@/hooks/use-permissions';
import { formatDate } from '@/lib/dates';
import { labelFor } from '@/lib/utils';
import { create, index, show } from '@/routes/decisions';
import type { Paginated, SelectOption } from '@/types';
import type { DecisionRecordSummary } from './types';

export default function DecisionsIndex({
    records,
    projectFilters,
    projectFilter,
    statusFilter,
    statuses,
}: {
    records: Paginated<DecisionRecordSummary>;
    projectFilters: SelectOption[];
    projectFilter: string;
    statusFilter: string;
    statuses: SelectOption[];
}) {
    const { canWrite } = usePermissions();

    return (
        <>
            <Head title="Decision records" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <Heading
                        title="Decision records"
                        description="Architecture decisions, their options and their cross-references"
                    />

                    {canWrite && (
                        <Button asChild>
                            <Link href={create()}>
                                <Plus /> New record
                            </Link>
                        </Button>
                    )}
                </div>

                <ListFilters
                    url={index().url}
                    statuses={statuses}
                    status={statusFilter}
                    projects={projectFilters}
                    project={projectFilter}
                />

                {records.data.length === 0 ? (
                    <EmptyList
                        filtered={!!statusFilter || !!projectFilter}
                        url={index().url}
                        nothingYet="No decision records yet."
                    />
                ) : (
                    <div className="overflow-x-auto rounded-xl border border-sidebar-border/70">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50 text-left">
                                <tr>
                                    <th className="px-4 py-2 font-medium">
                                        Document
                                    </th>
                                    <th className="px-4 py-2 font-medium">
                                        Title
                                    </th>
                                    <th className="px-4 py-2 font-medium">
                                        Status
                                    </th>
                                    <th className="px-4 py-2 font-medium">
                                        Updated
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {records.data.map((record) => (
                                    <tr
                                        key={record.id}
                                        className="border-t border-sidebar-border/70"
                                    >
                                        <td className="px-4 py-2 font-mono">
                                            <Link
                                                href={show(record.id)}
                                                className="hover:underline"
                                            >
                                                {record.document_id}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-2">
                                            <Link
                                                href={show(record.id)}
                                                className="hover:underline"
                                            >
                                                {record.title}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-2">
                                            <RecordStatusBadge
                                                status={record.status}
                                                label={labelFor(
                                                    statuses,
                                                    record.status,
                                                )}
                                            />
                                        </td>
                                        <td className="px-4 py-2 text-muted-foreground">
                                            {record.updated_at
                                                ? formatDate(record.updated_at)
                                                : '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <Pagination page={records} />
            </div>
        </>
    );
}

DecisionsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Decision records',
            href: index(),
        },
    ],
};
