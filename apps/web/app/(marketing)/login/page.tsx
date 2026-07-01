import { LoginForm } from "./login-form";

export default function LoginPage() {
  const telegramBotUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;
  const showTelegramLogin = process.env.NEXT_PUBLIC_SHOW_TELEGRAM_LOGIN === "true";

  return (
    <LoginForm
      telegramBotUsername={telegramBotUsername}
      showTelegramLogin={showTelegramLogin}
    />
  );
}
