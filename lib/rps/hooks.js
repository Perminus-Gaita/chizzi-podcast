"use client";
import useSWR from "swr";
import { fetcher } from "../fetch";

export function useRoomsHandler() {
  const { data, error, mutate } = useSWR(`/api/rps/get_rooms`, fetcher);
  return { data, error, mutate };
}

export function useRoomHandler(roomId) {
  const { data, error, mutate } = useSWR(
    `/api/rps/get_room?roomId=${roomId}`,
    fetcher
  );
  return { data, error, mutate };
}
