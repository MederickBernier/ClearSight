import { useForm } from '@inertiajs/react';
import { Replace } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import MarkdownField from '@/components/markdown-field';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { supersede } from '@/routes/decisions';
import type { DecisionRecord } from './types';

/**
 * Starts the decision that replaces this one.
 *
 * The scope note is what makes a supersession partial: name a part and the
 * earlier record is left standing as the snapshot of what was true at the
 * time; leave it empty and the earlier record is retired.
 */
export default function SupersedeForm({ record }: { record: DecisionRecord }) {
    const [open, setOpen] = useState(false);

    const form = useForm({
        title: record.title,
        scope_note: '',
        impact_summary: '',
    });

    const { data, setData, processing, errors } = form;

    // A dialog rather than a form unfolding in the page header, where it sat
    // squeezed beside the title and broke the layout on a phone.
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <Replace /> Supersede
                </Button>
            </DialogTrigger>

            <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogTitle>Supersede {record.document_id}</DialogTitle>
                <DialogDescription>
                    Starts the decision that replaces this one.
                </DialogDescription>

                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        form.submit(supersede(record.id));
                    }}
                    className="space-y-4"
                >
                    <div className="grid gap-2">
                        <Label htmlFor="supersede_title">
                            Title of the replacement
                        </Label>
                        <Input
                            id="supersede_title"
                            value={data.title}
                            onChange={(event) =>
                                setData('title', event.target.value)
                            }
                            required
                        />
                        <InputError message={errors.title} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="supersede_scope">
                            Which part it replaces
                        </Label>
                        <Input
                            id="supersede_scope"
                            value={data.scope_note}
                            onChange={(event) =>
                                setData('scope_note', event.target.value)
                            }
                            placeholder="e.g. deployment model section only"
                        />
                        <p className="text-sm text-muted-foreground">
                            Leave empty to replace the whole record, which
                            retires it. Name a part and {record.document_id}{' '}
                            stays as it is, a snapshot of what was true then.
                        </p>
                        <InputError message={errors.scope_note} />
                    </div>

                    <MarkdownField
                        id="supersede_impact"
                        label="Why it matters"
                        value={data.impact_summary}
                        onChange={(next) => setData('impact_summary', next)}
                        error={errors.impact_summary}
                        rows={3}
                    />

                    <DialogFooter className="gap-2">
                        <DialogClose asChild>
                            <Button type="button" variant="ghost">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={processing}>
                            {processing && <Spinner />}
                            Start the replacement
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
