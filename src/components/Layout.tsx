import { Link } from 'react-router-dom';
import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-green-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <span className="text-xl font-bold">EcoAction</span>
              </Link>
            </div>
            <div className="flex space-x-4">
              <Link to="/" className="hover:bg-green-700 px-3 py-2 rounded-md">
                Home
              </Link>
              <Link to="/organizations" className="hover:bg-green-700 px-3 py-2 rounded-md">
                Organizations
              </Link>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
      <footer className="bg-green-600 text-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center">© 2025 EcoAction. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
} 