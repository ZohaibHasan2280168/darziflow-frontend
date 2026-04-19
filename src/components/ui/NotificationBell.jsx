import React, { useState } from 'react';
import { useNotifications } from '../context/NotificationContext';

const NotificationBell = () => {
    const {
        notifications,
        unreadCount,
        loading,
        handleMarkAsRead,
        handleMarkAllAsRead,
        fetchNotifications
    } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);

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

    const handleNotificationClick = (notification) => {
        if (!notification.isRead) {
            handleMarkAsRead(notification._id);
        }
        
        // Navigate based on notification data
        if (notification.data?.screen) {
            window.location.href = notification.data.screen;
        }
    };

    return (
        <div style={{ position: 'relative', display: 'inline-block' }}>
            {/* Bell Icon */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    cursor: 'pointer',
                    padding: '8px 12px',
                    fontSize: '20px',
                    transition: 'transform 0.2s'
                }}
                title="Notifications"
            >
                🔔
                {unreadCount > 0 && (
                    <span
                        style={{
                            position: 'absolute',
                            top: '-5px',
                            right: '-5px',
                            backgroundColor: '#ff6b6b',
                            color: 'white',
                            borderRadius: '50%',
                            padding: '4px 8px',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            minWidth: '20px',
                            textAlign: 'center'
                        }}
                    >
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </div>

            {/* Notification Panel */}
            {isOpen && (
                <>
                    {/* Overlay */}
                    <div
                        onClick={() => setIsOpen(false)}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            zIndex: 999
                        }}
                    />

                    {/* Notification Dropdown */}
                    <div
                        style={{
                            position: 'absolute',
                            right: 0,
                            top: '45px',
                            backgroundColor: 'white',
                            width: '380px',
                            borderRadius: '12px',
                            zIndex: 1001,
                            boxShadow: '0px 10px 40px rgba(0,0,0,0.15)',
                            border: '1px solid #e0e0e0',
                            maxHeight: '500px',
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                    >
                        {/* Header */}
                        <div
                            style={{
                                padding: '15px 20px',
                                borderBottom: '1px solid #e0e0e0',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}
                        >
                            <h3 style={{ margin: 0, fontSize: '16px', color: '#333' }}>
                                Notifications
                                {unreadCount > 0 && (
                                    <span style={{
                                        marginLeft: '10px',
                                        fontSize: '12px',
                                        color: '#666'
                                    }}>
                                        ({unreadCount} unread)
                                    </span>
                                )}
                            </h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllAsRead}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#007bff',
                                        cursor: 'pointer',
                                        fontSize: '12px',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    Mark all as read
                                </button>
                            )}
                        </div>

                        {/* Notification List */}
                        <div
                            style={{
                                overflowY: 'auto',
                                flex: 1,
                                maxHeight: '400px'
                            }}
                        >
                            {loading && (
                                <p style={{
                                    padding: '20px',
                                    textAlign: 'center',
                                    color: '#999'
                                }}>
                                    Loading...
                                </p>
                            )}

                            {!loading && notifications.length === 0 && (
                                <p style={{
                                    padding: '30px 20px',
                                    textAlign: 'center',
                                    color: '#999'
                                }}>
                                    No notifications yet
                                </p>
                            )}

                            {!loading && notifications.map((notification) => (
                                <div
                                    key={notification._id}
                                    onClick={() => handleNotificationClick(notification)}
                                    style={{
                                        padding: '15px 20px',
                                        borderBottom: '1px solid #f0f0f0',
                                        cursor: 'pointer',
                                        backgroundColor: notification.isRead ? 'transparent' : '#f8f9ff',
                                        transition: 'background-color 0.2s',
                                        borderLeft: notification.isRead
                                            ? 'none'
                                            : `4px solid ${getNotificationColor(notification.type)}`
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = '#f0f0f0';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = notification.isRead
                                            ? 'transparent'
                                            : '#f8f9ff';
                                    }}
                                >
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <div style={{ fontSize: '20px' }}>
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div
                                                style={{
                                                    fontSize: '14px',
                                                    fontWeight: notification.isRead ? '400' : '600',
                                                    color: '#333',
                                                    marginBottom: '4px'
                                                }}
                                            >
                                                {notification.title}
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: '13px',
                                                    color: '#666',
                                                    lineHeight: '1.4',
                                                    marginBottom: '6px'
                                                }}
                                            >
                                                {notification.body}
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: '11px',
                                                    color: '#999'
                                                }}
                                            >
                                                {new Date(notification.createdAt).toLocaleString()}
                                            </div>
                                        </div>
                                        {!notification.isRead && (
                                            <div
                                                style={{
                                                    width: '8px',
                                                    height: '8px',
                                                    borderRadius: '50%',
                                                    backgroundColor: '#007bff',
                                                    marginTop: '6px'
                                                }}
                                            />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Footer */}
                        {notifications.length > 0 && (
                            <div
                                style={{
                                    padding: '12px 20px',
                                    borderTop: '1px solid #e0e0e0',
                                    textAlign: 'center'
                                }}
                            >
                                <button
                                    onClick={() => {
                                        setIsOpen(false);
                                        window.location.href = '/notifications';
                                    }}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#007bff',
                                        cursor: 'pointer',
                                        fontSize: '13px',
                                        fontWeight: '500'
                                    }}
                                >
                                    View all notifications →
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default NotificationBell;