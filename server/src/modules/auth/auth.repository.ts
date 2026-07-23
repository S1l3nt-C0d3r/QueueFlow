import { db } from "../../database/connection";
import {StaffEntity} from "./auth.types";
export class AuthRepository {

    findByStaffNumber(staffNumber: string) {

        return db.prepare(`
            SELECT *
            FROM staff
            WHERE staffNumber = ?
            AND active = 1
        `).get(staffNumber) as StaffEntity | undefined;

    }

}