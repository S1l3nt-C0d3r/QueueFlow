import { db } from "./connection";

export function transaction(fn: () => void) {
  return db.transaction(fn);
}