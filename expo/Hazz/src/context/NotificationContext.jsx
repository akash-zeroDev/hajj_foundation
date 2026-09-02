import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth, useUser } from '@clerk/react';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();

  const fetchNotifications = useCallback(async () => {
    if (!isSignedIn) return;
    try {
      const token = await getToken();
      const res = await fetch('http://localhost:5000/api/notifications/unread', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, [isSignedIn, getToken]);

  // Polling every 30 seconds
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchNotifications();
      const intervalId = setInterval(fetchNotifications, 30000);
      return () => clearInterval(intervalId);
    }
  }, [isLoaded, isSignedIn, fetchNotifications]);

  const markAsRead = async (notificationIds) => {
    try {
      const token = await getToken();
      await fetch('http://localhost:5000/api/notifications/mark-read', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ notificationIds })
      });
      // Optimistically update
      setNotifications(prev => prev.filter(n => !notificationIds.includes(n._id)));
      setUnreadCount(prev => Math.max(0, prev - notificationIds.length));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    const ids = notifications.map(n => n._id);
    if (ids.length > 0) {
      await markAsRead(ids);
    }
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead, fetchNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};
