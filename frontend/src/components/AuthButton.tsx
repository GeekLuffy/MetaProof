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
                      className="relative group px-5 py-2.5 glass-card hover-lift border border-white/20 text-white font-medium rounded-xl transition-all duration-300"
                    >
                      <span className="flex items-center gap-2 text-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Connect Wallet
                      </span>
                    </button>
                  );
                }

                if (chain.unsupported) {
                  return (
                    <button
                      onClick={openChainModal}
                      type="button"
                      className="px-5 py-2.5 glass-card border border-red-500/30 hover:border-red-500/50 text-red-400 font-medium rounded-xl transition-all duration-300"
                    >
                      <span className="flex items-center gap-2 text-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        Wrong Network
                      </span>
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
                        className="px-5 py-2.5 glass-card hover-lift border border-white/20 text-white font-medium rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="flex items-center gap-2 text-sm">
                          {isLoading ? (
                            <>
                              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                              Signing...
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                              Sign Message
                            </>
                          )}
                        </span>
                      </button>
                      <button
                        onClick={openAccountModal}
                        type="button"
                        className="px-4 py-2.5 glass border border-white/10 hover:border-white/20 text-white font-medium rounded-xl transition-all duration-300 text-sm"
                      >
                        {account.displayName}
                      </button>
                    </div>
                  );
                }

                // Fully authenticated
                return (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 px-3 py-1.5 glass border border-white/20 rounded-lg">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-xs text-gray-300 font-medium">Connected</span>
                    </div>
                    
                    <button
                      onClick={openAccountModal}
                      type="button"
                      className="px-4 py-2.5 glass-card hover-lift border border-white/10 text-white font-medium rounded-xl transition-all duration-300 text-sm"
                    >
                      <span className="flex items-center gap-2">
                        {account.displayName}
                        {account.displayBalance && (
                          <span className="text-gray-400 text-xs">
                            {account.displayBalance}
                          </span>
                        )}
                      </span>
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

