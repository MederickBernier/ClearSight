import { Badge } from '@/components/ui/badge';

type Tone = 'default' | 'secondary' | 'outline' | 'destructive';

/**
 * One tone per kind of state, shared by every module so a glance down a list
 * reads the same everywhere: settled work is solid, work in motion is muted,
 * work not started or set aside is an outline, and a rejection or a fresh
 * finding stands out.
 */
const tones: Record<string, Tone> = {
    // settled
    decided: 'default',
    vetted: 'default',
    completed: 'default',
    remediated: 'default',
    // in motion
    under_rework: 'secondary',
    in_progress: 'secondary',
    needs_prototype: 'secondary',
    routed: 'secondary',
    // not started, or set aside
    draft: 'outline',
    new: 'outline',
    planned: 'outline',
    deferred: 'outline',
    superseded: 'outline',
    abandoned: 'outline',
    non_issue: 'outline',
    // needs a look
    rejected: 'destructive',
    flagged: 'destructive',
};

export default function RecordStatusBadge({
    status,
    label,
}: {
    status?: string | null;
    label: string;
}) {
    return <Badge variant={tones[status ?? ''] ?? 'secondary'}>{label}</Badge>;
}
