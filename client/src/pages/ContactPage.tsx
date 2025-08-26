import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  LinkIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import {
  LinkedInLogoIcon,
  GitHubLogoIcon,
  TwitterLogoIcon
} from '@radix-ui/react-icons';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { Container } from '@/components/shared/Container';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

// Contact form schema
const contactSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters'),
  email: z
    .string()
    .email('Please enter a valid email address')
    .max(255, 'Email cannot exceed 255 characters'),
  subject: z
    .string()
    .min(5, 'Subject must be at least 5 characters')
    .max(200, 'Subject cannot exceed 200 characters')
    .optional(),
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(2000, 'Message cannot exceed 2000 characters'),
});

type ContactFormData = z.infer<typeof contactSchema>;

interface ContactInfo {
  icon: React.ComponentType<any>;
  label: string;
  value: string;
  href?: string;
  description?: string;
}

interface SocialLink {
  name: string;
  icon: React.ComponentType<any>;
  href: string;
  color: string;
}

const contactInfo: ContactInfo[] = [
  {
    icon: EnvelopeIcon,
    label: 'Email',
    value: 'kishansingh88046@gmail.com',
    href: 'mailto:kishansingh88046@gmail.com',
    description: 'Best way to reach me'
  },
  {
    icon: PhoneIcon,
    label: 'Phone',
    value: '7858804975',
    href: 'tel:+917858804975',
    description: 'Available during business hours'
  },
  {
    icon: MapPinIcon,
    label: 'Location',
    value: 'Bhopal, MP',
    description: 'India (IST Time Zone)'
  },
  {
    icon: ClockIcon,
    label: 'Response Time',
    value: 'Within 24 hours',
    description: 'Usually much faster!'
  }
];

const socialLinks: SocialLink[] = [
  {
    name: 'LinkedIn',
    icon: LinkedInLogoIcon,
    href: 'https://www.linkedin.com/in/kishan-kumar-568b92374/',
    color: 'hover:text-blue-600'
  },
  {
    name: 'GitHub',
    icon: GitHubLogoIcon,
    href: 'https://github.com/kishan5432',
    color: 'hover:text-gray-900 dark:hover:text-gray-100'
  },
  {
    name: 'Twitter',
    icon: TwitterLogoIcon,
    href: 'https://x.com/kishan54325',
    color: 'hover:text-blue-400'
  }
];

