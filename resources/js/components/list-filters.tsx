import { Link, router } from '@inertiajs/react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NativeSelect } from '@/components/ui/native-select';
import type { SelectOption } from '@/types';

type Filters = { status: string; project: string };

/**
 * Status and project filters for a module's list, the same way the radar
 * filters its queue: statuses as one-tap buttons, projects as a select since
 * that list grows. Both live on the query string, so a filtered list survives
 * a refresh, can be linked to, and paging keeps it.
 */
export default function ListFilters({
    url,
    statuses,
    status,
    projects,
    project,
}: {
    url: string;
    statuses: SelectOption[];
    status: string;
    projects: SelectOption[];
    project: string;
}) {
    const apply = (changes: Partial<Filters>) => {
        const next = { status, project, ...changes };

        router.get(
            url,
            {
                ...(next.status ? { status: next.status } : {}),
                ...(next.project ? { project: next.project } : {}),
            },
            { preserveScroll: true, preserveState: true, replace: true },
        );
    };

    return (
        <div className="flex flex-wrap items-center gap-2">
            {[{ value: '', label: 'All' }, ...statuses].map((option) => (
                <Button
                    key={option.value || 'all'}
                    size="sm"
                    variant={status === option.value ? 'default' : 'outline'}
                    aria-pressed={status === option.value}
                    onClick={() => apply({ status: option.value })}
                >
                    {option.label}
                </Button>
            ))}

            {/* All projects and No project are always there; a third option
                means there is at least one project to pick. */}
            {projects.length > 2 && (
                <NativeSelect
                    aria-label="Filter by project"
                    className="w-full sm:ml-auto sm:w-64"
                    options={projects}
                    value={project}
                    onChange={(event) => apply({ project: event.target.value })}
                />
            )}
        </div>
    );
}

/**
 * What an empty list says: that the filters matched nothing, with a way out,
 * or that nothing has been recorded yet.
 */
export function EmptyList({
    filtered,
    url,
    nothingYet,
}: {
    filtered: boolean;
    url: string;
    nothingYet: string;
}) {
    return (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-dashed border-sidebar-border/70 p-6 text-sm text-muted-foreground">
            {filtered ? (
                <>
                    Nothing matches these filters.
                    <Button asChild variant="ghost" size="sm">
                        <Link href={url} preserveScroll>
                            <X /> Clear filters
                        </Link>
                    </Button>
                </>
            ) : (
                nothingYet
            )}
        </div>
    );
}
