import { useHttp } from '@inertiajs/react';
import { Eye, Pencil } from 'lucide-react';
import { useRef, useState } from 'react';
import InputError from '@/components/input-error';
import { Markdown } from '@/components/markdown';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { preview } from '@/routes/markdown';

/**
 * A markdown field with a preview of what it will actually look like.
 *
 * The preview is rendered by the server through the same converter the show
 * page and the PDF use, so the three cannot disagree. It is fetched when
 * Preview is pressed rather than as you type: previewing is a deliberate act,
 * so there is no debounce to tune and no request per keystroke.
 */
export default function MarkdownField({
    id,
    name,
    label,
    value,
    onChange,
    error,
    rows = 8,
    required = false,
    hint,
    placeholder,
}: {
    id: string;
    /** Set for a plain <Form> field, which serialises by name rather than state. */
    name?: string;
    label: string;
    value?: string;
    onChange?: (value: string) => void;
    error?: string;
    rows?: number;
    required?: boolean;
    hint?: string;
    placeholder?: string;
}) {
    const http = useHttp<{ text: string }, { html: string | null }>(preview(), {
        text: '',
    });
    // Uncontrolled use (a plain <Form> field) leaves the text in the DOM, so a
    // form reset clears it and the preview reads it from there.
    const textarea = useRef<HTMLTextAreaElement>(null);
    const [showing, setShowing] = useState<'write' | 'preview'>('write');
    const [html, setHtml] = useState<string | null>(null);
    const [previewed, setPreviewed] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const showPreview = async () => {
        const text = value ?? textarea.current?.value ?? '';

        setShowing('preview');

        if (previewed === text) {
            return;
        }

        setLoading(true);

        try {
            http.transform(() => ({ text }));

            const response = await http.submit();

            setHtml(response?.html ?? null);
            setPreviewed(text);
        } catch {
            // Falling back to the source is more useful than an error banner:
            // the text is still there to keep writing.
            setShowing('write');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid gap-2">
            <div className="flex items-center justify-between gap-3">
                <Label htmlFor={id}>
                    {label}{' '}
                    <span className="text-muted-foreground">(markdown)</span>
                </Label>

                <div className="flex items-center gap-1">
                    <Button
                        type="button"
                        size="sm"
                        variant={showing === 'write' ? 'secondary' : 'ghost'}
                        aria-pressed={showing === 'write'}
                        onClick={() => setShowing('write')}
                    >
                        <Pencil /> Write
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        variant={showing === 'preview' ? 'secondary' : 'ghost'}
                        aria-pressed={showing === 'preview'}
                        onClick={showPreview}
                    >
                        <Eye /> Preview
                    </Button>
                </div>
            </div>

            {/* The textarea stays mounted while previewing: unmounted, a plain
                <Form> would submit without it. */}
            <Textarea
                ref={textarea}
                id={id}
                name={name}
                value={value}
                onChange={(event) => onChange?.(event.target.value)}
                // Ctrl/Cmd+Enter saves without reaching for the mouse.
                onKeyDown={(event) => {
                    if (
                        event.key === 'Enter' &&
                        (event.metaKey || event.ctrlKey)
                    ) {
                        event.preventDefault();
                        event.currentTarget.form?.requestSubmit();
                    }
                }}
                rows={rows}
                // A hidden required field would block submit with no visible
                // message; the server still checks it.
                required={required && showing === 'write'}
                placeholder={placeholder}
                hidden={showing === 'preview'}
            />

            {showing === 'preview' && (
                <div
                    className="min-h-24 rounded-md border border-input bg-card px-3 py-2"
                    style={{ minHeight: `${rows * 1.6}rem` }}
                    aria-live="polite"
                >
                    {loading ? (
                        <p className="text-sm text-muted-foreground">
                            Rendering…
                        </p>
                    ) : (
                        <Markdown html={html} />
                    )}
                </div>
            )}

            {hint && <p className="text-sm text-muted-foreground">{hint}</p>}
            <InputError message={error} />
        </div>
    );
}
