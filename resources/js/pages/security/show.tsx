import { Head, Link } from '@inertiajs/react';
import { ExternalLink, Pencil } from 'lucide-react';
import ConfirmDelete from '@/components/confirm-delete';
import Heading from '@/components/heading';
import ItemLinks from '@/components/item-links';
import { MarkdownSection } from '@/components/markdown';
import MarkdownExport from '@/components/markdown-export';
import TechnologyStack from '@/components/technology-stack';
import type { TechnologyStackProps } from '@/components/technology-stack';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { usePermissions } from '@/hooks/use-permissions';
import { formatDate } from '@/lib/dates';
import { labelFor } from '@/lib/utils';
import {
    destroy,
    edit,
    exportMethod,
    index,
    show,
} from '@/routes/security-notes';
import type { ItemLinkProps, SelectOption } from '@/types';
import type { SecurityNote } from './types';

type ShowProps = ItemLinkProps &
    TechnologyStackProps & {
        markdown: string;
        note: SecurityNote;
        sources: SelectOption[];
        severities: SelectOption[];
        routes: SelectOption[];
        statuses: SelectOption[];
        html: {
            finding: string | null;
            non_issue_reason: string | null;
            deferral_reason: string | null;
        };
    };

export default function ShowSecurityNote({
    note,
    sources,
    severities,
    routes,
    statuses,
    html,
    stack,
    technologyOptions,
    stackTarget,
    markdown,
    ...links
}: ShowProps) {
    const { canWrite } = usePermissions();

    return (
        <>
            <Head title={note.title} />

            <div className="flex h-full flex-1 flex-col gap-8 p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex min-w-0 flex-wrap items-center gap-3">
                        <Heading title={note.title} />
                        {!note.is_issue && (
                            <Badge variant="outline">Not an issue</Badge>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <MarkdownExport
                            downloadUrl={exportMethod(note.id).url}
                            markdown={markdown}
                        />

                        {canWrite && (
                            <>
                                <Button asChild variant="outline">
                                    <Link href={edit(note.id)}>
                                        <Pencil /> Edit
                                    </Link>
                                </Button>

                                <ConfirmDelete
                                    action={destroy.form(note.id)}
                                    title="Delete this finding?"
                                    description="Its links to other records are removed with it. This cannot be undone."
                                />
                            </>
                        )}
                    </div>
                </div>

                <dl className="grid gap-3 text-sm sm:grid-cols-3 lg:grid-cols-4">
                    <div>
                        <dt className="text-muted-foreground">Status</dt>
                        <dd>{labelFor(statuses, note.status)}</dd>
                    </div>
                    <div>
                        <dt className="text-muted-foreground">Severity</dt>
                        <dd>{labelFor(severities, note.severity)}</dd>
                    </div>
                    <div>
                        <dt className="text-muted-foreground">Source</dt>
                        <dd>{labelFor(sources, note.source)}</dd>
                    </div>
                    <div>
                        <dt className="text-muted-foreground">Category</dt>
                        <dd>{note.category ?? '—'}</dd>
                    </div>
                    <div>
                        <dt className="text-muted-foreground">Routed to</dt>
                        <dd>{labelFor(routes, note.routed_to)}</dd>
                    </div>
                    <div>
                        <dt className="text-muted-foreground">Flagged</dt>
                        <dd>{formatDate(note.date_flagged)}</dd>
                    </div>
                    <div>
                        <dt className="text-muted-foreground">Resolved</dt>
                        <dd>
                            {note.date_resolved
                                ? formatDate(note.date_resolved)
                                : 'Open'}
                        </dd>
                    </div>
                    {note.deferred_until && (
                        <div>
                            <dt className="text-muted-foreground">
                                Deferred until
                            </dt>
                            <dd>{formatDate(note.deferred_until)}</dd>
                        </div>
                    )}
                </dl>

                {note.external_url && (
                    <a
                        href={note.external_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex w-fit max-w-full items-center gap-2 text-sm break-all underline"
                    >
                        <ExternalLink className="size-4 shrink-0" />{' '}
                        {note.external_url}
                    </a>
                )}

                <MarkdownSection title="Finding" html={html.finding} />

                {!note.is_issue && (
                    <MarkdownSection
                        title="Why it is not an issue"
                        html={html.non_issue_reason}
                    />
                )}

                {note.deferral_reason && (
                    <MarkdownSection
                        title="Why it was deferred"
                        html={html.deferral_reason}
                    />
                )}

                <TechnologyStack
                    stack={stack}
                    technologyOptions={technologyOptions}
                    stackTarget={stackTarget}
                />

                <ItemLinks {...links} />
            </div>
        </>
    );
}

// The record's own name, so the trail says where you are.
ShowSecurityNote.layout = (props: { note: { title: string; id: number } }) => ({
    breadcrumbs: [
        { title: 'Security posture', href: index() },
        { title: props.note.title, href: show(props.note.id) },
    ],
});
