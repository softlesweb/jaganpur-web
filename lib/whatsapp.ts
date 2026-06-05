const WA_API_URL = `https://graph.facebook.com/v19.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

async function callWhatsApp(body: object) {
  const res = await fetch(WA_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`WhatsApp API error: ${err}`);
  }
  return res.json();
}

export async function sendOtp(phone: string, otp: string) {
  const to = phone.startsWith("+") ? phone.slice(1) : `91${phone}`;
  return callWhatsApp({
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: {
      name: process.env.WHATSAPP_OTP_TEMPLATE ?? "jaganpur_otp",
      language: { code: "hi" },
      components: [
        {
          type: "body",
          parameters: [{ type: "text", text: otp }],
        },
        {
          type: "button",
          sub_type: "url",
          index: "0",
          parameters: [{ type: "text", text: otp }],
        },
      ],
    },
  });
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

  const results = await Promise.allSettled(
    phones.map((phone) => {
      const to = phone.startsWith("+") ? phone.slice(1) : `91${phone}`;
      return callWhatsApp({
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
          name: process.env.WHATSAPP_BROADCAST_TEMPLATE ?? "jaganpur_announcement",
          language: { code: "hi" },
          components: [
            {
              type: "body",
              parameters: [
                { type: "text", text: `${emoji} ${title}` },
                { type: "text", text: appUrl },
              ],
            },
          ],
        },
      });
    })
  );

  const failed = results.filter((r) => r.status === "rejected").length;
  return { total: phones.length, failed };
}
