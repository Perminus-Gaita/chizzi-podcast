import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  activeAnimations: [],
};

const animationSlice = createSlice({
  name: "animations",
  initialState,
  reducers: {
    startAnimation: (state, action) => {
      state.activeAnimations.push(action.payload);
    },
    completeAnimation: (state, action) => {
      state.activeAnimations = state.activeAnimations.filter(
        (anim) => anim.id !== action.payload
      );
    },
  },
});

export const { startAnimation, completeAnimation } = animationSlice.actions;

export default animationSlice.reducer;
