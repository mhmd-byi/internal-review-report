export function getCurrentDateISO(): string {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

export function getTargetDateFromAudit(auditDateStr?: string): string {
    let baseDate: Date;
    if (auditDateStr) {
        baseDate = new Date(auditDateStr + "T00:00:00");
    } else {
        baseDate = new Date();
    }

    // +15 days from Audit Date; if Sunday, push to Monday
    baseDate.setDate(baseDate.getDate() + 15);
    if (baseDate.getDay() === 0) { // Sunday
        baseDate.setDate(baseDate.getDate() + 1);
    }

    const y = baseDate.getFullYear();
    const m = String(baseDate.getMonth() + 1).padStart(2, "0");
    const d = String(baseDate.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

export function formatHeaderDate(dateStr: string): string {
    if (!dateStr) return "Date of Audit";

    const parts = dateStr.split("-");
    if (parts.length !== 3) return dateStr;

    const [y, m, d] = parts;
    const dt = new Date(`${y}-${m}-${d}T00:00:00`);
    if (isNaN(dt.getTime())) return dateStr;

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const MMM = months[dt.getMonth()];
    const DD = String(dt.getDate()).padStart(2, "0");
    const YYYY = dt.getFullYear();
    const DDD = days[dt.getDay()];

    return `${MMM} ${DD}, ${YYYY} [${DDD}]`;
}

export function formatMMMDDYY(dateStr: string): string {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    if (parts.length !== 3) return dateStr;

    const [y, m, d] = parts;
    const dt = new Date(`${y}-${m}-${d}T00:00:00`);
    if (isNaN(dt.getTime())) return dateStr;

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months[dt.getMonth()];
    const day = String(dt.getDate()).padStart(2, "0");
    const year = String(dt.getFullYear()).slice(-2);

    return `${month} ${day}, ${year}`;
}

export function formatDDMMYYYY(date: Date | string | undefined | null): string {
    if (!date) return 'N/A';
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'N/A';
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
}

