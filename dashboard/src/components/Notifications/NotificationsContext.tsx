import React, { createContext, useContext, useState, useCallback } from 'react';

const NotificationsContext = createContext({
});

export const useNotifications = () => useContext(NotificationsContext);

export const NotificationsProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [notificationsLastUpdated, setNotificationsLastUpdated] = useState([null]);
    const [notificationsLoading, setNotificationsLoading] = useState(true);

    // When we create or update a notification, we'll highlight it in the notificationsList.
    const [highlightedId, setHighlightedId] = useState(null);

    // State of the create/edit notification modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalInitialData, setModalInitialData] = useState(null);
    const openModal = useCallback((data = null) => {
        setModalInitialData(data);
        setIsModalOpen(true);
    }, []);

    const closeModal = useCallback(() => {
        setIsModalOpen(false);
        setModalInitialData(null); // Reset initial data on close
    }, []);

    // Show and hide the demo banner
    // state of the banner preview
    const [isBannerVisible, setIsBannerVisible] = useState(false);
    const [bannerContent, setBannerContent] = useState('');
    const showBanner = (bannerText) => {
        setBannerContent(bannerText);
        setIsBannerVisible(true);
    };
    const closeBanner = () => {
        setIsBannerVisible(false);
    }

    // Show and hide the notification preview modal
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const [previewModalContent, setPreviewModalContent] = useState('');
    const showPreviewModal = (contents) => {
        setPreviewModalContent(contents);
        setIsPreviewModalOpen(true);
    };

    const closePreviewModal = () => {
        setIsPreviewModalOpen(false);
    };

    // Show and hide the delete confirmation modal
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletedNotificationId, setDeletedNotificationId] = useState(null);
    const [deletedNotificationContents, setDeletedNotificationContents] = useState('');
    const showDeleteModal = (notification) => {
        //console.log('deleting this notif', notification);
        setDeletedNotificationId(notification.id);
        setDeletedNotificationContents(notification.content);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setDeletedNotificationContents('');
        setDeletedNotificationId(null);
        setIsDeleteModalOpen(false);
    };

    const actuallyDeleteNotification = useCallback(async (deletedNotificationId) => {
        try {
            const method = 'DELETE';
            const apiUrl = `${window.location.protocol}//${window.location.hostname}/api/eznotifications/notifications/${deletedNotificationId}`;
            //console.log('in actuallyDeleteNotification, deletedNotificationId:', deletedNotificationId);
            const response = await fetch(apiUrl, {
                method: method
            });
            if (!response.ok) throw new Error('Failed to delete notification with id: ' + deletedNotificationId);

            await fetchNotifications();
            setNotificationsLastUpdated(Date.now()); // update state to trigger the notifications list to rerender
        } catch (error) {
            console.error(`Error deleting notification with id:${deletedNotificationId}`, error);
            return false;
        } finally {
            setNotificationsLoading(false);
        }
    }, []);
    
    const deleteNotification = () => {
        //console.log('Actually deleting notification with id:', deletedNotificationId);
        actuallyDeleteNotification(deletedNotificationId);
        setIsDeleteModalOpen(false);
        setDeletedNotificationContents('');
        setDeletedNotificationId(null);
    };

    const sortNotifications = (data) => {
        return [...data].sort((a, b) => {
            // Group 1: Non-null startDate and not canceled
            if ((a.startDate !== null && a.live) && (b.startDate === null || !b.live)) {
                return -1;
            }
            if ((b.startDate !== null && b.live) && (a.startDate === null || !a.live)) {
                return 1;
            }

            // Group 2: Null startDate and not live
            if (a.startDate === null && a.live && !b.live) {
                return -1;
            }
            if (b.startDate === null && b.live && !a.live) {
                return 1;
            }

            // Group 3: Not Live notifications
            // For items within the same group, sort by content alphabetically
            return a.content.localeCompare(b.content);
        });
    };

    const fetchNotifications = useCallback(async (clerkUserId) => {
        setNotificationsLoading(true); // start loading process
        try {
            const queryParams = new URLSearchParams({ clerkUserId }).toString();
            const apiUrl = `${window.location.protocol}//${window.location.hostname}/api/eznotifications/notifications?${queryParams}`;
            const response = await fetch(apiUrl);
            const data = await response.json();
            if (data && data.length > 0) {
                const sortedNotifications = sortNotifications(data);
                setNotifications(sortedNotifications);
            } else {
                setNotifications([]);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setNotificationsLoading(false);
        }
    }, []);
    
    const highlightNotification = useCallback((id) => {
        setHighlightedId(id);
        // Remove highlight after 5 seconds
        setTimeout(() => setHighlightedId(null), 5000);
    }, []);
    

    const submitNotification = useCallback(async (notificationData) => {
        //console.log('Notification data on form submit:', notificationData);
        const method = (notificationData.editing ? 'PUT' : 'POST' ); // PUT will do an update, POST will create a new posting
        const action = (notificationData.editing ? 'updated' : 'created' );
        const apiUrl = `/api/eznotifications/notifications` + (notificationData.editing ? '/' + notificationData.id : '/new');

        try {
            const response = await fetch(apiUrl, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(notificationData),
            })
            const data = await response.json();
            console.log('Notification was ' + action + ' with:', data);
            highlightNotification(data.id);
            await fetchNotifications();
            setNotificationsLastUpdated(Date.now()); // update state to trigger the notifications list to rerender
        } catch(error) {
            console.error('Error creating notification:', error);
        }
    }, []);
  

  return (
    <NotificationsContext.Provider value={{ 
        notifications,
        fetchNotifications, 
        submitNotification,
        notificationsLastUpdated,
        notificationsLoading,

        highlightedId, 
        highlightNotification,

        isModalOpen,
        modalInitialData,
        openModal,
        closeModal,

        isBannerVisible,
        bannerContent,
        showBanner,
        closeBanner,
        
        isPreviewModalOpen,
        showPreviewModal,
        previewModalContent,
        closePreviewModal,

        isDeleteModalOpen,
        showDeleteModal,
        closeDeleteModal,
        deleteNotification,
        deletedNotificationContents,
        
    }}>
      {children}
    </NotificationsContext.Provider>
  );
};
