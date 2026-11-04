import { useState } from "react";

import { motion } from "motion/react";

import { QRCodeSVG } from "qrcode.react";

import { Copy, Check, QrCode } from "lucide-react";

import { QRCodeCardProps } from "./types";

export default function QRCodeCard({ table }: QRCodeCardProps) {
  const [copied, setCopied] = useState(false);

  /*
   * ============================================================
   * CUSTOMER DINING SESSION URL
   * ============================================================
   *
   * The table token is the permanent identifier embedded in
   * the physical table QR code.
   *
   * Customers scan this URL to enter the dining session.
   */

  const qrUrl =
    `${window.location.origin}/join-session` +
    `?table=${encodeURIComponent(table.tableToken)}` +
    `&tableNumber=${encodeURIComponent(table.tableNumber)}`;

  /*
   * ============================================================
   * COPY QR URL
   * ============================================================
   */

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(qrUrl);

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      setCopied(false);
    }
  }

  /*
   * ============================================================
   * RENDER
   * ============================================================
   */

  return (
    <div className="space-y-4">
      {/* ======================================================
          HEADER
          ====================================================== */}

      <div className="flex items-center gap-2">
        <QrCode
          className="
            h-5
            w-5
            text-cyan-400
          "
        />

        <h4
          className="
            text-sm
            font-bold
            uppercase
            tracking-widest
            text-white
          "
        >
          Customer QR Code
        </h4>
      </div>

      {/* ======================================================
          QR CARD
          ====================================================== */}

      <div
        className="
          rounded-xl
          border
          border-white/10
          bg-white/5
          p-6
        "
      >
        <div
          className="
            flex
            flex-col
            items-center
            gap-5
          "
        >
          {/* ==================================================
              QR
              ================================================== */}

          <div
            className="
              rounded-xl
              bg-white
              p-4
              shadow-xl
            "
          >
            <QRCodeSVG
              value={qrUrl}
              size={160}
              bgColor="#ffffff"
              fgColor="#000000"
              includeMargin
              level="H"
            />
          </div>

          {/* ==================================================
              TABLE INFORMATION
              ================================================== */}

          <div className="text-center">
            <p className="text-sm font-bold text-white">
              Table {table.tableNumber}
            </p>

            <p className="mt-1 text-xs text-white/40">
              Capacity: {table.capacity}
            </p>
          </div>

          {/* ==================================================
              COPY
              ================================================== */}

          <motion.button
            type="button"
            whileHover={{
              scale: 1.02,
            }}
            whileTap={{
              scale: 0.98,
            }}
            onClick={copyLink}
            className="
              flex
              w-full
              items-center
              justify-center
              gap-2
              rounded-lg
              border
              border-green-500/30
              bg-gradient-to-r
              from-green-500/20
              to-emerald-500/20
              px-4
              py-3
              font-bold
              text-green-400
              transition-all
              hover:from-green-500/30
              hover:to-emerald-500/30
            "
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy QR Link
              </>
            )}
          </motion.button>

          {/* ==================================================
              DESCRIPTION
              ================================================== */}

          <p
            className="
              text-center
              text-xs
              leading-relaxed
              text-white/40
            "
          >
            Customers scan this QR code to join the dining session and begin
            ordering.
          </p>
        </div>
      </div>
    </div>
  );
}
