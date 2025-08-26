import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  EnvelopeIcon,
  MapPinIcon,
  PhoneIcon,
  ArrowUpIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import {
  GitHubLogoIcon,
  LinkedInLogoIcon,
  TwitterLogoIcon
} from '@radix-ui/react-icons';
import { Magnetic } from '@/components/ui/Magnetic';
import { staggerContainer, itemVariants } from '@/lib/motion/variants';

const navigationLinks = [
  { name: 'Home', href: '/' },
  { name: 'Projects', href: '/projects' },
  { name: 'Certificates', href: '/certificates' },
  { name: 'Timeline', href: '/timeline' },
  { name: 'Contact', href: '/contact' },
];

const workLinks = [
  { name: 'Case Studies', href: '/projects' },
  { name: 'Web Development', href: '/projects' },
  { name: 'UI/UX Design', href: '/projects' },
  { name: 'Consulting', href: '/contact' },
];

const contactInfo = [
  {
    icon: EnvelopeIcon,
    label: 'Email',
    value: 'kishansingh88046@gmail.com',
    href: 'mailto:kishansingh88046@gmail.com'
  },
  {
    icon: MapPinIcon,
    label: 'Location',
    value: 'Bhopal, MP',
    href: null
  },
  {
    icon: PhoneIcon,
    label: 'Phone',
    value: '7858804975',
    href: 'tel:+917858804975'
  },
];

