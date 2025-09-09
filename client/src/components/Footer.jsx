import React from 'react';
import { motion } from 'framer-motion';
import { Linkedin, Twitter, Instagram, Github, Mail } from 'lucide-react';
import Stars from '../assets/stars.svg';
import moment from 'moment-timezone';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

const Footer = () => {
  const currentYear = moment().tz('Asia/Kolkata').year(); // Current year in IST

  return (
    <footer className="relative bg-gradient-to-br from-blue-200 via-purple-100 to-pink-200 text-gray-800 py-6 sm:py-8 mt-12">
      <img
        src={Stars}
        alt="Stars"
        className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none animate-pulse"
        loading="lazy"
      />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 text-center sm:text-left"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Navigation Links */}
          <motion.div variants={itemVariants}>
            <h3 className="text-lg sm:text-xl font-semibold text-blue-700 mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm sm:text-base">
              <li><a href="/dashboard" className="text-blue-600 hover:text-blue-500 transition">Dashboard</a></li>
              <li><a href="/matches" className="text-blue-600 hover:text-blue-500 transition">Matches</a></li>
              <li><a href="/chat" className="text-blue-600 hover:text-blue-500 transition">Chat</a></li>
              {/* <li><a href="/delete" className="text-blue-600 hover:text-blue-500 transition">Delete Account</a></li> */}
            </ul>
          </motion.div>

          {/* Social Media */}
          <motion.div variants={itemVariants}>
            <h3 className="text-lg sm:text-xl font-semibold text-blue-700 mb-3">Follow Us</h3>
            <div className="flex justify-center sm:justify-start space-x-4">
              <a href="https://www.linkedin.com/in/aman-singh-3b23741ba/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-500 transition">
                <Linkedin size={20} />
              </a>
              {/* <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-500 transition">
                <Twitter size={20} />
              </a> */}
              <a href="https://www.instagram.com/aman._.singh_11/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-500 transition">
                <Instagram size={20} />
              </a>
              <a href="https://github.com/Asteinwords" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-500 transition">
                <Github size={20} />
              </a>
              <a href="mailto:aman11202004@gmail.com" className="text-blue-600 hover:text-blue-500 transition">
                <Mail size={20} />
              </a>
            </div>
          </motion.div>

          {/* Contact Info */}
          <motion.div variants={itemVariants}>
            <h3 className="text-lg sm:text-xl font-semibold text-blue-700 mb-3">Contact Us</h3>
            <p className="text-sm sm:text-base text-gray-600">Email: aman11202004@gmail.com</p>
            <p className="text-sm sm:text-base text-gray-600">Phone: +91-7041532536</p>
            <p className="text-sm sm:text-base text-gray-600">Address: No-88904 44th Cross</p>
          </motion.div>
        </motion.div>

        {/* Copyright */}
        <motion.div
          variants={itemVariants}
          className="mt-6 text-center text-sm sm:text-base text-gray-600 border-t border-blue-300/50 pt-4"
        >
          <p>
            &copy; {currentYear} SkillSync. All rights reserved. Last updated: {moment().tz('Asia/Kolkata').format('hh:mm A z, MMMM DD, YYYY')}.
          </p>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;