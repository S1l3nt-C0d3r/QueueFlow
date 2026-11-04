import { FormEvent, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { Phone, User, Users, UtensilsCrossed } from "lucide-react";

import { motion } from "motion/react";

import { diningSessionsService } from "../../services/dining-session";

import {
  CreateDiningSessionRequest,
  SessionSource,
} from "../../types/dining-session";

export default function JoinSession() {
  const [searchParams] = useSearchParams();

  const navigate = useNavigate();

  const tableToken = searchParams.get("table");

  const queueId = searchParams.get("queueId");

  const sourceParam = searchParams.get("source");

  const source: SessionSource =
    sourceParam === "QUEUE"
      ? "QUEUE"
      : sourceParam === "RESERVATION"
        ? "RESERVATION"
        : "WALK_IN";

  const [name, setName] = useState("");

  const [phone, setPhone] = useState("");

  const [partySize, setPartySize] = useState(2);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError(null);

    if (!tableToken) {
      setError("Invalid table QR code.");
      return;
    }

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!phone.trim()) {
      setError("Please enter your phone number.");
      return;
    }

    if (phone.trim().length < 10) {
      setError("Please enter a valid phone number.");
      return;
    }

    if (partySize < 1) {
      setError("Party size must be at least 1.");
      return;
    }

    /*
     * A queue dining session must have
     * the queue ID supplied by the QR flow.
     */
    if (source === "QUEUE" && !queueId) {
      setError(
        "Your queue information is missing. Please scan the table QR again.",
      );
      return;
    }

    try {
      setLoading(true);

      const request: CreateDiningSessionRequest = {
        tableToken,

        ...(queueId
          ? {
              queueId,
            }
          : {}),

        source,

        customer: {
          name: name.trim(),
          phone: phone.trim(),
        },

        partySize,
      };

      const session = await diningSessionsService.create(request);

      /*
       * Keep the complete session locally.
       *
       * CustomerView can use this immediately,
       * and the session token can be used to
       * restore the session if the page reloads.
       */
      sessionStorage.setItem("customerDiningSession", JSON.stringify(session));

      sessionStorage.setItem("customerSessionToken", session.sessionToken);

      sessionStorage.setItem("customerName", session.createdByName);

      sessionStorage.setItem("customerPhone", session.createdByPhone);

      sessionStorage.setItem("partySize", String(session.partySize));

      /*
       * The backend response contains the
       * restaurant ID and the session token.
       *
       * CustomerView can now load the actual
       * dining session instead of using
       * hardcoded customer/table information.
       */
      navigate(
        `/q/${session.restaurantId}?session=${encodeURIComponent(
          session.sessionToken,
        )}`,
      );
    } catch (err) {
      console.error("Failed to create dining session:", err);

      setError(
        "Unable to start your dining session. Please try scanning the table QR code again.",
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * No table token means this is not a
   * valid customer table QR.
   */
  if (!tableToken) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-center text-white">
        <div className="max-w-md">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-cyan-500/10">
            <UtensilsCrossed size={40} className="text-cyan-400" />
          </div>

          <h1 className="mt-6 text-2xl font-bold">Invalid QR Code</h1>

          <p className="mt-3 text-white/50">
            Please scan the QR code displayed on your restaurant table.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 px-5 py-10 text-white">
      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.3,
        }}
        className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-7 shadow-2xl backdrop-blur-xl"
      >
        {/* Header */}

        <div className="mb-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500/10">
            <UtensilsCrossed size={30} className="text-cyan-400" />
          </div>

          <h1 className="mt-5 text-2xl font-bold">Welcome!</h1>

          <p className="mt-2 text-sm text-white/50">
            Enter your details to start ordering.
          </p>
        </div>

        {/* Form */}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}

          <div>
            <label
              htmlFor="customer-name"
              className="mb-2 block text-sm font-medium text-white/70"
            >
              Your Name
            </label>

            <div className="relative">
              <User
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
              />

              <input
                id="customer-name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Enter your name"
                autoComplete="name"
                disabled={loading}
                className="w-full rounded-xl border border-white/10 bg-white/5 py-3.5 pl-11 pr-4 text-white placeholder:text-white/30 outline-none transition focus:border-cyan-500/50 disabled:opacity-50"
              />
            </div>
          </div>

          {/* Phone */}

          <div>
            <label
              htmlFor="customer-phone"
              className="mb-2 block text-sm font-medium text-white/70"
            >
              Phone Number
            </label>

            <div className="relative">
              <Phone
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
              />

              <input
                id="customer-phone"
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="Enter your phone number"
                autoComplete="tel"
                disabled={loading}
                className="w-full rounded-xl border border-white/10 bg-white/5 py-3.5 pl-11 pr-4 text-white placeholder:text-white/30 outline-none transition focus:border-cyan-500/50 disabled:opacity-50"
              />
            </div>
          </div>

          {/* Party Size */}

          <div>
            <label
              htmlFor="party-size"
              className="mb-2 block text-sm font-medium text-white/70"
            >
              Party Size
            </label>

            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10">
                <Users size={20} className="text-cyan-400" />
              </div>

              <select
                id="party-size"
                value={partySize}
                onChange={(event) => setPartySize(Number(event.target.value))}
                disabled={loading}
                className="flex-1 rounded-xl border border-white/10 bg-slate-900 px-4 py-3.5 text-white outline-none focus:border-cyan-500/50 disabled:opacity-50"
              >
                {Array.from(
                  {
                    length: 12,
                  },
                  (_, index) => index + 1,
                ).map((size) => (
                  <option key={size} value={size}>
                    {size} {size === 1 ? "Person" : "People"}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Error */}

          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Submit */}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 py-4 font-semibold text-white shadow-lg shadow-cyan-500/10 transition hover:from-cyan-400 hover:to-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Starting...
              </>
            ) : (
              <>
                <UtensilsCrossed size={20} />
                Start Ordering
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
