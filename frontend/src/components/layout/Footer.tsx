import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          <div className="flex items-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              © {currentYear} StatusLuxe. All rights reserved.
            </p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <div className="flex space-x-6">
              <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                Terms of Service
              </a>
              <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                Contact
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;