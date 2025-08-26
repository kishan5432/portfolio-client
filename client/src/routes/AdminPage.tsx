import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { pageVariants, staggerContainer, itemVariants } from '@/lib/motion/variants';

export default function AdminPage() {
  const adminSections = [
    { name: 'Projects', count: 12, icon: '📁' },
    { name: 'Certificates', count: 8, icon: '🏆' },
    { name: 'Timeline', count: 6, icon: '📅' },
    { name: 'Messages', count: 3, icon: '💬' },
  ];

  return (
    <>
      <Helmet>
        <title>Admin Dashboard | Portfolio</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta
          name="description"
          content="Admin dashboard for managing portfolio content, projects, certificates, and messages."
        />
      </Helmet>

      <motion.main
        className="min-h-screen py-fluid-4xl"
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-fluid-3xl"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <motion.h1
              className="text-fluid-4xl font-bold mb-fluid-md"
              variants={itemVariants}
            >
              Admin Dashboard
            </motion.h1>
            <motion.p
              className="text-fluid-lg text-text/80 max-w-2xl mx-auto"
              variants={itemVariants}
            >
              Manage your portfolio content, view analytics, and update your information.
            </motion.p>
          </motion.div>

          {/* Stats Overview */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-fluid-3xl"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {adminSections.map((section) => (
              <motion.div
                key={section.name}
                className="card border border-border rounded-lg p-6 magnetic"
                variants={itemVariants}
                whileHover={{ scale: 1.02, y: -4 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="text-2xl">{section.icon}</div>
                  <div className="text-fluid-2xl font-bold text-accent">{section.count}</div>
                </div>
                <h3 className="text-fluid-lg font-semibold">{section.name}</h3>
                <button className="mt-4 w-full px-4 py-2 bg-muted text-text rounded-md hover:bg-accent hover:text-accent-foreground transition-colors magnetic">
                  Manage {section.name}
                </button>
              </motion.div>
            ))}
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <motion.h2
              className="text-fluid-2xl font-semibold mb-fluid-lg"
              variants={itemVariants}
            >
              Quick Actions
            </motion.h2>
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={staggerContainer}
            >
              {[
                { title: 'Add New Project', description: 'Create a new project entry', action: 'Add Project' },
                { title: 'Upload Certificate', description: 'Add a new certificate', action: 'Upload' },
                { title: 'Update Timeline', description: 'Add experience or education', action: 'Update' },
                { title: 'View Analytics', description: 'Check site performance', action: 'View Stats' },
                { title: 'Export Data', description: 'Download portfolio data', action: 'Export' },
                { title: 'Settings', description: 'Configure site settings', action: 'Configure' },
              ].map((action) => (
                <motion.div
                  key={action.title}
                  className="card border border-border rounded-lg p-6 magnetic"
                  variants={itemVariants}
                  whileHover={{ scale: 1.01, y: -2 }}
                >
                  <h3 className="text-fluid-lg font-semibold mb-2">{action.title}</h3>
                  <p className="text-text/70 text-fluid-sm mb-4">{action.description}</p>
                  <button className="px-4 py-2 bg-accent text-accent-foreground rounded-md hover:bg-accent/90 transition-colors magnetic">
                    {action.action}
                  </button>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            className="mt-fluid-3xl"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <motion.h2
              className="text-fluid-2xl font-semibold mb-fluid-lg"
              variants={itemVariants}
            >
              Recent Activity
            </motion.h2>
            <motion.div
              className="card border border-border rounded-lg"
              variants={itemVariants}
            >
              <div className="p-6">
                {[
                  { action: 'Updated project "E-commerce Platform"', time: '2 hours ago' },
                  { action: 'Added certificate "AWS Developer"', time: '1 day ago' },
                  { action: 'Received new contact message', time: '2 days ago' },
                  { action: 'Updated timeline entry', time: '3 days ago' },
                ].map((activity, index) => (
                  <div key={index} className="flex items-center justify-between py-3 border-b border-border last:border-b-0">
                    <span className="text-text">{activity.action}</span>
                    <span className="text-text/60 text-sm">{activity.time}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.main>
    </>
  );
}

