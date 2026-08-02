import { useState } from "react";
import { motion } from "motion/react";
import { QRCodeSVG } from "qrcode.react";
import { Copy, Check, QrCode } from "lucide-react";

import { QRCodeCardProps } from "./types";

export default function QRCodeCard({
  table,
}: QRCodeCardProps) {
  const [copied, setCopied] = useState(false);

  // TODO:
  // Replace with the actual Dining Session route
  // once customer ordering is implemented.
  const qrUrl = `${window.location.origin}/join-session?table=${table.id}`;

  async function copyLink() {
    await navigator.clipboard.writeText(qrUrl);

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  }

  return (
    <div className="space-y-4">

      <div className="flex items-center gap-2">
        <QrCode className="h-5 w-5 text-cyan-400" />

        <h4 className="text-sm font-bold text-white uppercase tracking-widest">
          Customer QR Code
        </h4>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-6">

        <div className="flex flex-col items-center gap-5">

          <div className="rounded-xl bg-white p-4 shadow-xl">
            <QRCodeSVG
              value={qrUrl}
              size={160}
              bgColor="#ffffff"
              fgColor="#000000"
              includeMargin
              level="H"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={copyLink}
            className="w-full rounded-lg border border-green-500/30 bg-gradient-to-r from-green-500/20 to-emerald-500/20 px-4 py-3 font-bold text-green-400 transition-all hover:from-green-500/30 hover:to-emerald-500/30 flex items-center justify-center gap-2"
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

          <p className="text-center text-xs text-white/40">
            Customers scan this QR code to join the dining session
            and begin ordering.
          </p>

        </div>

      </div>

    </div>
  );
}