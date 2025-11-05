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
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
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
                      className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-300"
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
                        className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? 'Signing...' : 'Sign to Authenticate'}
                      </button>
                      <button
                        onClick={openAccountModal}
                        type="button"
                        className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300"
                      >
                        {account.displayName}
                      </button>
                    </div>
                  );
                }

                // Fully authenticated
                return (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 glass px-4 py-2 rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-sm text-gray-300">Authenticated</span>
                    </div>
                    
                    <button
                      onClick={openChainModal}
                      type="button"
                      className="glass hover:bg-white/20 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 flex items-center gap-2"
                    >
                      {chain.hasIcon && (
                        <div
                          className="w-5 h-5"
                          style={{
                            background: chain.iconBackground,
                            borderRadius: 999,
                            overflow: 'hidden',
                          }}
                        >
                          {chain.iconUrl && (
                            <img
                              alt={chain.name ?? 'Chain icon'}
                              src={chain.iconUrl}
                              className="w-5 h-5"
                            />
                          )}
                        </div>
                      )}
                      {chain.name}
                    </button>

                    <button
                      onClick={openAccountModal}
                      type="button"
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      {account.displayName}
                      {account.displayBalance && (
                        <span className="ml-2 opacity-75">
                          ({account.displayBalance})
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
        <div className="absolute top-full mt-2 right-0 bg-red-500/90 text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in max-w-xs">
          <p className="text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}

