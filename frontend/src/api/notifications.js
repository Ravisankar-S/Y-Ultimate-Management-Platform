import api from "./axiosInstance";

export const fetchNotifications = async () => {
    const res = await api.get("/notifications/");
    return res.data;
};

export const markNotificationRead = async (notificationId) => {
    const res = await api.patch(`/notifications/${notificationId}/read`);
    return res.data;
};

export const deleteNotification = async (notificationId) => {
    await api.delete(`/notifications/${notificationId}`);
};

export const clearNotifications = async () => {
    await api.delete(`/notifications`);
};
