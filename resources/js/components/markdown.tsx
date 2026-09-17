/**
 * Renders markdown that the server already converted to HTML.
 *
 * Safe to inject: the backend renders it through the RendersMarkdown concern,
 * which strips raw HTML input and disallows unsafe links.
 */
export function Markdown({ html }: { html: string | null }) {
    if (!html) {
        return <p className="text-sm text-muted-foreground">Not recorded.</p>;
    }

    return (
        <div
            className="prose prose-invert prose-sm max-w-none [&_a]:underline [&_code]:font-mono [&_li]:my-1 [&_p]:my-2 [&_ul]:list-disc [&_ul]:pl-5"
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
}

export function MarkdownSection({
    title,
    html,
    level = 2,
}: {
    title: string;
    html: string | null;
    /** 3 when the section sits under another heading. */
    level?: 2 | 3;
}) {
    const Title = level === 3 ? 'h3' : 'h2';

    return (
        <section className="space-y-2">
            <Title
                className={level === 3 ? 'font-medium' : 'text-lg font-medium'}
            >
                {title}
            </Title>
            <Markdown html={html} />
        </section>
    );
}
