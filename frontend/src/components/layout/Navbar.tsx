import { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

export function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = useMemo(() => {
    if (!user) return [];
    
    const links = [{ href: '/dashboard', label: 'Dashboard' }];
    
    // Employee-specific links
    if (user.role === 'EMPLOYEE') {
      links.push({ href: '/leave-requests', label: 'My Leave Requests' });
    }
    
    // HR and Admin can manage leave requests
    if (user.role === 'HR' || user.role === 'ADMIN') {
      links.push({ href: '/manage/leave-requests', label: 'Manage Leave' });
    }
    
    // Admin only - user management
    if (user.role === 'ADMIN') {
      links.push({ href: '/admin/users', label: 'Manage Users' });
    }
    
    return links;
  }, [user]);

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Desktop Layout */}
          <div className="flex space-x-8">
            <div className="flex items-center">
              <span className="text-lg sm:text-xl font-bold text-primary">Leave Management</span>
            </div>
            <div className="hidden md:flex space-x-4 items-center">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    location.pathname === link.href
                      ? 'text-primary bg-primary/10'
                      : 'text-gray-700 hover:text-primary hover:bg-gray-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <span className="text-sm text-gray-700">
              {user?.firstName} {user?.lastName}
            </span>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-3 py-2 text-base font-medium rounded-md ${
                  location.pathname === link.href
                    ? 'text-primary bg-primary/10'
                    : 'text-gray-700 hover:text-primary hover:bg-gray-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="px-4 flex items-center">
              <div className="flex-1">
                <div className="text-base font-medium text-gray-800">
                  {user?.firstName} {user?.lastName}
                </div>
                <div className="text-sm text-gray-500">{user?.email}</div>
              </div>
            </div>
            <div className="mt-3 px-2">
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="w-full flex items-center justify-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
