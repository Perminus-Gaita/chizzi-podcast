"use client";
import useSWR from "swr";
import { fetcher } from "../fetch";

export function useTournamentBracketHandler(tournamentId) {
  const { data, error, isLoading, mutate } = useSWR(
    tournamentId ? `/api/tournament/${tournamentId}/bracket` : null,
    fetcher,
    {
      revalidateOnFocus: false, // Don't revalidate on window focus
      revalidateOnReconnect: false, // Don't revalidate on reconnection
      dedupingInterval: 60000, // Cache for 1 minute
    }
  );

  return {
    data,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useUserTournamentsHandler() {
  const { data, error, mutate, isLoading } = useSWR(
    `/api/tournament/get-tournaments`,
    fetcher,
    {
      revalidate: false,
    }
  );
  return { data, error, mutate, isLoading };
}

export const useTournamentComments = ({
  tournamentId,
  sortBy = "latest",
  limit = 20,
  page = 1,
}) => {
  const apiUrl = `/api/tournament/comments/get?tournamentId=${tournamentId}&sort=${sortBy}&page=${page}&limit=${limit}`;

  const { data, error, isLoading, mutate } = useSWR(
    tournamentId ? apiUrl : null,
    fetcher,
    {
      refreshInterval: 10000,
      revalidateOnFocus: true,
    }
  );

  return {
    data: data?.comments || [],
    pagination: data?.pagination || {},
    isLoading,
    isError: error,
    mutate,
  };
};

export function useProductsHandler(tournamentId) {
  const { data, error, mutate, isLoading } = useSWR(
    `/api/tournament/get-products?tournamentId=${tournamentId}`,
    fetcher,
    {
      revalidate: false,
    }
  );
  return { data, error, mutate, isLoading };
}

export function useTournamentsHandler() {
  const { data, error, mutate, isLoading } = useSWR(
    `/api/tournament/getall`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000,
    }
  );
  return { data, error, mutate, isLoading };
}

export function useShowcaseTournamentsHandler() {
  const { data, error, mutate, isLoading } = useSWR(
    `/api/tournament/getshowcase`,
    fetcher,
    {
      onError: (err) => {
        if (typeof window !== "undefined" && !navigator.onLine) {
          return new Error("Connection lost");
        }
        if (err.status === 404) {
          return new Error("No tournaments available");
        }
        return err;
      },
      errorRetryCount: 3,
      errorRetryInterval: 5000,
    }
  );

  const isOffline = typeof window !== "undefined" ? !navigator.onLine : false;

  // Validate data structure from API
  const validData =
    data?.tournaments && Array.isArray(data.tournaments)
      ? data.tournaments
      : null;
  const hasError = error && !isLoading && !validData;

  return {
    data: validData,
    error: hasError ? error : null,
    mutate,
    isLoading,
    isOffline,
  };
}
