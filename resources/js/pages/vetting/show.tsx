import { Head, Link } from '@inertiajs/react';
import { ExternalLink, Pencil } from 'lucide-react';
import ConfirmDelete from '@/components/confirm-delete';
import Heading from '@/components/heading';
import ItemLinks from '@/components/item-links';
import { MarkdownSection } from '@/components/markdown';
import MarkdownExport from '@/components/markdown-export';
import { Button } from '@/components/ui/button';
import { usePermissions } from '@/hooks/use-permissions';
import { formatDate } from '@/lib/dates';
import { labelFor } from '@/lib/utils';
import { destroy, edit, exportMethod, index, show } from '@/routes/vetting';
import type { ItemLinkProps, SelectOption } from '@/types';
import type { VettingItem } from './types';

type ShowProps = ItemLinkProps & {
    markdown: string;
    item: VettingItem;
    statuses: SelectOption[];
    sourceTypes: SelectOption[];
    html: {
        proposal_description: string | null;
        assessment: string | null;
        rejection_reason: string | null;
    };
};

export default function ShowVettingItem({
    item,
    statuses,
    sourceTypes,
    html,
    markdown,
    ...links
}: ShowProps) {
    const { canWrite } = usePermissions();

    return (
        <>
            <Head title={item.title} />

            <div className="flex h-full flex-1 flex-col gap-8 p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <Heading title={item.title} />

                    <div className="flex flex-wrap items-center gap-2">
                        <MarkdownExport
                            downloadUrl={exportMethod(item.id).url}
                            markdown={markdown}
                        />

                        {canWrite && (
                            <>
                                <Button asChild variant="outline">
                                    <Link href={edit(item.id)}>
                                        <Pencil /> Edit
                                    </Link>
                                </Button>

                                <ConfirmDelete
                                    action={destroy.form(item.id)}
                                    title="Delete this proposal?"
                                    description="Its links to other records are removed with it. This cannot be undone."
                                />
                            </>
                        )}
                    </div>
                </div>

                <dl className="grid gap-3 text-sm sm:grid-cols-4">
                    <div>
                        <dt className="text-muted-foreground">Status</dt>
                        <dd>{labelFor(statuses, item.status)}</dd>
                    </div>
                    <div>
                        <dt className="text-muted-foreground">Source</dt>
                        <dd>
                            {item.source_detail ??
                                labelFor(sourceTypes, item.source_type)}
                        </dd>
                    </div>
                    <div>
                        <dt className="text-muted-foreground">Raised</dt>
                        <dd>{formatDate(item.date_raised)}</dd>
                    </div>
                    <div>
                        <dt className="text-muted-foreground">Resolved</dt>
                        <dd>
                            {item.date_resolved
                                ? formatDate(item.date_resolved)
                                : 'Still open'}
                        </dd>
                    </div>
                </dl>

                {item.external_url && (
                    <a
                        href={item.external_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex w-fit max-w-full items-center gap-2 text-sm break-all underline"
                    >
                        <ExternalLink className="size-4 shrink-0" />{' '}
                        {item.external_url}
                    </a>
                )}

                <MarkdownSection
                    title="Proposal"
                    html={html.proposal_description}
                />
                <MarkdownSection title="Assessment" html={html.assessment} />

                {item.rejection_reason && (
                    <MarkdownSection
                        title="Rejection reason"
                        html={html.rejection_reason}
                    />
                )}

                <ItemLinks {...links} />
            </div>
        </>
    );
}

// The record's own name, so the trail says where you are.
ShowVettingItem.layout = (props: { item: { title: string; id: number } }) => ({
    breadcrumbs: [
        { title: 'Vetting log', href: index() },
        { title: props.item.title, href: show(props.item.id) },
    ],
});
