export default function Heading({
    title,
    description,
    variant = 'default',
}: {
    title: string;
    description?: string;
    variant?: 'default' | 'small';
}) {
    const Title = variant === 'small' ? 'h2' : 'h1';

    return (
        <header className={variant === 'small' ? '' : 'mb-8 space-y-0.5'}>
            {/* The page title is the page's one h1; small headings title
                sections within it. */}
            <Title
                className={
                    variant === 'small'
                        ? 'mb-0.5 text-base font-medium break-words'
                        : 'text-xl font-semibold tracking-tight break-words'
                }
            >
                {title}
            </Title>
            {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
            )}
        </header>
    );
}
