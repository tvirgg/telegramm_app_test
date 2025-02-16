"use client";

import { SetStateAction, useEffect, useState } from "react";
import dynamic from "next/dynamic";

let TonConnect: any = null;

if (typeof window !== "undefined") {
  import("@tonconnect/sdk").then((module) => {
    TonConnect = module.TonConnect;
  });
}

declare global {
  interface Window {
    Telegram?: any;
  }
}

const TelegramApp = () => {
  const [user, setUser] = useState<{ first_name?: string }>({});
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [connector, setConnector] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && TonConnect) {
      const tonConnector = new TonConnect({
        manifestUrl: 'http://localhost:3000/tonconnect-manifest.json'
      });
      setConnector(tonConnector);

      // Subscribe to wallet changes
      const unsubscribe = tonConnector.onStatusChange((wallet: { account: { address: SetStateAction<string>; }; }) => {
        if (wallet) {
          setWalletAddress(wallet.account.address);
        } else {
          setWalletAddress('');
        }
      });

      return () => {
        unsubscribe();
      };
    }
  }, []);

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      setUser(tg.initDataUnsafe?.user || {});
    }
  }, []);

  const connectWallet = async () => {
    if (!connector) return;
    try {
      setIsConnecting(true);
      const walletConnectionSource = {
        jsBridgeKey: 'tonkeeper',
        bridgeUrl: 'https://bridge.tonapi.io/bridge'
      };
      await connector.connect(walletConnectionSource);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = async () => {
    if (!connector) return;
    try {
      await connector.disconnect();
      setWalletAddress('');
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">
        Привет, {user.first_name || "пользователь"}!
      </h1>

      <div className="space-y-4">
        <div className="flex justify-center">
          <button
            onClick={walletAddress ? disconnectWallet : connectWallet}
            disabled={isConnecting || !connector}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {isConnecting ? 'Подключение...' : walletAddress ? 'Отключить кошелек' : 'Подключить Telegram Wallet'}
          </button>
        </div>

        {walletAddress && (
          <div className="bg-gray-100 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Информация о кошельке:</h2>
            <p className="text-sm break-all">
              <span className="font-medium">Адрес: </span>
              {walletAddress}
            </p>
            <p className="text-sm">
              <span className="font-medium">Статус: </span>
              Подключен
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Отключаем SSR
export default dynamic(() => Promise.resolve(TelegramApp), { ssr: false });
