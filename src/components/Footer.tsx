import React from 'react';
import { Github, Twitter, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-emerald-600 border-t  border-emerald-100 mt-20">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <img src="/morphLogo.svg" alt="Morph Academy Logo" className="h-8 w-8" />
            <span className="font-semibold text-xl ">Morph Academy</span>
          </div>
          <p className="text-gray-600 text-white">Learn to build like an engineer with hands-on tutorials and practical projects.</p>
          <div className="flex space-x-4">
            <Github className="h-5 w-5 text-gray-600 hover:text-gray-900 cursor-pointer" />
            <Twitter className="h-5 w-5 text-gray-600 hover:text-gray-900 cursor-pointer" />
            {/* <Discord className="h-5 w-5 text-gray-600 hover:text-gray-900 cursor-pointer" /> */}
          </div>
        </div>


        <div className=''>
          <h3 className="font-semibold mb-4">Resources</h3>
          <ul className="space-y-2 text-white">
            <li>Documentation</li>
            <li>Community Forum</li>
            <li>Developer Blog</li>
            <li>Career Support</li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-4">Company</h3>
          <ul className="space-y-2 text-white">
            <li>About Us</li>
            <li>Contact</li>
            <li>Terms of Service</li>
            <li>Privacy Policy</li>
          </ul>
        </div>

        <div className="col-span-1 md:col-span-4 pt-8 mt-8 border-t border-white">
          <p className="text-center text-white">© {new Date().getFullYear()} Morph Academy. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;