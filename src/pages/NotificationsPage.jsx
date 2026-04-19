import React, { useState, useEffect } from 'react';
import { useNotifications } from '../components/context/NotificationContext';

const NotificationsPage = () => {
    const { notifications, currentPage, totalPages, handleMarkAsRead, handleMarkAllAsRead, fetchNotifications, loading } = useNotifications();
    const [filterType, setFilterType] = useState('all');

    useEffect(() => {
        fetchNotifications(currentPage);
    }, []);

    const getNotificationIcon = (type) => {
        const icons = {
            'OP_CREATE': '➕',
            'OP_UPDATE': '✏️',
            'OP_DELETE': '🗑️',
            'ORDER_CREATE': '📦',
            'ORDER_UPDATE': '📝',
            'ORDER_DELETE': '❌',
            'CHK_SUBMIT': '✅',
            'CHK_APPROVE': '👍',
            'CHK_REJECT': '❌',
            'PREREQ_UPLOAD': '📄',
            'USER_CREATE': '👤',
            'WORKFLOW_START': '🚀'
        };
        return icons[type] || '🔔';
    };

    const getNotificationColor = (type) => {
        if (type.includes('REJECT') || type.includes('DELETE')) return '#ff6b6b';
        if (type.includes('APPROVE') || type.includes('SUBMIT')) return '#51cf66';
        if (type.includes('CREATE')) return '#4c6ef5';
        if (type.includes('UPDATE')) return '#ffa94d';
        return '#868e96';
    };

    const filteredNotifications = filterType === 'all'
        ? notifications
        : notifications.filter(n => n.type.startsWith(filterType.toUpperCase()));

    const notificationTypes = [
        { value: 'all', label: 'All Notifications' },
        { value: 'op', label: 'Operations' },
        { value: 'order', label: 'Orders' },
        { value: 'chk', label: 'Checkpoints' },
        { value: 'prereq', label: 'Prerequisites' }
    ];

    return (
        <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1 style={{ margin: 0, fontSize: '28px', color: '#333' }}>📬 Notifications</h1>
                {notifications.some(n => !n.isRead) && (
                    <button
                        onClick={handleMarkAllAsRead}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500'
                        }}
                    >
                        Mark all as read
                    </button>
                )}
            </div>

            {/* Filter Tabs */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '2px solid #e0e0e0', paddingBottom: '10px' }}>
                {notificationTypes.map(type => (
                    <button
                        key={type.value}
                        onClick={() => setFilterType(type.value)}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: filterType === type.value ? '#007bff' : 'transparent',
                            color: filterType === type.value ? 'white' : '#666',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500',
                            transition: 'all 0.2s'
                        }}
                    >
                        {type.label}
                    </button>
                ))}
            </div>

            {/* Notifications List */}
            <div>
                {loading && (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                        <p>Loading notifications...</p>
                    </div>
                )}

                {!loading && filteredNotifications.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                        <p style={{ fontSize: '16px' }}>No notifications found</p>
                        <p style={{ fontSize: '14px', marginTop: '10px' }}>
                            {filterType === 'all'
                                ? 'You are all caught up!'
                                : `No ${filterType} notifications yet`}
                        </p>
                    </div>
                )}

                {!loading && filteredNotifications.map((notification) => (
                    <div
                        key={notification._id}
                        onClick={() => !notification.isRead && handleMarkAsRead(notification._id)}
                        style={{
                            padding: '16px',
                            marginBottom: '12px',
                            borderRadius: '8px',
                            backgroundColor: notification.isRead ? '#f9f9f9' : '#f8f9ff',
                            border: `1px solid ${notification.isRead ? '#e0e0e0' : '#d0d9ff'}`,
                            borderLeft: `4px solid ${getNotificationColor(notification.type)}`,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            gap: '16px',
                            alignItems: 'flex-start'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        {/* Icon */}
                        <div style={{ fontSize: '28px', minWidth: '40px' }}>
                            {getNotificationIcon(notification.type)}
                        </div>

                        {/* Content */}
                        <div style={{ flex: 1 }}>
                            <div style={{
                                fontSize: '15px',
                                fontWeight: notification.isRead ? '500' : '700',
                                color: '#333',
                                marginBottom: '6px'
                            }}>
                                {notification.title}
                            </div>
                            <div style={{
                                fontSize: '14px',
                                color: '#666',
                                lineHeight: '1.5',
                                marginBottom: '8px'
                            }}>
                                {notification.body}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ fontSize: '12px', color: '#999' }}>
                                    {new Date(notification.createdAt).toLocaleString()}
                                </div>
                                <div style={{ fontSize: '12px', color: '#666' }}>
                                    Type: <strong>{notification.type}</strong>
                                </div>
                            </div>
                        </div>

                        {/* Unread Indicator */}
                        {!notification.isRead && (
                            <div style={{
                                width: '12px',
                                height: '12px',
                                borderRadius: '50%',
                                backgroundColor: '#007bff',
                                marginTop: '4px',
                                minWidth: '12px'
                            }} />
                        )}
                    </div>
                ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '8px',
                    marginTop: '30px'
                }}>
                    <button
                        onClick={() => fetchNotifications(currentPage - 1)}
                        disabled={currentPage === 1}
                        style={{
                            padding: '8px 12px',
                            backgroundColor: currentPage === 1 ? '#e0e0e0' : '#007bff',
                            color: currentPage === 1 ? '#999' : 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                        }}
                    >
                        ← Previous
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                            key={page}
                            onClick={() => fetchNotifications(page)}
                            style={{
                                padding: '8px 12px',
                                backgroundColor: currentPage === page ? '#007bff' : '#f0f0f0',
                                color: currentPage === page ? 'white' : '#333',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: currentPage === page ? 'bold' : 'normal'
                            }}
                        >
                            {page}
                        </button>
                    ))}

                    <button
                        onClick={() => fetchNotifications(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        style={{
                            padding: '8px 12px',
                            backgroundColor: currentPage === totalPages ? '#e0e0e0' : '#007bff',
                            color: currentPage === totalPages ? '#999' : 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                        }}
                    >
                        Next →
                    </button>
                </div>
            )}
        </div>
    );
};

export default NotificationsPage;
