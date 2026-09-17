import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import type { SelectOption } from '@/types';

/**
 * A short, fixed set of choices shown all at once as buttons, so picking one
 * is a single tap instead of opening a dropdown. For lists that grow, such as
 * projects, a select is still the better fit.
 *
 * Clicking the current choice again does not clear it: a required value can
 * only be changed, never emptied.
 */
export default function SegmentedControl({
    id,
    label,
    options,
    value,
    onChange,
}: {
    id: string;
    /** Names the group for screen readers; the visible label sits outside. */
    label: string;
    options: SelectOption[];
    value: string;
    onChange: (value: string) => void;
}) {
    return (
        <ToggleGroup
            id={id}
            type="single"
            variant="outline"
            aria-label={label}
            value={value}
            onValueChange={(next) => next && onChange(next)}
            className="flex-wrap justify-start"
        >
            {options.map((option) => (
                <ToggleGroupItem
                    key={option.value}
                    value={option.value}
                    className="flex-1 sm:flex-none sm:px-4"
                >
                    {option.label}
                </ToggleGroupItem>
            ))}
        </ToggleGroup>
    );
}
