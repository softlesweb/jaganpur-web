"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

type Step = "phone" | "otp" | "name" | "success";

interface UserData {
  id: string;
  phone: string;
  name: string | null;
  role: string;
  digital_id?: number;
}

export default function LoginPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) ?? "hi";

  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);

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
    if (!res.ok) { toast.error(data.error ?? "OTP भेजने में विफल"); return; }
    toast.success("OTP आपके WhatsApp पर भेजा गया ✓");
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
    if (!res.ok) { toast.error(data.error ?? "OTP गलत है"); return; }

    setUserData(data.user);
    setIsNewUser(data.is_new_user);

    if (!data.user.name) {
      setStep("name");
    } else if (data.is_new_user) {
      setStep("success");
    } else {
      router.push(`/${locale}`);
      router.refresh();
    }
  }

  async function saveName() {
    if (!name.trim()) { toast.error("कृपया अपना नाम दर्ज करें"); return; }
    setLoading(true);
    await fetch("/api/auth/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim() }),
    });
    setLoading(false);
    if (userData) setUserData({ ...userData, name: name.trim() });
    setStep("success");
  }

  function goHome() {
    router.push(`/${locale}`);
    router.refresh();
  }

  const digitalId = userData?.digital_id
    ? `JGP-${String(userData.digital_id).padStart(4, "0")}`
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-stone-50 flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">

        {/* Header */}
        {step !== "success" && (
          <div className="text-center mb-8">
            <div className="text-5xl mb-3">🌾</div>
            <h1 className="text-2xl font-bold text-green-800">जगनपुर ग्राम</h1>
            <p className="text-stone-500 text-sm mt-2 leading-relaxed">
              जगनपुर की सभी सूचना अपने WhatsApp पर पाने के लिए<br />
              यहाँ पर Register करें
            </p>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6 space-y-4">

          {/* Step 1: Phone */}
          {step === "phone" && (
            <>
              <label className="text-sm font-medium text-stone-700 block">
                अपना WhatsApp नंबर दर्ज करें
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
                  autoFocus
                />
              </div>
              <Button className="w-full bg-green-700 hover:bg-green-800" onClick={sendOtp} disabled={loading}>
                {loading ? "भेजा जा रहा है..." : "WhatsApp OTP भेजें"}
              </Button>
            </>
          )}

          {/* Step 2: OTP */}
          {step === "otp" && (
            <>
              <p className="text-sm text-stone-600 text-center">
                +91 {phone} पर OTP भेजा गया
              </p>
              <Input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="6 अंकों का OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                onKeyDown={(e) => e.key === "Enter" && verifyOtp()}
                className="text-center text-2xl tracking-widest font-mono"
                autoFocus
              />
              <Button className="w-full bg-green-700 hover:bg-green-800" onClick={verifyOtp} disabled={loading}>
                {loading ? "सत्यापित हो रहा है..." : "सत्यापित करें"}
              </Button>
              <button className="w-full text-sm text-stone-400 hover:text-stone-600"
                onClick={() => { setStep("phone"); setOtp(""); }}>
                नंबर बदलें
              </button>
            </>
          )}

          {/* Step 3: Name (only if not auto-populated) */}
          {step === "name" && (
            <>
              <p className="text-sm text-green-700 font-medium text-center">✓ OTP सत्यापित हो गया!</p>
              <label className="text-sm font-medium text-stone-700 block">आपका नाम</label>
              <Input
                placeholder="अपना पूरा नाम दर्ज करें"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveName()}
                autoFocus
              />
              <Button className="w-full bg-green-700 hover:bg-green-800" onClick={saveName} disabled={loading}>
                {loading ? "..." : "जारी रखें →"}
              </Button>
            </>
          )}

          {/* Step 4: Success */}
          {step === "success" && (
            <div className="text-center space-y-5 py-2">
              <div className="text-5xl">🎉</div>
              <div>
                <h2 className="text-xl font-bold text-green-800">
                  {isNewUser ? "Registration सफल हो गया!" : "जगनपुर में आपका स्वागत है!"}
                </h2>
                <p className="text-stone-500 text-sm mt-1">
                  {userData?.name ? `नमस्ते, ${userData.name}` : ""}
                </p>
              </div>

              {digitalId && (
                <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4">
                  <p className="text-xs text-stone-500 mb-1">आपका Digital ID</p>
                  <p className="text-3xl font-black text-green-700 tracking-wider">{digitalId}</p>
                  <p className="text-xs text-stone-400 mt-1">इसे संभाल कर रखें</p>
                </div>
              )}

              <p className="text-sm text-stone-600 leading-relaxed">
                अब आपको जगनपुर की सभी महत्वपूर्ण सूचनाएं सीधे <span className="font-semibold text-green-700">WhatsApp</span> पर मिलेंगी।
              </p>

              <Button className="w-full bg-green-700 hover:bg-green-800" onClick={goHome}>
                सूचनाएं देखें →
              </Button>
            </div>
          )}
        </div>

        {step === "phone" && (
          <p className="text-center text-xs text-stone-400 mt-4">
            Registration निःशुल्क है • WhatsApp जरूरी है
          </p>
        )}
      </div>
    </div>
  );
}
