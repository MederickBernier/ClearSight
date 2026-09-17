import { Head, Link } from '@inertiajs/react';
import { GitBranch, Pencil } from 'lucide-react';
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
import { destroy, edit, exportMethod, index, show } from '@/routes/prototypes';
import type { ItemLinkProps, SelectOption } from '@/types';
import type { Prototype } from './types';

type ShowProps = ItemLinkProps &
    TechnologyStackProps & {
        markdown: string;
        prototype: Prototype;
        statuses: SelectOption[];
        confidenceLevels: SelectOption[];
        html: {
            hypothesis: string | null;
            test_approach: string | null;
            result: string | null;
            abandoned_reason: string | null;
            reusability_note: string | null;
        };
    };

export default function ShowPrototype({
    prototype,
    statuses,
    confidenceLevels,
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
            <Head title={prototype.title} />

            <div className="flex h-full flex-1 flex-col gap-8 p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <Heading title={prototype.title} />

                    <div className="flex flex-wrap items-center gap-2">
                        <MarkdownExport
                            downloadUrl={exportMethod(prototype.id).url}
                            markdown={markdown}
                        />

                        {canWrite && (
                            <>
                                <Button asChild variant="outline">
                                    <Link href={edit(prototype.id)}>
                                        <Pencil /> Edit
                                    </Link>
                                </Button>

                                <ConfirmDelete
                                    action={destroy.form(prototype.id)}
                                    title="Delete this prototype?"
                                    description="Its links to other records are removed with it. This cannot be undone."
                                />
                            </>
                        )}
                    </div>
                </div>

                <dl className="grid gap-3 text-sm sm:grid-cols-4">
                    <div>
                        <dt className="text-muted-foreground">Status</dt>
                        <dd>{labelFor(statuses, prototype.status)}</dd>
                    </div>
                    <div>
                        <dt className="text-muted-foreground">Confidence</dt>
                        <dd>
                            {labelFor(
                                confidenceLevels,
                                prototype.confidence_level,
                            )}
                        </dd>
                    </div>
                    <div>
                        <dt className="text-muted-foreground">Started</dt>
                        <dd>{formatDate(prototype.date_started)}</dd>
                    </div>
                    <div>
                        <dt className="text-muted-foreground">Finished</dt>
                        <dd>
                            {prototype.date_completed
                                ? formatDate(prototype.date_completed)
                                : 'Still running'}
                        </dd>
                    </div>
                </dl>

                {prototype.repo_reference && (
                    <p className="flex items-center gap-2 text-sm">
                        <GitBranch className="size-4 shrink-0" />
                        <span className="min-w-0 font-mono break-all">
                            {prototype.repo_reference}
                        </span>
                    </p>
                )}

                <MarkdownSection title="Hypothesis" html={html.hypothesis} />
                <MarkdownSection
                    title="Test approach"
                    html={html.test_approach}
                />

                {prototype.abandoned_reason ? (
                    <MarkdownSection
                        title="Why it was abandoned"
                        html={html.abandoned_reason}
                    />
                ) : (
                    <MarkdownSection title="Result" html={html.result} />
                )}

                {prototype.is_reusable && (
                    <section className="space-y-2">
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg font-medium">Reusable</h2>
                            <Badge>Yes</Badge>
                        </div>
                        <MarkdownSection
                            title="What can be reused"
                            html={html.reusability_note}
                        />
                    </section>
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
ShowPrototype.layout = (props: {
    prototype: { title: string; id: number };
}) => ({
    breadcrumbs: [
        { title: 'Prototypes', href: index() },
        { title: props.prototype.title, href: show(props.prototype.id) },
    ],
});
