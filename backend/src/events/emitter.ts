import { EventEmitter } from 'events';

// ── Event payload types ──────────────────────────────────────────────────────

export interface ApplicationStatusChangedPayload {
  applicationId: string;
  candidateId: string;
  status: string;
  candidateName: string;
  candidateEmail: string;
  offerTitle: string;
  offerSite: string;
}

export interface InterviewScheduledPayload {
  interviewId: string;
  applicationId: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  offerTitle: string;
  offerSite?: string;
  scheduledAt: Date;
  location: string;
  notes?: string;
}

export interface InterviewReminderPayload {
  interviewId: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  offerTitle: string;
  scheduledAt: Date;
  location: string;
}

// ── Typed event map ──────────────────────────────────────────────────────────

interface AppEvents {
  'application.statusChanged': ApplicationStatusChangedPayload;
  'interview.scheduled': InterviewScheduledPayload;
  'interview.reminder': InterviewReminderPayload;
}

// ── TypedEmitter ─────────────────────────────────────────────────────────────
// Wraps Node's EventEmitter with generics so callers get full type-safety
// without requiring a third-party package.

class TypedEmitter<TEvents extends Record<string, any>> extends EventEmitter {
  emit<K extends keyof TEvents & string>(event: K, payload: TEvents[K]): boolean {
    return super.emit(event, payload);
  }

  on<K extends keyof TEvents & string>(
    event: K,
    listener: (payload: TEvents[K]) => void,
  ): this {
    return super.on(event, listener);
  }

  once<K extends keyof TEvents & string>(
    event: K,
    listener: (payload: TEvents[K]) => void,
  ): this {
    return super.once(event, listener);
  }

  off<K extends keyof TEvents & string>(
    event: K,
    listener: (payload: TEvents[K]) => void,
  ): this {
    return super.off(event, listener);
  }
}

// ── Singleton export ─────────────────────────────────────────────────────────

export const appEmitter = new TypedEmitter<AppEvents>();
