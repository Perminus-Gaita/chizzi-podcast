import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./authSlice";
import notificationReducer from "./notificationSlice";
import pageReducer from "./pageSlice";
import animationReducer from "./animationSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    notification: notificationReducer,
    page: pageReducer,
    animation: animationReducer,
  },
  devTools: process.env.NODE_ENV !== "production",
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      immutableCheck: false,
      serializableCheck: false,
    }),
});
