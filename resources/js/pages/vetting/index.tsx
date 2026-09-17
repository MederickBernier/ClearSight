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
import { create, index, show } from '@/routes/vetting';
import type { Paginated, SelectOption } from '@/types';
import type { VettingItemSummary } from './types';

export default function VettingIndex({
    items,
    projectFilters,
    projectFilter,
    statusFilter,
    statuses,
    sourceTypes,
}: {
    items: Paginated<VettingItemSummary>;
    projectFilters: SelectOption[];
    projectFilter: string;
    statusFilter: string;
    statuses: SelectOption[];
    sourceTypes: SelectOption[];
}) {
    const { canWrite } = usePermissions();

    return (
        <>
            <Head title="Vetting log" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <Heading
                        title="Vetting log"
                        description="Proposals from intake through to a verdict"
                    />

                    {canWrite && (
                        <Button asChild>
                            <Link href={create()}>
                                <Plus /> New item
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

                {items.data.length === 0 ? (
                    <EmptyList
                        filtered={!!statusFilter || !!projectFilter}
                        url={index().url}
                        nothingYet="Nothing in the log yet."
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
                                        Source
                                    </th>
                                    <th className="px-4 py-2 font-medium">
                                        Status
                                    </th>
                                    <th className="px-4 py-2 font-medium">
                                        Raised
                                    </th>
                                    <th className="px-4 py-2 font-medium">
                                        Resolved
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.data.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="border-t border-sidebar-border/70"
                                    >
                                        <td className="px-4 py-2">
                                            <Link
                                                href={show(item.id)}
                                                className="hover:underline"
                                            >
                                                {item.title}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-2">
                                            {labelFor(
                                                sourceTypes,
                                                item.source_type,
                                            )}
                                        </td>
                                        <td className="px-4 py-2">
                                            <RecordStatusBadge
                                                status={item.status}
                                                label={labelFor(
                                                    statuses,
                                                    item.status,
                                                )}
                                            />
                                        </td>
                                        <td className="px-4 py-2 text-muted-foreground">
                                            {formatDate(item.date_raised)}
                                        </td>
                                        <td className="px-4 py-2 text-muted-foreground">
                                            {item.date_resolved
                                                ? formatDate(item.date_resolved)
                                                : '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <Pagination page={items} />
            </div>
        </>
    );
}

VettingIndex.layout = {
    breadcrumbs: [{ title: 'Vetting log', href: index() }],
};
