import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  EnvelopeIcon,
  EyeIcon,
  EyeSlashIcon,
  TrashIcon,
  CalendarIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useContactMessages, useMarkMessageAsRead, useDeleteContactMessage } from '@/lib/queries';
import { DataTable, Column } from '@/components/admin/DataTable';
import { ContactMessageData } from '@/lib/schemas';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export function ContactMessagesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<ContactMessageData | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'read' | 'unread'>('all');
  const shouldReduceMotion = useReducedMotion();

  const { data, isLoading, error } = useContactMessages();
  const markAsReadMutation = useMarkMessageAsRead();
  const deleteMessageMutation = useDeleteContactMessage();

  const messages = data?.data?.messages || [];
  const unreadCount = data?.data?.unreadCount || 0;

  const filteredMessages = messages.filter((message) => {
    const matchesSearch = !searchQuery ||
      message.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.message.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'read' && message.read) ||
      (filterStatus === 'unread' && !message.read);

    return matchesSearch && matchesStatus;
  });

  const columns: Column<ContactMessageData>[] = [
    {
      key: 'read',
      label: 'Status',
      width: '16',
      render: (read: boolean) => (
        <div className="flex items-center justify-center">
          {read ? (
            <div className="w-2 h-2 bg-green-500 rounded-full" />
          ) : (
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          )}
        </div>
      ),
    },
    {
      key: 'name',
      label: 'Contact',
      sortable: true,
      render: (name: string, message: ContactMessageData) => (
        <div>
          <div className="font-medium text-foreground">{name}</div>
          <div className="text-sm text-muted-foreground">{message.email}</div>
        </div>
      ),
    },
    {
      key: 'message',
      label: 'Message',
      render: (message: string) => (
        <p className="text-sm text-muted-foreground line-clamp-2 max-w-md">
          {message}
        </p>
      ),
    },
    {
      key: 'createdAt',
      label: 'Received',
      sortable: true,
      render: (date: string) => (
        <div className="text-sm">
          <div className="text-foreground">
            {new Date(date).toLocaleDateString()}
          </div>
          <div className="text-muted-foreground">
            {new Date(date).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </div>
      ),
    },
  ];

  const handleMarkAsRead = async (message: ContactMessageData) => {
    if (!message.read) {
      try {
        await markAsReadMutation.mutateAsync(message._id!);
      } catch (error) {
        console.error('Failed to mark message as read:', error);
      }
    }
  };

  const handleDelete = async (message: ContactMessageData) => {
    if (window.confirm(`Are you sure you want to delete the message from ${message.name}?`)) {
      try {
        await deleteMessageMutation.mutateAsync(message._id!);
      } catch (error) {
        console.error('Failed to delete message:', error);
      }
    }
  };

  const handleView = (message: ContactMessageData) => {
    setSelectedMessage(message);
    handleMarkAsRead(message);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Contact Messages</h1>
            <p className="text-muted-foreground">
              Manage messages from your portfolio contact form
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <span className="text-muted-foreground">Unread:</span>
              <span className="ml-2 px-2 py-1 bg-primary text-primary-foreground rounded-full text-xs font-medium">
                {unreadCount}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        className="flex flex-wrap gap-2"
        initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <button
          onClick={() => setFilterStatus('all')}
          className={cn(
            'px-3 py-1 rounded-full text-sm font-medium transition-colors',
            filterStatus === 'all'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          )}
        >
          All Messages ({messages.length})
        </button>
        <button
          onClick={() => setFilterStatus('unread')}
          className={cn(
            'px-3 py-1 rounded-full text-sm font-medium transition-colors',
            filterStatus === 'unread'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          )}
        >
          Unread ({unreadCount})
        </button>
        <button
          onClick={() => setFilterStatus('read')}
          className={cn(
            'px-3 py-1 rounded-full text-sm font-medium transition-colors',
            filterStatus === 'read'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          )}
        >
          Read ({messages.length - unreadCount})
        </button>
      </motion.div>

      {/* Data Table */}
      <DataTable
        data={filteredMessages}
        columns={columns}
        loading={isLoading}
        error={error?.message}
        searchPlaceholder="Search messages..."
        onSearch={setSearchQuery}
        onView={handleView}
        onDelete={handleDelete}
        emptyMessage="No messages found"
        keyExtractor={(message) => message._id!}
        searchableFields={['name', 'email', 'message']}
        actions={true}
      />

      {/* Message Detail Modal */}
      {selectedMessage && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSelectedMessage(null)}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

          <motion.div
            className="relative bg-card border border-border rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            initial={shouldReduceMotion ? false : { scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  Message from {selectedMessage.name}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {selectedMessage.email}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleMarkAsRead(selectedMessage)}
                  disabled={selectedMessage.read}
                >
                  {selectedMessage.read ? (
                    <EyeIcon className="h-4 w-4" />
                  ) : (
                    <EyeSlashIcon className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedMessage(null)}
                >
                  <XMarkIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarIcon className="h-4 w-4" />
                Received on {new Date(selectedMessage.createdAt!).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>

              <div className="prose prose-sm max-w-none">
                <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                  {selectedMessage.message}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between p-6 border-t border-border">
              <Button
                variant="outline"
                onClick={() => {
                  const subject = encodeURIComponent(`Re: Your message from portfolio website`);
                  const body = encodeURIComponent(`Hi ${selectedMessage.name},\n\nThank you for reaching out through my portfolio website.\n\n`);
                  window.location.href = `mailto:${selectedMessage.email}?subject=${subject}&body=${body}`;
                }}
              >
                <EnvelopeIcon className="h-4 w-4 mr-2" />
                Reply via Email
              </Button>

              <Button
                variant="destructive"
                onClick={() => {
                  handleDelete(selectedMessage);
                  setSelectedMessage(null);
                }}
              >
                <TrashIcon className="h-4 w-4 mr-2" />
                Delete Message
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
