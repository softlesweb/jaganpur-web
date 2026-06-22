const BRIDGE_URL = process.env.WHATSAPP_BRIDGE_URL ?? "http://localhost:9000";
const BRIDGE_TOKEN = process.env.WHATSAPP_BRIDGE_TOKEN ?? "";
const EMPLOYEE_ID = process.env.WHATSAPP_BRIDGE_EMPLOYEE_ID ?? "";

async function bridgeSend(recipient: string, message: string) {
  // Normalise: bridge wants digits only with country code, no + or spaces
  const to = recipient.replace(/^\+/, "").replace(/\D/g, "");
  const res = await fetch(`${BRIDGE_URL}/send/${EMPLOYEE_ID}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${BRIDGE_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ recipient: to, message }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Bridge send error: ${err}`);
  }
  return res.json();
}

export async function sendOtp(phone: string, otp: string) {
  const message =
    `🔐 *जगनपुर ग्राम ऐप*\n\n` +
    `आपका OTP है: *${otp}*\n\n` +
    `यह 10 मिनट में समाप्त हो जाएगा। किसी के साथ साझा न करें।`;
  return bridgeSend(phone, message);
}

export async function sendAnnouncementBroadcast(
  phones: string[],
  title: string,
  category: string,
  appUrl: string
) {
  const categoryEmojis: Record<string, string> = {
    general: "📢",
    farming: "🌾",
    health: "🏥",
    school: "🏫",
    government: "🏛️",
    emergency: "🚨",
  };
  const emoji = categoryEmojis[category] ?? "📢";
  const message =
    `${emoji} *जगनपुर ग्राम — नई सूचना*\n\n` +
    `*${title}*\n\n` +
    `अधिक जानकारी के लिए ऐप खोलें:\n${appUrl}`;

  const results = await Promise.allSettled(
    phones.map((phone) => bridgeSend(phone, message))
  );
  const failed = results.filter((r) => r.status === "rejected").length;
  return { total: phones.length, failed };
}

export async function sendRawBroadcast(phones: string[], message: string) {
  const results = await Promise.allSettled(
    phones.map((phone) => bridgeSend(phone, message))
  );
  const failed = results.filter((r) => r.status === "rejected").length;
  return { total: phones.length, failed };
}

export async function getContactName(phone: string): Promise<string | null> {
  // Look up push_name from bridge's local chat DB
  const jid = `${phone.replace(/^\+/, "").replace(/\D/g, "")}@s.whatsapp.net`;
  try {
    const res = await fetch(`${BRIDGE_URL}/bridge/${EMPLOYEE_ID}/chats`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${BRIDGE_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ allowed_jids: [jid], limit: 1 }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.chats?.[0]?.name ?? null;
  } catch {
    return null;
  }
}
