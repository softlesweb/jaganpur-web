import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Toaster } from "@/components/ui/sonner";
import BottomNav from "@/components/BottomNav";
import LanguageToggle from "@/components/LanguageToggle";
import { getSession } from "@/lib/auth";

type Params = { locale: string };

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<Params>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "hi" | "en")) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();
  const session = await getSession();

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <div lang={locale} className="flex flex-col min-h-screen">
        {session && (
          <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-green-100 shadow-sm">
            <div className="max-w-lg mx-auto px-4 h-13 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">🎓</span>
                <span className="font-bold text-green-800 text-sm tracking-tight">जगनपुर छात्र पोर्टल</span>
              </div>
              <LanguageToggle />
            </div>
          </header>
        )}
        <main className="flex-1 pb-24">{children}</main>
        {session && <BottomNav role={session.role} />}
      </div>
      <Toaster position="top-center" richColors />
    </NextIntlClientProvider>
  );
}
