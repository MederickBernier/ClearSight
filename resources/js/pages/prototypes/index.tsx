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
import { create, index, show } from '@/routes/prototypes';
import type { Paginated, SelectOption } from '@/types';
import type { PrototypeSummary } from './types';

export default function PrototypesIndex({
    prototypes,
    projectFilters,
    projectFilter,
    statusFilter,
    statuses,
    confidenceLevels,
}: {
    prototypes: Paginated<PrototypeSummary>;
    projectFilters: SelectOption[];
    projectFilter: string;
    statusFilter: string;
    statuses: SelectOption[];
    confidenceLevels: SelectOption[];
}) {
    const { canWrite } = usePermissions();

    return (
        <>
            <Head title="Prototypes" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <Heading
                        title="Prototypes"
                        description="Spikes, what they were meant to prove, and how they landed"
                    />

                    {canWrite && (
                        <Button asChild>
                            <Link href={create()}>
                                <Plus /> New prototype
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

                {prototypes.data.length === 0 ? (
                    <EmptyList
                        filtered={!!statusFilter || !!projectFilter}
                        url={index().url}
                        nothingYet="No prototypes yet."
                    />
                ) : (
                    <div className="overflow-x-auto rounded-xl border border-sidebar-border/70">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50 text-left">
                                <tr>
                                    <th className="px-4 py-2 font-medium">
                                        Title
                                    </th>
                                    <th className="px-4 py-2 font-medium">
                                        Status
                                    </th>
                                    <th className="px-4 py-2 font-medium">
                                        Confidence
                                    </th>
                                    <th className="px-4 py-2 font-medium">
                                        Reusable
                                    </th>
                                    <th className="px-4 py-2 font-medium">
                                        Started
                                    </th>
                                    <th className="px-4 py-2 font-medium">
                                        Finished
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {prototypes.data.map((prototype) => (
                                    <tr
                                        key={prototype.id}
                                        className="border-t border-sidebar-border/70"
                                    >
                                        <td className="px-4 py-2">
                                            <Link
                                                href={show(prototype.id)}
                                                className="hover:underline"
                                            >
                                                {prototype.title}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-2">
                                            <RecordStatusBadge
                                                status={prototype.status}
                                                label={labelFor(
                                                    statuses,
                                                    prototype.status,
                                                )}
                                            />
                                        </td>
                                        <td className="px-4 py-2">
                                            {labelFor(
                                                confidenceLevels,
                                                prototype.confidence_level,
                                            )}
                                        </td>
                                        <td className="px-4 py-2">
                                            {prototype.is_reusable === null
                                                ? '—'
                                                : prototype.is_reusable
                                                  ? 'Yes'
                                                  : 'No'}
                                        </td>
                                        <td className="px-4 py-2 text-muted-foreground">
                                            {formatDate(prototype.date_started)}
                                        </td>
                                        <td className="px-4 py-2 text-muted-foreground">
                                            {prototype.date_completed
                                                ? formatDate(
                                                      prototype.date_completed,
                                                  )
                                                : '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <Pagination page={prototypes} />
            </div>
        </>
    );
}

PrototypesIndex.layout = {
    breadcrumbs: [{ title: 'Prototypes', href: index() }],
};
