// Event queue (PRD §12.2, FR-2). Sending the queue to POST /api/sync is Phase 4.
import type { StudyKidsDb } from './db';
import type { ProgressEvent, SkillMastery } from './types';

/** Event + mastery + queue item in one transaction; a known clientEventId is a no-op. */
export function recordAndEnqueue(
  db: StudyKidsDb,
  event: ProgressEvent,
  mastery: SkillMastery,
): Promise<void> {
  return db.transaction('rw', db.progressEvents, db.skillMastery, db.syncQueue, async () => {
    if (await db.progressEvents.get(event.clientEventId)) return;
    await db.progressEvents.add(event);
    await db.skillMastery.put(mastery);
    await db.syncQueue.add({
      clientEventId: event.clientEventId,
      profileId: event.profileId,
      enqueuedAt: new Date().toISOString(),
      attempts: 0,
    });
  });
}
