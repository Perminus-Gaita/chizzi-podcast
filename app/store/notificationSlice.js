import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  open: false,
  type: "",
  message: "",

  isGlobalNotification: false,
  globalNotifications: [],

  unreadCount: 0,
  hasNewNotifications: false,
  lastReadTimestamp: null,

  urgentMatches: 0,
};

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    createNotification: (state, action) => {
      state.open = action.payload.open;
      state.type = action.payload.type;
      state.message = action.payload.message;
    },

    setGlobalNotification: (state, action) => {
      state.isGlobalNotification = action.payload;
    },

    setUrgentMatches: (state, action) => {
      state.urgentMatches = action.payload;
    },

    // NOT SAME
    setGlobalNotifications: (state, action) => {
      state.globalNotifications = action.payload;
    },

    setUnreadCount: (state, action) => {
      state.unreadCount = action.payload;
    },

    markNotificationsAsRead: (state, action) => {
      state.unreadCount = 0;
      state.hasNewNotifications = false;
      state.lastReadTimestamp = new Date().toISOString();
    },

    addNewNotification: (state, action) => {
      state.globalNotifications = [
        action.payload,
        ...state.globalNotifications,
      ];
      state.unreadCount += 1;
      state.hasNewNotifications = true;
    },
  },
});

export const {
  createNotification,
  setGlobalNotification,
  setGlobalNotifications,

  setUrgentMatches,

  setUnreadCount,
  markNotificationsAsRead,
  addNewNotification,
} = notificationSlice.actions;

export default notificationSlice.reducer;
