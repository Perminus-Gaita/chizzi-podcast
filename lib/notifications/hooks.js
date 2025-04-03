"use client";
import useSWR from "swr";
import { fetcher } from "../fetch";

export function useNotificationsHandler() {
  const { data, error, mutate, isLoading } = useSWR(
    `/api/notifications`,
    fetcher
  );
  return { data, error, mutate, isLoading };
}
