"use client";

import { useEffect, useState } from "react";

declare global {
  interface Window {
    Telegram?: any;
  }
}

const TelegramApp = () => {
  const [user, setUser] = useState<{ first_name?: string }>({});

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      setUser(tg.initDataUnsafe?.user || {});
    }
  }, []);

  const connectWallet = () => {
    window.open("https://t.me/Wallet", "_blank"); // Открывает Telegram Wallet
  };

  return (
    <div>
      <h1>Привет, {user.first_name || "пользователь"}!</h1>
      <button onClick={connectWallet}>Подключить Telegram Wallet</button>
    </div>
  );
};

export default TelegramApp;
