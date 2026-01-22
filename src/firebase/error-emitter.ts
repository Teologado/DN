import { EventEmitter } from 'events';
import { FirestorePermissionError } from './errors';

type AppEvents = {
  'permission-error': (error: FirestorePermissionError) => void;
};

// We need to extend the typings for the event emitter
declare interface AppEventEmitter {
  on<E extends keyof AppEvents>(event: E, listener: AppEvents[E]): this;
  emit<E extends keyof AppEvents>(
    event: E,
    ...args: Parameters<AppEvents[E]>
  ): boolean;
  off<E extends keyof AppEvents>(event: E, listener: AppEvents[E]): this;
}

class AppEventEmitter extends EventEmitter {}

export const errorEmitter = new AppEventEmitter();
