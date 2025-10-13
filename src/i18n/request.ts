import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

// Static imports to avoid dynamic import issues in Vercel
import enMessages from './messages/en.json';
import trMessages from './messages/tr.json';

const messages = {
  en: enMessages,
  tr: trMessages,
};

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'tr';

  return {
    locale,
    messages: messages[locale as keyof typeof messages] || messages.tr
  };
});
