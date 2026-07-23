export interface AuditEntry {
    actorId: string;
    restaurantId: string;
    action: string;
    targetId?: string;
    metadata?: Record<string, unknown>;
}

export function audit(
    entry: AuditEntry
) {
    console.info("[AUDIT]", entry);
}