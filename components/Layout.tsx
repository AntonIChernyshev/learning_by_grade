import React, { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

type LayoutProps = {
  children: ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  const router = useRouter();
  
  const isActive = (path: string) => {
    return router.pathname === path ? 'bg-primary-100 text-primary-700' : 'hover:bg-primary-50';
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/">
              <a className="flex items-center space-x-2">
                <span className="text-3xl font-comic font-bold text-primary-600">Kids Learning Hub</span>
              </a>
            </Link>
          </div>
        </div>
        <nav className="bg-primary-50">
          <div className="container mx-auto px-4">
            <ul className="flex space-x-1 overflow-x-auto">
              <li>
                <Link href="/">
                  <a className={`block px-4 py-2 rounded-t-lg font-medium ${isActive('/')}`}>
                    Home
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/english">
                  <a className={`block px-4 py-2 rounded-t-lg font-medium ${isActive('/english')}`}>
                    English
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/math">
                  <a className={`block px-4 py-2 rounded-t-lg font-medium ${isActive('/math')}`}>
                    Math
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/science">
                  <a className={`block px-4 py-2 rounded-t-lg font-medium ${isActive('/science')}`}>
                    Science
                  </a>
                </Link>
              </li>
            </ul>
          </div>
        </nav>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>

      <footer className="bg-primary-800 text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-lg font-comic">Kids Learning Hub</p>
              <p className="text-sm text-primary-200">Making learning fun for kids!</p>
            </div>
            <div className="text-sm text-primary-200">
              © {new Date().getFullYear()} Kids Learning Hub. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout; 