// Toast notification component
function Toast({
  type,
  message,
  isVisible,
  onClose
}: {
  type: 'success' | 'error';
  message: string;
  isVisible: boolean;
  onClose: () => void;
}) {
  const shouldReduceMotion = useReducedMotion();

  if (!isVisible) return null;

  return (
    <motion.div
      className={cn(
        'fixed top-4 right-4 z-50 max-w-md p-4 rounded-lg shadow-lg border',
        type === 'success'
          ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200'
          : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200'
      )}
      initial={shouldReduceMotion ? false : { opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-3">
        {type === 'success' ? (
          <CheckCircleIcon className="h-5 w-5 flex-shrink-0" />
        ) : (
          <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0" />
        )}
        <p className="text-sm font-medium leading-relaxed">{message}</p>
        <button
          onClick={onClose}
          className="ml-auto text-current hover:text-current/80"
        >
          <span className="sr-only">Close</span>
          ×
        </button>
      </div>
    </motion.div>
  );
}

export function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const shouldReduceMotion = useReducedMotion();

  // Test server connectivity on component mount
  useEffect(() => {
    const testServerConnection = async () => {
      try {
        console.log('🧪 Testing server connection...');
        const response = await fetch('http://localhost:5000/api/v1/contact', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        console.log('🧪 Server test response status:', response.status);
        console.log('🧪 Server test response ok:', response.ok);
      } catch (error) {
        console.error('🧪 Server connection test failed:', error);
      }
    };

    testServerConnection();
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    mode: 'onChange'
  });

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  // Simplified form submission without validation
  const onSubmit = async (data: ContactFormData) => {
    console.log('=== CONTACT FORM SUBMISSION START ===');
    console.log('Form data:', data);
    console.log('Form data type:', typeof data);
    console.log('Form data keys:', Object.keys(data));
    console.log('Form data values:', Object.values(data));

    setIsSubmitting(true);

    try {
      console.log('🧪 Submitting contact form directly to server...');

      // Use direct fetch instead of React Query to eliminate potential issues
      const response = await fetch('http://localhost:5000/api/v1/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          message: data.message,
          ...(data.subject && { subject: data.subject })
        }),
      });

      console.log('🧪 Server response status:', response.status);
      console.log('🧪 Server response ok:', response.ok);
      console.log('🧪 Server response headers:', Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        const result = await response.json();
        console.log('🧪 Server response data:', result);
        console.log('✅ Contact message submitted successfully!');

        // Reset form and show success message
        reset();
        showToast('success', 'Thank you for your message! I\'ll get back to you soon.');
      } else {
        // Handle error response
        const errorText = await response.text();
        console.error('❌ Server error response:', errorText);

        let errorMessage = 'Failed to send message. Please try again.';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (parseError) {
          errorMessage = `Server error: ${response.status} - ${errorText}`;
        }

        showToast('error', errorMessage);
      }
    } catch (error) {
      console.error('❌ Contact form submission error:', error);
      console.error('Error type:', typeof error);
      console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');

      const errorMessage = error instanceof Error ? error.message : 'Network error - please check your connection and try again.';
      showToast('error', errorMessage);
    } finally {
      setIsSubmitting(false);
      console.log('=== CONTACT FORM SUBMISSION END ===');
    }
  };

  const handleMailtoFallback = () => {
    const subject = encodeURIComponent('Hello from your portfolio website');
    const body = encodeURIComponent('Hi Kishan,\n\nI saw your portfolio and would like to get in touch.\n\nBest regards,');
    window.location.href = `mailto:kishan.kumar@example.com?subject=${subject}&body=${body}`;
  };

  return (
    <div className="min-h-screen py-8">
      <Container>
        <Breadcrumbs />

        <SectionHeader
          title="Get In Touch"
          subtitle="Contact"
          description="Have a project in mind? Let's discuss how we can work together to bring your ideas to life."
        />

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-card p-8 rounded-2xl shadow-lg border border-border/50">
              <h2 className="text-xl font-semibold text-foreground mb-6">Send a Message</h2>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Name Field */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('name')}
                    type="text"
                    id="name"
                    className={cn(
                      'w-full px-4 py-3 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors',
                      errors.name ? 'border-red-500' : 'border-border'
                    )}
                    placeholder="Your full name"
                  />
                  {errors.name && (
                    <p className="mt-2 text-xs text-red-500 font-medium">{errors.name.message}</p>
                  )}
                </div>

                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('email')}
                    type="email"
                    id="email"
                    className={cn(
                      'w-full px-4 py-3 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors',
                      errors.email ? 'border-red-500' : 'border-border'
                    )}
                    placeholder="your.email@example.com"
                  />
                  {errors.email && (
                    <p className="mt-2 text-xs text-red-500 font-medium">{errors.email.message}</p>
                  )}
                </div>

                {/* Subject Field */}
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-2">
                    Subject
                  </label>
                  <input
                    {...register('subject')}
                    type="text"
                    id="subject"
                    className={cn(
                      'w-full px-4 py-3 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors',
                      errors.subject ? 'border-red-500' : 'border-border'
                    )}
                    placeholder="What's this about?"
                  />
                  {errors.subject && (
                    <p className="mt-2 text-xs text-red-500 font-medium">{errors.subject.message}</p>
                  )}
                </div>

                {/* Message Field */}
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    {...register('message')}
                    id="message"
                    rows={6}
                    className={cn(
                      'w-full px-4 py-3 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors resize-none',
                      errors.message ? 'border-red-500' : 'border-border'
                    )}
                    placeholder="Tell me about your project, questions, or just say hello!"
                  />
                  {errors.message && (
                    <p className="mt-2 text-xs text-red-500 font-medium">{errors.message.message}</p>
                  )}
                </div>

                {/* Submit Button */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 group"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span className="text-sm font-medium">Sending...</span>
                      </>
                    ) : (
                      <>
                        <PaperAirplaneIcon className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                        <span className="text-sm font-medium">Send Message</span>
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleMailtoFallback}
                    className="group"
                  >
                    <EnvelopeIcon className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium">Email Directly</span>
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-8"
          >
            {/* Contact Info Cards */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground mb-6">Contact Information</h2>

              {contactInfo.map((info, index) => (
                <motion.div
                  key={info.label}
                  className="bg-card p-6 rounded-xl shadow-lg border border-border/50 hover:shadow-xl transition-shadow duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                  whileHover={shouldReduceMotion ? {} : { y: -2 }}
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-full">
                      <info.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-medium text-foreground mb-1">{info.label}</h3>
                      {info.href ? (
                        <a
                          href={info.href}
                          className="text-base text-primary hover:text-primary/80 transition-colors font-medium"
                        >
                          {info.value}
                        </a>
                      ) : (
                        <p className="text-base text-foreground font-medium">{info.value}</p>
                      )}
                      {info.description && (
                        <p className="text-sm text-muted-foreground mt-1">{info.description}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Social Links */}
            <div className="bg-card p-6 rounded-xl shadow-lg border border-border/50">
              <h3 className="text-base font-medium text-foreground mb-4 flex items-center">
                <LinkIcon className="h-5 w-5 mr-2" />
                Connect With Me
              </h3>
              <div className="flex gap-4">
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      'p-3 bg-muted rounded-full text-muted-foreground transition-colors',
                      social.color
                    )}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                    whileHover={shouldReduceMotion ? {} : { scale: 1.1 }}
                    whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
                  >
                    <social.icon className="h-5 w-5" />
                    <span className="sr-only">{social.name}</span>
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Availability */}
            <motion.div
              className="bg-gradient-to-br from-primary/10 to-purple-500/10 p-6 rounded-xl border border-primary/20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <h3 className="text-base font-medium text-foreground mb-2">Current Availability</h3>
              <p className="text-sm text-muted-foreground mb-3">
                I'm currently available for freelance projects and full-time opportunities.
              </p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                  Available for new projects
                </span>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* FAQ Section */}
        <motion.section
          className="mt-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
        >
          <h2 className="text-xl font-semibold text-foreground text-center mb-8">
            Frequently Asked Questions
          </h2>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              {
                question: "What's your typical response time?",
                answer: "I usually respond to emails within 24 hours, often much faster during business hours."
              },
              {
                question: "Do you work with international clients?",
                answer: "Absolutely! I work with clients worldwide and am comfortable with remote collaboration."
              },
              {
                question: "What type of projects do you take on?",
                answer: "I specialize in web applications, from small business websites to complex full-stack applications."
              },
              {
                question: "Do you offer ongoing support?",
                answer: "Yes, I provide maintenance and support packages for projects I've developed."
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                className="bg-card p-6 rounded-xl shadow-lg border border-border/50"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 1.2 + index * 0.1 }}
              >
                <h3 className="text-base font-medium text-foreground mb-2">{faq.question}</h3>
                <p className="text-sm text-muted-foreground">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </Container>

      {/* Toast Notification */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          isVisible={!!toast}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
