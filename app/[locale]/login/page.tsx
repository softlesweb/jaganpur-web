"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

type Step = "phone" | "otp" | "name";

export default function LoginPage() {
  const t = useTranslations("login");
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) ?? "hi";

  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendOtp() {
    if (!phone || phone.replace(/\D/g, "").length < 10) {
      toast.error("कृपया सही मोबाइल नंबर दर्ज करें");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/auth/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: phone.replace(/\D/g, "") }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      toast.error(data.error ?? t("..error"));
      return;
    }

    if (data.dev_otp) {
      toast.info(`[DEV] OTP: ${data.dev_otp}`);
    } else {
      toast.success(t("otpSent"));
    }
    setStep("otp");
  }

  async function verifyOtp() {
    if (!otp || otp.length !== 6) {
      toast.error("कृपया 6 अंकों का OTP दर्ज करें");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: phone.replace(/\D/g, ""), otp }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      toast.error(data.error ?? "OTP सही नहीं है");
      return;
    }

    if (!data.user.name) {
      setStep("name");
    } else {
      toast.success(t("welcome"));
      router.push(`/${locale}`);
      router.refresh();
    }
  }

  async function saveName() {
    if (!name.trim()) {
      toast.error("कृपया अपना नाम दर्ज करें");
      return;
    }
    // Update name via a simple fetch (we'll use the session)
    await fetch("/api/auth/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim() }),
    });
    toast.success(t("welcome"));
    router.push(`/${locale}`);
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-stone-50 flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🌾</div>
          <h1 className="text-2xl font-bold text-green-800">{t("title")}</h1>
          <p className="text-stone-500 text-sm mt-1">{t("subtitle")}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6 space-y-4">
          {step === "phone" && (
            <>
              <div>
                <label className="text-sm font-medium text-stone-700 block mb-1.5">
                  {t("phonePlaceholder")}
                </label>
                <div className="flex gap-2">
                  <span className="flex items-center px-3 bg-stone-100 rounded-lg text-stone-600 text-sm border border-stone-200">
                    +91
                  </span>
                  <Input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    onKeyDown={(e) => e.key === "Enter" && sendOtp()}
                    className="flex-1"
                  />
                </div>
              </div>
              <Button
                className="w-full bg-green-700 hover:bg-green-800"
                onClick={sendOtp}
                disabled={loading}
              >
                {loading ? t("sending") : t("sendOtp")}
              </Button>
            </>
          )}

          {step === "otp" && (
            <>
              <p className="text-sm text-stone-600 text-center">{t("otpSent")}</p>
              <Input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder={t("otpPlaceholder")}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                onKeyDown={(e) => e.key === "Enter" && verifyOtp()}
                className="text-center text-xl tracking-widest"
              />
              <Button
                className="w-full bg-green-700 hover:bg-green-800"
                onClick={verifyOtp}
                disabled={loading}
              >
                {loading ? t("verifying") : t("verify")}
              </Button>
              <button
                className="w-full text-sm text-stone-400 hover:text-stone-600"
                onClick={() => { setStep("phone"); setOtp(""); }}
              >
                {t("changePhone")}
              </button>
            </>
          )}

          {step === "name" && (
            <>
              <p className="text-sm text-stone-600 text-center">{t("welcome")}</p>
              <Input
                type="text"
                placeholder={t("namePlaceholder")}
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveName()}
              />
              <Button
                className="w-full bg-green-700 hover:bg-green-800"
                onClick={saveName}
                disabled={loading}
              >
                {t("saveName")}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
