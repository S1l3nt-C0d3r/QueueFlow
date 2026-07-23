import { randomUUID } from "crypto";

import { db } from "../../database/connection";

import {
  CreateStaffRequest,
  StaffEntity,
  UpdateStaffRequest,
} from "./staff.types";

export class StaffRepository {
  findAll(restaurantId: string): StaffEntity[] {
    return db
      .prepare(`
        SELECT *
        FROM staff
        WHERE restaurantId = ?
        ORDER BY createdAt DESC
      `)
      .all(restaurantId) as StaffEntity[];
  }

  findById(
    restaurantId: string,
    id: string
  ): StaffEntity | undefined {
    return db
      .prepare(`
        SELECT *
        FROM staff
        WHERE restaurantId = ?
          AND id = ?
      `)
      .get(
        restaurantId,
        id
      ) as StaffEntity | undefined;
  }

  findByStaffNumber(
    restaurantId: string,
    staffNumber: string
  ): StaffEntity | undefined {
    return db
      .prepare(`
        SELECT *
        FROM staff
        WHERE restaurantId = ?
          AND staffNumber = ?
      `)
      .get(
        restaurantId,
        staffNumber
      ) as StaffEntity | undefined;
  }

  create(
    restaurantId: string,
    data: CreateStaffRequest,
    passwordHash: string
  ): StaffEntity {
    const id = randomUUID();
    const createdAt = new Date().toISOString();

    db.prepare(`
      INSERT INTO staff
      (
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
      VALUES
      (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      restaurantId,
      data.roleId,
      data.staffNumber,
      data.displayName,
      data.email ?? null,
      passwordHash,
      1,
      createdAt
    );

    return this.findById(
      restaurantId,
      id
    )!;
  }

  update(
    restaurantId: string,
    id: string,
    data: UpdateStaffRequest
  ): void {
    db.prepare(`
      UPDATE staff
      SET
        displayName = ?,
        email = ?,
        roleId = ?,
        active = ?
      WHERE restaurantId = ?
        AND id = ?
    `).run(
      data.displayName,
      data.email ?? null,
      data.roleId,
      data.active ? 1 : 0,
      restaurantId,
      id
    );
  }

  updatePassword(
    restaurantId: string,
    id: string,
    passwordHash: string
  ): void {
    db.prepare(`
      UPDATE staff
      SET passwordHash = ?
      WHERE restaurantId = ?
        AND id = ?
    `).run(
      passwordHash,
      restaurantId,
      id
    );
  }
}