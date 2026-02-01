const Notification = require('../models/Notification');
const logger = require('../utils/logger');

/**
 * Create a notification
 * @param {Object} notificationData - Notification data
 */
const createNotification = async (notificationData) => {
  try {
    const notification = await Notification.create(notificationData);
    logger.info(`Notification created for user ${notificationData.userId}`);
    return notification;
  } catch (error) {
    logger.error(`Error creating notification: ${error.message}`);
    throw error;
  }
};

/**
 * Create notification for book borrowed
 */
const notifyBookBorrowed = async (userId, bookId, borrowingId) => {
  return await createNotification({
    userId,
    title: 'Book Borrowed Successfully',
    message: 'You have successfully borrowed a book. Please return it before the due date.',
    type: 'borrow',
    relatedId: borrowingId,
    relatedType: 'Borrowing',
  });
};

/**
 * Create notification for book return
 */
const notifyBookReturned = async (userId, bookId) => {
  return await createNotification({
    userId,
    title: 'Book Returned',
    message: 'Your borrowed book has been successfully returned. Thank you!',
    type: 'return',
    relatedId: bookId,
    relatedType: 'Book',
  });
};

/**
 * Create notification for due date reminder
 */
const notifyDueDateReminder = async (userId, bookTitle, dueDate) => {
  const dueDateStr = new Date(dueDate).toLocaleDateString('en-IN');
  return await createNotification({
    userId,
    title: 'Book Due Date Reminder',
    message: `Your borrowed book "${bookTitle}" is due on ${dueDateStr}. Please return or renew it.`,
    type: 'due_soon',
  });
};

/**
 * Create notification for overdue book
 */
const notifyOverdueBook = async (userId, bookTitle, fine) => {
  return await createNotification({
    userId,
    title: 'Overdue Book Notice',
    message: `Your borrowed book "${bookTitle}" is overdue. Current fine: ₹${fine}. Please return immediately.`,
    type: 'overdue',
  });
};

/**
 * Create notification for new book added
 */
const notifyNewBook = async (userIds, bookTitle) => {
  const notifications = userIds.map((userId) => ({
    userId,
    title: 'New Book Available',
    message: `A new book "${bookTitle}" has been added to the library. Check it out!`,
    type: 'new_book',
  }));

  return await Notification.insertMany(notifications);
};

/**
 * Create announcement notification
 */
const notifyAnnouncement = async (userIds, title, message) => {
  const notifications = userIds.map((userId) => ({
    userId,
    title,
    message,
    type: 'announcement',
  }));

  return await Notification.insertMany(notifications);
};

/**
 * Mark notification as read
 */
const markAsRead = async (notificationId) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true }
    );
    return notification;
  } catch (error) {
    logger.error(`Error marking notification as read: ${error.message}`);
    throw error;
  }
};

/**
 * Mark all user notifications as read
 */
const markAllAsRead = async (userId) => {
  try {
    const result = await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true }
    );
    return result;
  } catch (error) {
    logger.error(`Error marking all notifications as read: ${error.message}`);
    throw error;
  }
};

/**
 * Get user notifications
 */
const getUserNotifications = async (userId, limit = 20, skip = 0) => {
  try {
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .populate('relatedId');

    const unreadCount = await Notification.countDocuments({ userId, isRead: false });

    return {
      notifications,
      unreadCount,
    };
  } catch (error) {
    logger.error(`Error getting user notifications: ${error.message}`);
    throw error;
  }
};

/**
 * Delete old notifications (cleanup job)
 */
const deleteOldNotifications = async (daysOld = 90) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await Notification.deleteMany({
      createdAt: { $lt: cutoffDate },
      isRead: true,
    });

    logger.info(`Deleted ${result.deletedCount} old notifications`);
    return result;
  } catch (error) {
    logger.error(`Error deleting old notifications: ${error.message}`);
    throw error;
  }
};

module.exports = {
  createNotification,
  notifyBookBorrowed,
  notifyBookReturned,
  notifyDueDateReminder,
  notifyOverdueBook,
  notifyNewBook,
  notifyAnnouncement,
  markAsRead,
  markAllAsRead,
  getUserNotifications,
  deleteOldNotifications,
};
