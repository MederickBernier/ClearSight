import { ChevronDown, Copy, Download, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useClipboard } from '@/hooks/use-clipboard';

/**
 * Gets a record out of the app: copied for pasting into a pull request or a
 * wiki, or downloaded as a file.
 *
 * One menu rather than three buttons, so a page header keeps room for the
 * record's own actions, especially on a phone.
 *
 * `markdown` is only passed where the page already has the document; otherwise
 * the menu only downloads.
 */
export default function MarkdownExport({
    downloadUrl,
    markdown,
    label = 'Export',
}: {
    /** The markdown route. The PDF is the same URL asking for a format. */
    downloadUrl: string;
    markdown?: string;
    label?: string;
}) {
    const [, copy] = useClipboard();
    const pdfUrl = `${downloadUrl}${downloadUrl.includes('?') ? '&' : '?'}format=pdf`;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline">
                    <Download /> {label} <ChevronDown />
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
                {markdown && (
                    <DropdownMenuItem
                        onSelect={async () => {
                            if (await copy(markdown)) {
                                toast.success('Markdown copied');
                            }
                        }}
                    >
                        <Copy /> Copy markdown
                    </DropdownMenuItem>
                )}

                <DropdownMenuItem asChild>
                    <a href={downloadUrl} download>
                        <Download /> Download .md
                    </a>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                    <a href={pdfUrl} download>
                        <FileText /> Download .pdf
                    </a>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
