import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  page_state: {
    page_title: "",
    show_back: false,
    show_menu: false,
    route_to: "",
  },

  // tab state
  active_tab: 0,

  openLeftSidebar: false,

  currentTutorialModule: null,
};

export const pageSlice = createSlice({
  name: "page",
  initialState,
  reducers: {
    // page reducers
    init_page: (state, action) => {
      state.page_state = action.payload;
    },

    // tab state
    add_active_tab: (state, action) => {
      state.active_tab = action.payload;
    },

    setLeftSidebar: (state, action) => {
      state.openLeftSidebar = action.payload;
    },

    setCurrentTutorialModule: (state, action) => {
      state.currentTutorialModule = action.payload;
    },
  },
});

export const {
  init_page,
  add_active_tab,
  setLeftSidebar,
  setCurrentTutorialModule,
} = pageSlice.actions;

export default pageSlice.reducer;
