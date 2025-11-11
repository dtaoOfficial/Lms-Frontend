import React from 'react';
import { FaHeart } from 'react-icons/fa'; // Using react-icons for a small icon

/* Make sure you install react-icons if you haven't:
  npm install react-icons
*/

const Footer = () => {
  return (
    <footer className="w-full mt-24 py-8 bg-secondary border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center gap-2">
          <p className="text-sm text-text-secondary">
            LMS-FRONTEND
          </p>
          <a
            href="https://github.com/your-github-username" // <-- TODO: Change this to your GitHub link
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-accent transition-colors"
          >
            Build By DTAO OFFICIAL - Maheswar Reddy {/* <-- TODO: Change this to your name/credit */}
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;