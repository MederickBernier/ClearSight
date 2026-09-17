import { Head, Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import Heading from '@/components/heading';
import ListFilters, { EmptyList } from '@/components/list-filters';
import Pagination from '@/components/pagination';
import RecordStatusBadge from '@/components/record-status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { usePermissions } from '@/hooks/use-permissions';
import { formatDate } from '@/lib/dates';
import { labelFor } from '@/lib/utils';
import { create, index, show } from '@/routes/security-notes';
import type { Paginated, SelectOption } from '@/types';
import type { SecurityNoteSummary } from './types';

const severityVariants: Record<
    string,
    'default' | 'secondary' | 'destructive' | 'outline'
> = {
    low: 'outline',
    medium: 'secondary',
    high: 'default',
    critical: 'destructive',
};

export default function SecurityIndex({
    notes,
    projectFilters,
    projectFilter,
    statusFilter,
    sources,
    severities,
    routes,
    statuses,
}: {
    notes: Paginated<SecurityNoteSummary>;
    projectFilters: SelectOption[];
    projectFilter: string;
    statusFilter: string;
    sources: SelectOption[];
    severities: SelectOption[];
    routes: SelectOption[];
    statuses: SelectOption[];
}) {
    const { canWrite } = usePermissions();

    return (
        <>
            <Head title="Security posture" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <Heading
                        title="Security posture"
                        description="Findings, the triage call on each, and where they were routed"
                    />

                    {canWrite && (
                        <Button asChild>
                            <Link href={create()}>
                                <Plus /> New note
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

                {notes.data.length === 0 ? (
                    <EmptyList
                        filtered={!!statusFilter || !!projectFilter}
                        url={index().url}
                        nothingYet="No security notes yet."
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
                                        Severity
                                    </th>
                                    <th className="px-4 py-2 font-medium">
                                        Source
                                    </th>
                                    <th className="px-4 py-2 font-medium">
                                        Category
                                    </th>
                                    <th className="px-4 py-2 font-medium">
                                        Routed to
                                    </th>
                                    <th className="px-4 py-2 font-medium">
                                        Status
                                    </th>
                                    <th className="px-4 py-2 font-medium">
                                        Flagged
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {notes.data.map((note) => (
                                    <tr
                                        key={note.id}
                                        className="border-t border-sidebar-border/70"
                                    >
                                        <td className="px-4 py-2">
                                            <Link
                                                href={show(note.id)}
                                                className="hover:underline"
                                            >
                                                {note.title}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-2">
                                            <Badge
                                                variant={
                                                    severityVariants[
                                                        note.severity
                                                    ] ?? 'secondary'
                                                }
                                            >
                                                {labelFor(
                                                    severities,
                                                    note.severity,
                                                )}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-2">
                                            {labelFor(sources, note.source)}
                                        </td>
                                        <td className="px-4 py-2">
                                            {note.category ?? '—'}
                                        </td>
                                        <td className="px-4 py-2">
                                            {labelFor(routes, note.routed_to)}
                                        </td>
                                        <td className="px-4 py-2">
                                            <RecordStatusBadge
                                                status={note.status}
                                                label={labelFor(
                                                    statuses,
                                                    note.status,
                                                )}
                                            />
                                        </td>
                                        <td className="px-4 py-2 text-muted-foreground">
                                            {formatDate(note.date_flagged)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <Pagination page={notes} />
            </div>
        </>
    );
}

SecurityIndex.layout = {
    breadcrumbs: [{ title: 'Security posture', href: index() }],
};
