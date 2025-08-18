import { useState } from 'react';
import { Link, useLocation } from 'react-router';
import { BellIcon, HousePlus, MenuIcon, ShieldUser, XIcon } from 'lucide-react';
import useAuthUser from '../hooks/useAuthUser';
import ThemeSelector from './ThemeSelector';
import useLogout from '../hooks/useLogout';

const MobileNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { authUser } = useAuthUser();
  const location = useLocation();
  const { logoutMutation } = useLogout();

  const navItems = [
    { path: '/', label: 'Home', icon: HousePlus },
    { path: '/friends', label: 'Friends', icon: ShieldUser },
    { path: '/notification', label: 'Notifications', icon: BellIcon },
  ];

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMenu}
        className="lg:hidden btn btn-ghost btn-circle"
        aria-label="Toggle mobile menu"
      >
        {isOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeMenu}
          />
          
          {/* Menu Panel */}
          <div className="absolute right-0 top-0 h-full w-80 bg-base-200 shadow-xl border-l border-base-300">
            <div className="p-4 border-b border-base-300">
              <div className="flex items-center gap-3">
                <div className="avatar">
                  <div className="w-12 rounded-full">
                    <img src={authUser?.profilePic} alt="User Avatar" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{authUser?.fullName}</p>
                  <p className="text-sm opacity-70">Online</p>
                </div>
                <button
                  onClick={closeMenu}
                  className="btn btn-ghost btn-circle btn-sm"
                >
                  <XIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Navigation Items */}
            <nav className="p-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={closeMenu}
                    className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
                      isActive ? 'btn-active' : ''
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Theme Selector and Logout */}
            <div className="p-4 border-t border-base-300 mt-auto">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium">Theme</span>
                <ThemeSelector isMobile={true} />
              </div>
              <button
                onClick={() => {
                  logoutMutation();
                  closeMenu();
                }}
                className="btn btn-outline w-full"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileNav;
