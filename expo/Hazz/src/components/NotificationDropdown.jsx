import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = async (notification) => {
    await markAsRead([notification._id]);
    setIsOpen(false);
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  const getTimeAgo = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-500 hover:text-slate-900 transition-colors focus:outline-none"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-lg ring-1 ring-slate-900/5 z-50 overflow-hidden flex flex-col max-h-[32rem] origin-top-right"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-semibold text-slate-900">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  markAllAsRead();
                }}
                className="text-xs font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" /> Clear all
              </button>
            )}
          </div>
          
          <div className="overflow-y-auto flex-1 p-2">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-slate-500 flex flex-col items-center">
                <Bell className="w-8 h-8 text-slate-300 mb-2" />
                <p className="text-sm">No new notifications</p>
              </div>
            ) : (
              <div className="space-y-1 overflow-hidden">
                <AnimatePresence initial={false}>
                {notifications.map((notif) => {
                  const isUnread = !notif.readBy || notif.readBy.length === 0; // Simple logic since the API only returns unread for the current user
                  
                  return (
                    <motion.div 
                      layout
                      key={notif._id}
                      initial={{ opacity: 0, height: 0, scale: 0.9 }}
                      animate={{ opacity: 1, height: 'auto', scale: 1 }}
                      exit={{ opacity: 0, height: 0, scale: 0.9, marginTop: 0, marginBottom: 0, padding: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      onClick={() => handleNotificationClick(notif)}
                      className={`
                        w-full text-left p-3 rounded-lg transition-colors cursor-pointer group flex gap-3 overflow-hidden
                        ${isUnread ? 'bg-emerald-50/50 hover:bg-emerald-50' : 'hover:bg-slate-50'}
                      `}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <p className="text-sm font-semibold text-slate-900 truncate pr-2">
                            {notif.title}
                          </p>
                          <span className="text-[11px] font-medium text-slate-400 whitespace-nowrap shrink-0">
                            {getTimeAgo(notif.createdAt)}
                          </span>
                        </div>
                        <p className="text-[13px] text-slate-600 leading-snug line-clamp-2">
                          {notif.message}
                        </p>
                        {notif.senderName && (
                          <p className="text-[11px] font-medium text-slate-400 mt-2 flex items-center gap-1">
                            From: {notif.senderName}
                          </p>
                        )}
                      </div>
                      
                      <div className="shrink-0 flex flex-col items-center justify-start opacity-0 group-hover:opacity-100 transition-opacity gap-2 pt-1">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead([notif._id]);
                          }}
                          className="text-slate-400 hover:text-slate-700 bg-white hover:bg-slate-100 rounded-full p-1 shadow-sm border border-slate-200 transition-colors"
                          title="Clear notification"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
                </AnimatePresence>
              </div>
            )}
          </div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}
