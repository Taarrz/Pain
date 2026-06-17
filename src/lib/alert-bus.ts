import "server-only";
import { EventEmitter } from "node:events";

export type AlertBusEvent =
  | { type: "new"; alertId: string }
  | { type: "acknowledged"; alertId: string };

type Bus = EventEmitter & {
  emit(event: "event", payload: AlertBusEvent): boolean;
  on(event: "event", listener: (payload: AlertBusEvent) => void): Bus;
  off(event: "event", listener: (payload: AlertBusEvent) => void): Bus;
};

const globalForBus = globalThis as unknown as { __alertBus?: Bus };

export const alertBus: Bus =
  globalForBus.__alertBus ?? (globalForBus.__alertBus = new EventEmitter() as Bus);

alertBus.setMaxListeners(100);
