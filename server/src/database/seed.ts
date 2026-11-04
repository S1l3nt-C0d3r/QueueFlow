import { randomUUID } from "crypto";
import { hashPassword } from "../shared/password";
import { db } from "./connection";

import {
  PERMISSION_LIST,
  SYSTEM_ROLES,
} from "../shared/constants";

export async function seedDatabase() {
  const now = new Date().toISOString();

  // ==========================
  // Restaurant
  // ==========================

  const restaurantId = "demo-restaurant";

  db.prepare(`
    INSERT OR IGNORE INTO restaurants
    (id, name, createdAt)
    VALUES (?, ?, ?)
  `).run(
    restaurantId,
    "Demo Restaurant",
    now
  );

  // ==========================
  // Roles
  // ==========================

  const insertRole = db.prepare(`
    INSERT OR IGNORE INTO roles
    (id, name, description, createdAt)
    VALUES (?, ?, ?, ?)
  `);

  const roles = [
    {
      id: "role-admin",
      name: SYSTEM_ROLES.ADMIN,
      description: "Restaurant Administrator",
    },
    {
      id: "rolemanager",
      name: SYSTEM_ROLES.MANAGER,
      description: "Restaurant Manager",
    },
    {
      id: "role-waiter",
      name: SYSTEM_ROLES.WAITER,
      description: "Wait Staff",
    },
    {
      id: "role-receptionist",
      name: SYSTEM_ROLES.RECEPTIONIST,
      description: "Front Desk",
    },
  ];

  for (const role of roles) {
    insertRole.run(
      role.id,
      role.name,
      role.description,
      now
    );
  }

  // ==========================
  // Permissions
  // ==========================

  const insertPermission = db.prepare(`
    INSERT OR IGNORE INTO permissions
    (id, name)
    VALUES (?, ?)
  `);

  for (const permission of PERMISSION_LIST) {
    insertPermission.run(permission, permission);
  }

// ==========================
// Default Admin
// ==========================

const existingAdmin = db.prepare(`
    SELECT id
    FROM staff
    WHERE staffNumber = ?
`).get("ADMIN001");

if (!existingAdmin) {
    const passwordHash = await hashPassword("admin123");

    db.prepare(`
        INSERT INTO staff (
            id,
            restaurantId,
            roleId,
            staffNumber,
            displayName,
            email,
            passwordHash,
            active,
            createdAt
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
        randomUUID(),
        restaurantId,
        "admin",
        "ADMIN001",
        "Administrator",
        "admin@queueflow.local",
        passwordHash,
        1,
        now
    );

    // ==========================
// Queue Counter
// ==========================

db.prepare(`
  INSERT OR IGNORE INTO queue_counter
  (
    restaurantId,
    currentToken,
    lastResetDate
  )
  VALUES (?, ?, ?)
`).run(
  restaurantId,
  0,
  now.substring(0, 10)
);
}
}