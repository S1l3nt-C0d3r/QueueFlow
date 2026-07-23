import { eventBus } from "../event-bus";

eventBus.on(
  "customer.seated",
  (payload) => {
    console.log(
      "[AUDIT]",
      payload
    );
  }
);