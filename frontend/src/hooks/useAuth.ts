'use client';

import { useAccount, useSignMessage, useDisconnect } from 'wagmi';
import { useEffect, useState } from 'react';
import axios from 'axios';

interface AuthUser {
  address: string;
  isAuthenticated: boolean;
  token?: string;
}

export function useAuth() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { disconnect } = useDisconnect();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Authenticate user with backend
  const authenticate = async () => {
    if (!address || !isConnected) {
      setError('Wallet not connected');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Get nonce from backend
      const { data: nonceData } = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/nonce`,
        { address }
      );

      const nonce = nonceData.nonce;
      const message = `Sign this message to authenticate with Proof-of-Art.\n\nNonce: ${nonce}\nAddress: ${address}`;

      // Step 2: Sign message with wallet
      const signature = await signMessageAsync({ message });

      // Step 3: Verify signature and get JWT
      const { data: authData } = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/verify`,
        {
          address,
          signature,
          message,
        }
      );

      // Store token and user data
      const authUser: AuthUser = {
        address,
        isAuthenticated: true,
        token: authData.token,
      };

      setUser(authUser);
      
      // Store token in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', authData.token);
        localStorage.setItem('user_address', address);
      }

      return authUser;
    } catch (err: any) {
      console.error('Authentication error:', err);
      setError(err.response?.data?.error || 'Authentication failed');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    disconnect();
    setUser(null);
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_address');
    }
  };

  // Check for existing authentication on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      const storedAddress = localStorage.getItem('user_address');

      if (token && storedAddress && address && storedAddress === address) {
        setUser({
          address,
          isAuthenticated: true,
          token,
        });
      }
    }
  }, [address]);

  // Auto-logout when wallet disconnects
  useEffect(() => {
    if (!isConnected && user) {
      logout();
    }
  }, [isConnected]);

  return {
    user,
    isAuthenticated: user?.isAuthenticated || false,
    isLoading,
    error,
    authenticate,
    logout,
    address,
    isConnected,
  };
}

