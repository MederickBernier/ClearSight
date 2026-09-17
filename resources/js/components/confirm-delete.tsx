import { Form } from '@inertiajs/react';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import type { RouteFormDefinition } from '@/wayfinder';

/**
 * A delete that asks first. Every destructive button in the app goes through
 * this, so a stray click never removes a record, an account or a link.
 *
 * `icon` renders the small row-level trash button; otherwise it is the full
 * "Delete" button used in page headers.
 */
export default function ConfirmDelete({
    action,
    title,
    description = 'This cannot be undone.',
    label = 'Delete',
    icon = false,
}: {
    action: RouteFormDefinition<'post'>;
    title: string;
    description?: string;
    label?: string;
    icon?: boolean;
}) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {icon ? (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={title}
                    >
                        <Trash2 />
                    </Button>
                ) : (
                    <Button type="button" variant="destructive">
                        <Trash2 /> {label}
                    </Button>
                )}
            </DialogTrigger>

            <DialogContent>
                <DialogTitle>{title}</DialogTitle>
                <DialogDescription>{description}</DialogDescription>

                <Form
                    {...action}
                    options={{ preserveScroll: true }}
                    onSuccess={() => setOpen(false)}
                >
                    {({ processing }) => (
                        <DialogFooter className="gap-2">
                            <DialogClose asChild>
                                <Button type="button" variant="secondary">
                                    Cancel
                                </Button>
                            </DialogClose>

                            <Button
                                type="submit"
                                variant="destructive"
                                disabled={processing}
                            >
                                {processing ? <Spinner /> : <Trash2 />}
                                {label}
                            </Button>
                        </DialogFooter>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}
