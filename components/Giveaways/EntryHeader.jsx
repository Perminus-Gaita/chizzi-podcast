"use client";
import { init_page } from "@/app/store/pageSlice";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

const EntryHeader = ({ entryName, backRoute }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(
      init_page({
        page_title: entryName,
        show_back: true,
        show_menu: true,
        route_to: `/giveaways/${backRoute}`,
      })
    );
  }, []);

  return <></>;
};

export default EntryHeader;
