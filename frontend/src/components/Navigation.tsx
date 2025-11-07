'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AuthButton } from '@/components/AuthButton';
import { useAuth } from '@/hooks/useAuth';

export function Navigation() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const isHome = pathname === '/';

  return (
    <nav className="sticky top-0 z-50 glass border-b border-white/5 animate-slide-down">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-10 h-10 rounded-xl glass-card flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 rounded-xl" />
                <svg className="w-5 h-5 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </div>
              <span className="text-xl font-bold text-white tracking-tight">MetaProof</span>
            </Link>
          </div>
          <div className="flex items-center gap-8">
            <div className="hidden md:flex items-center gap-8">
              <Link 
                href="/create" 
                className={`relative text-sm font-medium transition-colors ${
                  pathname === '/create'
                    ? 'text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {pathname === '/create' && (
                  <span className="absolute -bottom-[21px] left-0 right-0 h-[2px] bg-white" />
                )}
                Create
              </Link>
              <Link 
                href="/verify" 
                className={`relative text-sm font-medium transition-colors ${
                  pathname === '/verify'
                    ? 'text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {pathname === '/verify' && (
                  <span className="absolute -bottom-[21px] left-0 right-0 h-[2px] bg-white" />
                )}
                Verify
              </Link>
              <Link 
                href="/poa" 
                className={`relative text-sm font-medium transition-colors ${
                  pathname === '/poa'
                    ? 'text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {pathname === '/poa' && (
                  <span className="absolute -bottom-[21px] left-0 right-0 h-[2px] bg-white" />
                )}
                OwnChain
              </Link>
              <Link 
                href="/extension" 
                className={`relative text-sm font-medium transition-colors ${
                  pathname === '/extension'
                    ? 'text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {pathname === '/extension' && (
                  <span className="absolute -bottom-[21px] left-0 right-0 h-[2px] bg-white" />
                )}
                Extension
              </Link>
              {isAuthenticated && (
                <Link 
                  href="/dashboard" 
                  className={`relative text-sm font-medium transition-colors ${
                    pathname === '/dashboard'
                      ? 'text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {pathname === '/dashboard' && (
                    <span className="absolute -bottom-[21px] left-0 right-0 h-[2px] bg-white" />
                  )}
                  Dashboard
                </Link>
              )}
            </div>
            <AuthButton />
          </div>
        </div>
      </div>
    </nav>
  );
}

