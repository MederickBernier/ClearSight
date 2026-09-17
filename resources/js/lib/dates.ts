/**
 * Dates reach the browser in two shapes: calendar dates as `YYYY-MM-DD`, which
 * name a day and have no timezone, and moments as ISO 8601 with an offset.
 * A calendar date parsed by `new Date()` is taken as UTC midnight and shows up
 * a day early west of Greenwich, so it is built from its parts in local time.
 */
export function parseDate(value: string): Date {
    const calendarDate = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

    if (calendarDate) {
        const [, year, month, day] = calendarDate;

        return new Date(Number(year), Number(month) - 1, Number(day));
    }

    return new Date(value);
}

export function formatDate(
    value: string,
    options?: Intl.DateTimeFormatOptions,
): string {
    return parseDate(value).toLocaleDateString(undefined, options);
}

export function formatDateTime(value: string): string {
    return parseDate(value).toLocaleString();
}

/**
 * Today as `YYYY-MM-DD` in the viewer's timezone, for date inputs.
 * `toISOString()` would give the UTC day, which is tomorrow every evening.
 */
export function localToday(): string {
    const now = new Date();
    const pad = (part: number) => String(part).padStart(2, '0');

    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}
