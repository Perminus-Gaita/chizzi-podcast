"use client";
import useSWR from "swr";
import { fetcher } from "../fetch";

export function useWorkspaceHandler() {
  const { data, error, mutate, isLoading } = useSWR(`/api/workspace`, fetcher, {
    revalidate: false,
  });

  return { data, error, mutate, isLoading };
}
