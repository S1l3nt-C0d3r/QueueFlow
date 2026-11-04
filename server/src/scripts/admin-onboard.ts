import crypto from "node:crypto";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

import { db } from "../database/connection";
import { hashPassword } from "../shared/password";

const rl = readline.createInterface({
  input,
  output,
});

async function ask(question: string): Promise<string> {
  const answer = await rl.question(question);

  return answer.trim();
}

async function main() {
  console.log("");
  console.log("========================================");
  console.log("       QueueFlow Admin Onboarding");
  console.log("========================================");
  console.log("");

  /*
   * ============================================================
   * COLLECT RESTAURANT DETAILS
   * ============================================================
   */

  const restaurantName = await ask("Restaurant name: ");

  if (!restaurantName) {
    throw new Error("Restaurant name is required.");
  }

  /*
   * ============================================================
   * COLLECT ADMIN DETAILS
   * ============================================================
   */

  const staffNumber = await ask("Admin staff number: ");

  if (!staffNumber) {
    throw new Error("Admin staff number is required.");
  }

  const displayName = await ask("Admin name: ");

  if (!displayName) {
    throw new Error("Admin name is required.");
  }

  const email = await ask("Admin email (optional): ");

  const password = await ask("Admin password: ");

  if (!password) {
    throw new Error("Admin password is required.");
  }

  if (password.length < 6) {
    throw new Error("Admin password must be at least 6 characters.");
  }

  const confirmPassword = await ask("Confirm password: ");

  if (password !== confirmPassword) {
    throw new Error("Passwords do not match.");
  }

  /*
   * ============================================================
   * CHECK ROLE
   * ============================================================
   *
   * Roles are stored in lowercase.
   *
   * We specifically require:
   *
   *     admin
   */

  const adminRole = db
    .prepare(
      `
          SELECT id
          FROM roles
          WHERE name = ?
          LIMIT 1
        `,
    )
    .get("admin") as
    | {
        id: string;
      }
    | undefined;

  if (!adminRole) {
    throw new Error(
      'The "admin" role does not exist. Run the database migrations/seeding first.',
    );
  }

  /*
   * ============================================================
   * CHECK STAFF NUMBER
   * ============================================================
   *
   * staffNumber is globally UNIQUE in the database.
   */

  const existingStaff = db
    .prepare(
      `
          SELECT id
          FROM staff
          WHERE staffNumber = ?
          LIMIT 1
        `,
    )
    .get(staffNumber);

  if (existingStaff) {
    throw new Error(`Staff number "${staffNumber}" already exists.`);
  }

  /*
   * ============================================================
   * CHECK EMAIL
   * ============================================================
   */

  if (email) {
    const existingEmail = db
      .prepare(
        `
            SELECT id
            FROM staff
            WHERE email = ?
            LIMIT 1
          `,
      )
      .get(email);

    if (existingEmail) {
      throw new Error(
        `Email "${email}" is already associated with a staff account.`,
      );
    }
  }

  /*
   * ============================================================
   * CREATE IDS
   * ============================================================
   */

  const restaurantId = crypto.randomUUID();

  const staffId = crypto.randomUUID();

  const createdAt = new Date().toISOString();

  /*
   * ============================================================
   * HASH PASSWORD
   * ============================================================
   *
   * IMPORTANT:
   *
   * Never insert the plaintext password into SQLite.
   *
   * This uses the exact same hashing utility used by
   * StaffService.create().
   */

  const passwordHash = await hashPassword(password);

  /*
   * ============================================================
   * DATABASE TRANSACTION
   * ============================================================
   *
   * Restaurant + admin are created together.
   *
   * If either insert fails, neither is kept.
   */

  const createOnboarding = db.transaction(() => {
    db.prepare(
      `
              INSERT INTO restaurants (
                id,
                name,
                createdAt
              )
              VALUES (?, ?, ?)
            `,
    ).run(restaurantId, restaurantName, createdAt);

    db.prepare(
      `
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
            `,
    ).run(
      staffId,
      restaurantId,
      adminRole.id,
      staffNumber,
      displayName,
      email || null,
      passwordHash,
      1,
      createdAt,
    );
  });

  createOnboarding();

  /*
   * ============================================================
   * SUCCESS
   * ============================================================
   */

  console.log("");
  console.log("========================================");
  console.log("       Admin created successfully");
  console.log("========================================");
  console.log("");

  console.log(`Restaurant : ${restaurantName}`);

  console.log(`Restaurant ID : ${restaurantId}`);

  console.log(`Admin name : ${displayName}`);

  console.log(`Staff number : ${staffNumber}`);

  if (email) {
    console.log(`Email : ${email}`);
  }

  console.log(`Role : admin`);

  console.log("");
  console.log("The admin can now log in through QueueFlow.");
  console.log("");
}

main()
  .catch((error) => {
    console.error("");
    console.error("Admin onboarding failed.");

    console.error(error instanceof Error ? error.message : error);

    console.error("");

    process.exitCode = 1;
  })
  .finally(() => {
    rl.close();
  });
