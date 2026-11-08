/** Exam option from GET /exam-config/options (narrowed by program/department/class). */
export type ExamOption = {
    id: string;
    name: string;
    className: string;
    sectionName: string | null;
    examDate: string;
};

/** "1 Oct 2026" — appended only when name + class + section still collide. */
export const formatExamOptionDate = (isoDate: string): string => {
    const d = new Date(isoDate);
    if (Number.isNaN(d.getTime())) return isoDate;
    return d.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
};

/**
 * Display labels that tell same-named exams apart:
 * "Name - Class (Section)", without section "Name - Class",
 * plus the exam date when labels would still collide.
 */
export const buildExamOptionLabels = (
    options: ExamOption[],
): Map<string, string> => {
    const base = new Map<string, string>();
    for (const o of options) {
        const name = o.name || "Untitled exam";
        const cls = o.className || "—";
        base.set(
            o.id,
            o.sectionName ? `${name} - ${cls} (${o.sectionName})` : `${name} - ${cls}`,
        );
    }
    const counts = new Map<string, number>();
    for (const label of base.values()) {
        counts.set(label, (counts.get(label) ?? 0) + 1);
    }
    const labels = new Map<string, string>();
    for (const o of options) {
        const label = base.get(o.id) ?? o.name;
        labels.set(
            o.id,
            (counts.get(label) ?? 0) > 1
                ? `${label} · ${formatExamOptionDate(o.examDate)}`
                : label,
        );
    }
    return labels;
};
