"use client";
import useSWR from "swr";
import { useState, useMemo } from "react";
import { fetcher } from "../fetch";

export function useArenaChatHandler() {
  const { data, error, mutate, isLoading } = useSWR(
    `/api/cards/getarenachat`,
    fetcher
    // {
    //   refreshInterval: 1000, // Poll every second
    //   revalidateOnFocus: true,
    //   dedupingInterval: 0, // Disable deduping
    // }
  );
  return { data, error, mutate, isLoading };
}

export function useCardsRoomsHandler(page = 1, limit = 12) {
  const { data, error, mutate, isLoading } = useSWR(
    `/api/cards/get-rooms?page=${page}&limit=${limit}`,
    fetcher,
    {
      revalidateOnFocus: false,
      keepPreviousData: true,
      dedupingInterval: 5000,
      onError: (err) => {
        if (typeof window !== "undefined" && !navigator.onLine) {
          return new Error("Connection lost");
        }
        return err.status === 404 ? new Error("No card games available") : err;
      },
    }
  );

  return {
    data: data?.rooms || null,
    pagination: data?.pagination,
    error,
    mutate,
    isLoading: isLoading && !data,
    isOffline: typeof window !== "undefined" ? !navigator.onLine : false,
  };
}

export function useShowcaseCardsRoomsHandler(page = 1, limit = 12) {
  const { data, error, mutate, isLoading } = useSWR(
    `/api/cards/get-rooms?page=${page}&limit=${limit}`,
    fetcher,
    {
      onError: (err) => {
        if (typeof window !== "undefined" && !navigator.onLine) {
          return new Error("Connection lost");
        }
        if (err.status === 404) {
          return new Error("No card games available");
        }
        return err;
      },
      errorRetryCount: 3,
      errorRetryInterval: 5000,
    }
  );

  const isOffline = typeof window !== "undefined" ? !navigator.onLine : false;

  // const validData = data && Array.isArray(data) ? data.slice(0, 10) : null;
  const validData =
    data?.rooms && Array.isArray(data.rooms) ? data.rooms : null;
  const hasError = error && !isLoading && !validData;

  return {
    data: validData,
    error: hasError ? error : null,
    mutate,
    isLoading,
    isOffline,
  };
}

export function useCardsLeaderboards(category = "competitive", type = "all") {
  const { data, error, mutate, isLoading } = useSWR(
    `/api/cards/leaderboards?category=${category}&type=${type}`,
    fetcher,
    {
      revalidateOnFocus: false, // Prevent refetch on tab focus
      keepPreviousData: true, // Keep showing previous data while loading new data
    }
  );

  // Transform the data to match our UI structure
  const transformedData = useMemo(() => {
    if (!data) return null;

    return {
      competitive: {
        global: data?.global || [],
        seasonal: data?.seasonal || [],
        tournament: data?.tournament || [],
        earnings: data?.earnings || [],
      },
      skills: {
        sequences: data?.sequences || [],
        specialCards: data?.specialCards || [],
        efficiency: data?.efficiency || [],
      },
    };
  }, [data]);

  return {
    data: transformedData,
    error,
    mutate,
    isLoading,
    isError: error,
  };
}

export function useCardsStats() {
  const { data, error, mutate, isLoading } = useSWR(
    `/api/cards/stats`,
    fetcher
  );
  return { data, error, mutate, isLoading };
}

export function usePlayerMatchesHandler() {
  const [activeMatchesPage, setActiveMatchesPage] = useState(1);
  const [scheduledMatchesPage, setScheduledMatchesPage] = useState(1);

  const { data, error, mutate, isLoading } = useSWR(
    `/api/cards/get-matches`,
    fetcher,
    {
      refreshInterval: 30000,
      revalidateOnFocus: true,
    }
  );

  // Handlers for loading more matches
  const loadMoreActive = async () => {
    try {
      const nextPage = activeMatchesPage + 1;
      const moreMatches = await fetcher(
        `/api/cards/get-matches?category=active&page=${nextPage}`
      );

      // Validate response
      if (!moreMatches?.matches?.active) {
        throw new Error("Invalid response format");
      }

      // Update data
      mutate(
        (currentData) => ({
          ...currentData,
          matches: {
            ...currentData.matches,
            active: [
              ...(currentData.matches.active || []),
              ...moreMatches.matches.active,
            ],
          },
          // Preserve pagination info
          pagination: moreMatches.pagination,
        }),
        { revalidate: false }
      );

      setActiveMatchesPage(nextPage);
    } catch (error) {
      console.error("Failed to load more active matches:", error);
      // You might want to add error handling/notification here
    }
  };

  const loadMoreScheduled = async () => {
    try {
      const nextPage = scheduledMatchesPage + 1;
      const moreMatches = await fetcher(
        `/api/cards/get-matches?category=scheduled&page=${nextPage}`
      );

      // Validate response
      if (!moreMatches?.matches?.scheduled) {
        throw new Error("Invalid response format");
      }

      // Update data
      mutate(
        (currentData) => ({
          ...currentData,
          matches: {
            ...currentData.matches,
            scheduled: [
              ...(currentData.matches.scheduled || []),
              ...moreMatches.matches.scheduled,
            ],
          },
          // Preserve pagination info
          pagination: moreMatches.pagination,
        }),
        { revalidate: false }
      );

      setScheduledMatchesPage(nextPage);
    } catch (error) {
      console.error("Failed to load more scheduled matches:", error);
      // You might want to add error handling/notification here
    }
  };

  return {
    matches: data?.matches,
    counts: data?.counts,
    error,
    mutate,
    isLoading,
    loadMoreActive,
    loadMoreScheduled,
    hasMoreActive: data?.counts?.active > data?.matches?.active?.length,
    hasMoreScheduled:
      data?.counts?.scheduled > data?.matches?.scheduled?.length,
  };
}
