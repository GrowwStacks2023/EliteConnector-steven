
import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-100 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-6">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <span className="text-indigo-600 font-bold text-xl">EC</span>
              </div>
              <span className="text-2xl font-bold text-gray-800 brand-font tracking-tight">
                Elite<span className="text-indigo-500">Connector</span>
              </span>
            </Link>
            <p className="text-gray-500 max-w-sm leading-relaxed mb-6">
              The premium destination for tradespeople to scale their businesses with high-quality, verified leads. Empowering pros through the Elite connector ecosystem.
            </p>
            <div className="flex space-x-4">
              <div className="w-8 h-8 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-center text-gray-400 hover:text-indigo-500 transition-colors cursor-pointer">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
              </div>
              <div className="w-8 h-8 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-center text-gray-400 hover:text-indigo-500 transition-colors cursor-pointer">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </div>
            </div>
          </div>

          {/* Navigation Columns 123 */}
          <div>
            <h3 className="font-bold text-gray-900 mb-6 uppercase text-xs tracking-widest">Platform</h3>
            <ul className="space-y-4">
              <li>
                <Link to="/" className="text-gray-500 hover:text-indigo-600 font-medium transition-colors">Home Overview</Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-gray-500 hover:text-indigo-600 font-medium transition-colors">Lead Marketplace</Link>
              </li>
              <li>
                <Link to="/subscription" className="text-gray-500 hover:text-indigo-600 font-medium transition-colors">Membership Plans</Link>
              </li>
              <li>
                <Link to="/post-lead" className="text-gray-500 hover:text-indigo-600 font-medium transition-colors">Post a New Lead</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-6 uppercase text-xs tracking-widest">Account</h3>
            <ul className="space-y-4">
              <li>
                <Link to="/login" className="text-gray-500 hover:text-indigo-600 font-medium transition-colors">Sign In</Link>
              </li>
              <li>
                <Link to="/register" className="text-gray-500 hover:text-indigo-600 font-medium transition-colors">Join as Pro</Link>
              </li>
              <li>
                <Link to="/profile" className="text-gray-500 hover:text-indigo-600 font-medium transition-colors">Your Profile</Link>
              </li>
              <li>
                <Link to="/my-purchases" className="text-gray-500 hover:text-indigo-600 font-medium transition-colors">My Lead Purchases</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-6 uppercase text-xs tracking-widest">Administration</h3>
            <ul className="space-y-4">
              <li>
                <Link to="/admin" className="text-gray-500 hover:text-indigo-600 font-medium transition-colors">Admin Dashboard</Link>
              </li>
              <li>
                <Link to="/forgot-password" title="Go to reset password page" className="text-gray-500 hover:text-indigo-600 font-medium transition-colors">Password Recovery</Link>
              </li>
              <li>
                <a href="#" className="text-gray-500 hover:text-indigo-600 font-medium transition-colors">Terms of Service</a>
              </li>
              <li>
                <a href="#" className="text-gray-500 hover:text-indigo-600 font-medium transition-colors">Privacy Policy</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-100 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm">
          <p className="mb-4 md:mb-0">&copy; {currentYear} Elite Connector. All rights reserved. Powered by Elite Connector Ecosystem.</p>
          <div className="flex space-x-6">
            <Link to="/dashboard" className="hover:text-indigo-600 transition-colors">Lead Portal</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
