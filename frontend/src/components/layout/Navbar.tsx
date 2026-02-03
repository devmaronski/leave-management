import { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

export function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

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
      links.push({ href: '/users', label: 'Users' });
    }
    
    return links;
  }, [user]);

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex space-x-8">
            <div className="flex items-center">
              <span className="text-xl font-bold text-primary">Leave Management</span>
            </div>
            <div className="flex space-x-4 items-center">
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
          <div className="flex items-center space-x-4">
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
        </div>
      </div>
    </nav>
  );
}
