// Event queue (PRD §12.2, FR-2). Sending the queue to POST /api/sync is Phase 4.
import { applyEventToProfile, nextSkillMastery } from '../engine/mastery';
import type { StudyKidsDb } from './db';
import type { ProgressEvent } from './types';

/**
 * Event + queue item + recomputed mastery + profile XP/streak in one transaction (ADR D-014 g).
 * A known clientEventId is a no-op.
 */
export function recordAndEnqueue(db: StudyKidsDb, event: ProgressEvent): Promise<void> {
  const tables = [db.progressEvents, db.skillMastery, db.syncQueue, db.profiles];
  return db.transaction('rw', tables, async () => {
    if (await db.progressEvents.get(event.clientEventId)) return;
    await db.progressEvents.add(event);
    const key: [string, string] = [event.profileId, event.skillId];
    const events = await db.progressEvents.where('[profileId+skillId]').equals(key).toArray();
    await db.skillMastery.put(nextSkillMastery(await db.skillMastery.get(key), events));
    const profile = await db.profiles.get(event.profileId);
    if (profile) await db.profiles.put(applyEventToProfile(profile, event));
    await db.syncQueue.add({
      clientEventId: event.clientEventId,
      profileId: event.profileId,
      enqueuedAt: new Date().toISOString(),
      attempts: 0,
    });
  });
}
