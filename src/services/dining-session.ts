import { api } from "./api";

import {
  DiningSessionResponse,
  CreateDiningSessionRequest,
  JoinDiningSessionRequest,
} from "../types/dining-session";

export const diningSessionsService = {
  /**
   * Create a new dining session from the staff side.
   *
   * Requires staff authentication.
   *
   * Backend:
   * POST /dining-sessions/start
   */
  create(request: CreateDiningSessionRequest): Promise<DiningSessionResponse> {
    return api.post<DiningSessionResponse>("/dining-sessions/start", request);
  },

  /**
   * Create a new dining session from the customer/table QR flow.
   *
   * This endpoint intentionally does NOT require staff
   * authentication. The restaurant ID and table token identify
   * the restaurant/table, while the backend validates the table.
   *
   * Backend:
   * POST /dining-sessions/customer-start/:restaurantId
   */
  createCustomer(
    restaurantId: string,
    request: CreateDiningSessionRequest,
  ): Promise<DiningSessionResponse> {
    return api.post<DiningSessionResponse>(
      `/dining-sessions/customer-start/${encodeURIComponent(restaurantId)}`,
      request,
    );
  },

  /**
   * Look up an existing dining session
   * using its session token.
   *
   * Backend:
   * GET /dining-sessions/token/:token
   */
  getByToken(sessionToken: string): Promise<DiningSessionResponse> {
    return api.get<DiningSessionResponse>(
      `/dining-sessions/token/${encodeURIComponent(sessionToken)}`,
    );
  },

  /**
   * Get the active dining session for a table.
   *
   * Backend:
   * GET /dining-sessions/table/:tableToken
   */
  getActiveByTableToken(tableToken: string): Promise<DiningSessionResponse> {
    return api.get<DiningSessionResponse>(
      `/dining-sessions/table/${encodeURIComponent(tableToken)}`,
    );
  },

  /**
   * Join an existing dining session
   * using the table token and 4-digit
   * join code.
   *
   * Backend:
   * POST /dining-sessions/join
   */
  join(request: JoinDiningSessionRequest): Promise<DiningSessionResponse> {
    return api.post<DiningSessionResponse>("/dining-sessions/join", request);
  },

  /**
   * Get a dining session by its internal ID.
   *
   * Backend:
   * GET /dining-sessions/:id
   */
  getById(sessionId: string): Promise<DiningSessionResponse> {
    return api.get<DiningSessionResponse>(
      `/dining-sessions/${encodeURIComponent(sessionId)}`,
    );
  },

  /**
   * Complete a dining session.
   *
   * This is primarily a staff-side operation.
   *
   * Backend:
   * PATCH /dining-sessions/:id/complete
   */
  complete(sessionId: string): Promise<DiningSessionResponse> {
    return api.patch<DiningSessionResponse>(
      `/dining-sessions/${encodeURIComponent(sessionId)}/complete`,
      {},
    );
  },
};
