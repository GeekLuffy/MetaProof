'use client';

import { useAuth } from '@/hooks/useAuth';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useState } from 'react';

export function AuthButton() {
  const { isAuthenticated, authenticate, isLoading, error } = useAuth();
  const [showError, setShowError] = useState(false);

  const handleAuthenticate = async () => {
    const result = await authenticate();
    if (!result) {
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
    }
  };

  return (
    <div className="relative">
      <ConnectButton.Custom>
        {({
          account,
          chain,
          openAccountModal,
          openChainModal,
          openConnectModal,
          authenticationStatus,
          mounted,
        }) => {
          const ready = mounted && authenticationStatus !== 'loading';
          const connected =
            ready &&
            account &&
            chain &&
            (!authenticationStatus || authenticationStatus === 'authenticated');

          return (
            <div
              {...(!ready && {
                'aria-hidden': true,
                style: {
                  opacity: 0,
                  pointerEvents: 'none',
                  userSelect: 'none',
                },
              })}
            >
              {(() => {
                if (!connected) {
                  return (
                    <button
                      onClick={openConnectModal}
                      type="button"
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                    >
                      Connect Wallet
                    </button>
                  );
                }

                if (chain.unsupported) {
                  return (
                    <button
                      onClick={openChainModal}
                      type="button"
                      className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                    >
                      Wrong Network
                    </button>
                  );
                }

                // Connected but not authenticated
                if (!isAuthenticated) {
                  return (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleAuthenticate}
                        disabled={isLoading}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? 'Signing...' : 'Sign to Authenticate'}
                      </button>
                      <button
                        onClick={openAccountModal}
                        type="button"
                        className="bg-slate-800 hover:bg-slate-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 border border-slate-700"
                      >
                        {account.displayName}
                      </button>
                    </div>
                  );
                }

                // Fully authenticated
                return (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-green-600/10 border border-green-500/20 rounded-md">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="text-xs text-green-400 font-medium">Authenticated</span>
                    </div>
                    
                    <button
                      onClick={openAccountModal}
                      type="button"
                      className="bg-slate-800 hover:bg-slate-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 border border-slate-700"
                    >
                      {account.displayName}
                      {account.displayBalance && (
                        <span className="ml-2 text-slate-400 text-sm">
                          {account.displayBalance}
                        </span>
                      )}
                    </button>
                  </div>
                );
              })()}
            </div>
          );
        }}
      </ConnectButton.Custom>

      {/* Error notification */}
      {showError && error && (
        <div className="absolute top-full mt-2 right-0 bg-red-600 border border-red-500 text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in max-w-xs z-50">
          <p className="text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}

