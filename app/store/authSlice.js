import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  profile: null,
  socials: null,
  showBalance: true,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setProfile: (state, action) => {
      state.profile = action.payload;
    },

    setSocials: (state, action) => {
      state.socials = action.payload;
    },

    setShowBalance: (state, action) => {
      state.showBalance = action.payload;
    },
  },
});

export const { setProfile, setSocials, setShowBalance } = authSlice.actions;

export default authSlice.reducer;
