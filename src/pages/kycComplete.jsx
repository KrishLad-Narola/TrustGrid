import { useEffect, useRef, useState } from "react";
import {
  ShieldCheck,
  Clock,
  Check,
  Home,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";

const DOCUMENT_OPTIONS = [
  { key: "GST_CERTIFICATE", label: "GST Certificate" },
  { key: "PAN_CARD", label: "PAN Card" },
  { key: "INCORPORATION_CERTIFICATE", label: "Incorporation Certificate" },
  { key: "BANK_PROOF", label: "Bank Proof" },
];


export default function KycCompletePage() {
  const navigate = useNavigate();

  const { logoutLocal } = useAuth();


  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200">

        <div className="p-8 flex flex-col items-center text-center">

          <div className="h-20 w-20 rounded-full bg-green-500 flex items-center justify-center mb-6">
            <ShieldCheck className="h-10 w-10 text-white" />
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            KYC Submitted
          </h2>

          <p className="text-sm text-slate-500">
            Your documents have been submitted successfully.
          </p>

          <div className="w-full mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-left">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-slate-500 mt-0.5" />

              <div>
                <p className="text-sm font-medium text-slate-700">
                  Verification in Progress
                </p>

                <p className="text-xs text-slate-500 mt-1">
                  You will receive an update once verified.
                </p>
              </div>
            </div>
          </div>

          <div className="w-full mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400 mb-3">
              Documents Submitted
            </p>

            <div className="space-y-2">
              {DOCUMENT_OPTIONS.map((doc) => (
                <div
                  key={doc.key}
                  className="flex items-center gap-2"
                >
                  <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center">
                    <Check className="h-3 w-3 text-green-600" />
                  </div>

                  <span className="text-sm text-slate-600">
                    {doc.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => {
              // clearInterval(countdownRef.current);
              // navigate("/");
              logoutLocal();
            }}
            className="w-full h-11 mt-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center justify-center gap-2"
          >
            <Home className="h-4 w-4" />
            Go to Homepage
          </button>

        </div>
      </div>
    </div>
  );
}