const socialLinks = [
  {
    name: 'GitHub',
    href: 'https://github.com/kishan5432',
    icon: GitHubLogoIcon,
    color: 'hover:text-gray-900 dark:hover:text-white',
  },
  {
    name: 'LinkedIn',
    href: 'https://www.linkedin.com/in/kishan-kumar-568b92374/',
    icon: LinkedInLogoIcon,
    color: 'hover:text-blue-600',
  },
  {
    name: 'Twitter',
    href: 'https://x.com/kishan54325',
    icon: TwitterLogoIcon,
    color: 'hover:text-blue-400',
  },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <motion.footer
      id="footer"
      className="relative bg-gradient-to-br from-background via-background to-muted/20 border-t border-border/50 overflow-hidden"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-secondary/10" />
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.1),transparent_50%)]" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_80%,rgba(255,119,198,0.1),transparent_50%)]" />
      </div>

      <div className="relative container mx-auto px-4 py-16">
        {/* Main Footer Content */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          {/* Brand & Description */}
          <motion.div className="lg:col-span-1 space-y-6" variants={itemVariants}>
            <div>
              <Magnetic strength={0.15}>
                <Link to="/" className="inline-flex items-center group">
                  <div className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                    Portfolio
                  </div>
                </Link>
              </Magnetic>
              <div className="mt-2 w-12 h-0.5 bg-gradient-to-r from-primary to-secondary rounded-full" />
            </div>

            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              Full-stack developer crafting exceptional digital experiences with modern technologies and creative solutions.
            </p>

            {/* Social Links */}
            <div className="flex items-center space-x-3">
              {socialLinks.map((social) => (
                <Magnetic key={social.name} strength={0.2}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`group relative p-3 rounded-xl bg-muted/50 hover:bg-accent/10 border border-border/50 hover:border-accent/30 transition-all duration-300 ${social.color}`}
                    aria-label={social.name}
                  >
                    <social.icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/20 to-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </a>
                </Magnetic>
              ))}
            </div>
          </motion.div>

          {/* Navigation Links */}
          <motion.div className="space-y-6" variants={itemVariants}>
            <h3 className="text-base font-semibold text-foreground flex items-center">
              <span className="w-1 h-6 bg-gradient-to-b from-primary to-secondary rounded-full mr-3" />
              Navigation
            </h3>
            <ul className="space-y-3">
              {navigationLinks.map((link) => (
                <li key={link.name}>
                  <Magnetic strength={0.1}>
                    <Link
                      to={link.href}
                      className="text-muted-foreground hover:text-accent text-sm transition-colors duration-200 flex items-center group"
                    >
                      <span className="w-0 h-px bg-accent transition-all duration-300 group-hover:w-4 group-hover:mr-2" />
                      {link.name}
                    </Link>
                  </Magnetic>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Services */}
          <motion.div className="space-y-6" variants={itemVariants}>
            <h3 className="text-base font-semibold text-foreground flex items-center">
              <span className="w-1 h-6 bg-gradient-to-b from-secondary to-accent rounded-full mr-3" />
              Services
            </h3>
            <ul className="space-y-3">
              {workLinks.map((link) => (
                <li key={link.name}>
                  <Magnetic strength={0.1}>
                    <Link
                      to={link.href}
                      className="text-muted-foreground hover:text-accent text-sm transition-colors duration-200 flex items-center group"
                    >
                      <span className="w-0 h-px bg-accent transition-all duration-300 group-hover:w-4 group-hover:mr-2" />
                      {link.name}
                    </Link>
                  </Magnetic>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div className="space-y-6" variants={itemVariants}>
            <h3 className="text-base font-semibold text-foreground flex items-center">
              <span className="w-1 h-6 bg-gradient-to-b from-accent to-primary rounded-full mr-3" />
              Get In Touch
            </h3>
            <ul className="space-y-4">
              {contactInfo.map((info) => (
                <li key={info.label} className="flex items-start space-x-3">
                  <div className="p-2 rounded-lg bg-muted/50 border border-border/50">
                    <info.icon className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                      {info.label}
                    </p>
                    {info.href ? (
                      <Magnetic strength={0.1}>
                        <a
                          href={info.href}
                          className="text-sm text-foreground hover:text-accent transition-colors duration-200 font-medium"
                        >
                          {info.value}
                        </a>
                      </Magnetic>
                    ) : (
                      <p className="text-sm text-foreground font-medium">{info.value}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>

        {/* Divider */}
        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          </div>
        </div>

        {/* Bottom Section */}
        <motion.div
          className="flex flex-col lg:flex-row justify-between items-center space-y-6 lg:space-y-0"
          variants={itemVariants}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          {/* Copyright */}
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <span>© {currentYear} Kishan Kumar.</span>
              <span className="hidden sm:inline">•</span>
              <span className="flex items-center space-x-1">
                <span>Made with</span>
                <HeartIcon className="w-4 h-4 text-red-500 animate-pulse" />
                <span>in Bhopal, MP</span>
              </span>
            </div>
          </div>

          {/* Legal Links & Back to Top */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-4 text-sm">
              <Magnetic strength={0.1}>
                <Link to="#" className="text-muted-foreground hover:text-accent transition-colors duration-200">
                  Privacy
                </Link>
              </Magnetic>
              <Magnetic strength={0.1}>
                <Link to="#" className="text-muted-foreground hover:text-accent transition-colors duration-200">
                  Terms
                </Link>
              </Magnetic>
            </div>

            <div className="w-px h-4 bg-border" />

            <Magnetic strength={0.2}>
              <button
                onClick={scrollToTop}
                className="group p-2 rounded-lg bg-muted/50 hover:bg-accent/10 border border-border/50 hover:border-accent/30 transition-all duration-300"
                aria-label="Back to top"
              >
                <ArrowUpIcon className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors duration-200" />
              </button>
            </Magnetic>
          </div>
        </motion.div>

        {/* Tech Stack */}
        <motion.div
          className="mt-12 pt-8 border-t border-border/30 text-center"
          variants={itemVariants}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          <p className="text-xs text-muted-foreground/70">
            Built with{' '}
            <span className="font-medium text-accent">React</span>,{' '}
            <span className="font-medium text-accent">TypeScript</span>,{' '}
            <span className="font-medium text-accent">Tailwind CSS</span>, and{' '}
            <span className="font-medium text-accent">Framer Motion</span>
          </p>
        </motion.div>
      </div>
    </motion.footer>
  );
}

