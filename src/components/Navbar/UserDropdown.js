import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Mail } from 'lucide-react'; // <-- FIX: Corrected icon names

const UserDropdown = ({ user, handleLogout, isOpen, setIsOpen }) => {
  if (!user) {
    return null; // Don't render anything if there's no user
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
          className="absolute right-0 top-full mt-2 w-56 origin-top-right rounded-md shadow-lg z-50"
        >
          <div className="rounded-md bg-secondary shadow-xs border border-white/10">
            <div className="py-1">
              {/* User Email */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
                <Mail className="h-4 w-4 text-text-secondary" /> {/* <-- FIX: Renamed icon */}
                <span className="block truncate text-sm font-medium text-text-primary">
                  {user.email}
                </span>
              </div>
              
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-500 hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="h-4 w-4" /> {/* <-- FIX: Renamed icon */}
                Logout
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UserDropdown;