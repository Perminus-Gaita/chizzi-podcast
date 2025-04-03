"use client";
import { useRouter } from "next/navigation";

import { useState, useCallback, useMemo } from "react";
import useSWR from "swr";
import { fetcher } from "../fetch";

export function useUserHandler() {
  const { data, error, mutate, isLoading } = useSWR(
    `/api/user/session`,
    fetcher
  );
  return { data, error, mutate, isLoading };
}

// export function useUserHandler() {
//   const [shouldRedirect, setShouldRedirect] = useState(false);
//   const router = useRouter(); // Add router here

//   const { data, error, mutate, isLoading } = useSWR(
//     `/api/user/session`,
//     async (url) => {
//       try {
//         const response = await fetcher(url);
//         return response;
//       } catch (error) {
//         // Handle 401/403 errors explicitly
//         if (error.status === 401 || error.status === 403) {
//           setShouldRedirect(true);
//           return null;
//         }
//         throw error;
//       }
//     },
//     {
//       refreshInterval: 5 * 60 * 1000,
//       revalidateOnFocus: false,
//       onError: (err) => {
//         if (err.message === "Session expired" || err.status === 401) {
//           setShouldRedirect(true);
//         }
//       },
//     }
//   );

//   const checkSession = useCallback(async () => {
//     try {
//       const result = await mutate();
//       if (!result || !result.uuid) {
//         setShouldRedirect(true);
//       }
//     } catch (error) {
//       setShouldRedirect(true);
//     }
//   }, [mutate]);

//   return {
//     data,
//     error,
//     mutate,
//     isLoading,
//     shouldRedirect,
//     checkSession,
//     isAuthenticated: Boolean(data?.uuid),
//   };
// }

export function useWorkspacesHandler() {
  const { data, error, mutate, isLoading } = useSWR(
    `/api/user/getworkspaces`,
    fetcher,
    {
      revalidate: false,
    }
  );

  return { data, error, mutate, isLoading };
}

export function useWalletHandler() {
  const { data, error, mutate, isLoading } = useSWR(
    `/api/user/wallet`,
    fetcher,
    {
      revalidate: false,
    }
  );

  return { data, error, mutate, isLoading };
}

export function useTransactionsHandler() {
  const { data, error, mutate, isLoading } = useSWR(
    `/api/user/transactions`,
    fetcher,
    {
      revalidate: false,
    }
  );

  return { data, error, mutate, isLoading };
}

export function useGameHistory(username) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filter, setFilter] = useState("all"); // all, tournament, casual
  const [sort, setSort] = useState("recent"); // recent, rating-change, duration

  // Construct the API URL with query parameters
  const apiUrl = username
    ? `/api/user/profile/get-game-history?username=${username}&page=${page}&limit=${limit}&filter=${filter}&sort=${sort}`
    : null;

  const { data, error, isLoading, mutate } = useSWR(apiUrl, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 10000, // 10 seconds
  });

  // Handle pagination
  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
  }, []);

  // Handle limit change
  const handleLimitChange = useCallback((newLimit) => {
    setLimit(newLimit);
    setPage(1); // Reset to first page when changing limit
  }, []);

  // Handle filter change
  const handleFilterChange = useCallback((newFilter) => {
    setFilter(newFilter);
    setPage(1); // Reset to first page when changing filter
  }, []);

  // Handle sort change
  const handleSortChange = useCallback((newSort) => {
    setSort(newSort);
    setPage(1); // Reset to first page when changing sort
  }, []);

  // Force refresh data
  const refreshData = useCallback(() => {
    mutate();
  }, [mutate]);

  // Helper function to get total pages
  const getTotalPages = useCallback(() => {
    if (!data?.pagination?.total) return 0;
    return Math.ceil(data.pagination.total / limit);
  }, [data?.pagination?.total, limit]);

  // Transform data for easier consumption
  const transformedData = {
    games: data?.games || [],
    summary: data?.summary || {
      totalGames: 0,
      wins: 0,
      totalRatingChange: 0,
    },
    pagination: {
      currentPage: page,
      totalPages: getTotalPages(),
      totalItems: data?.pagination?.total || 0,
      itemsPerPage: limit,
      hasNextPage: page < getTotalPages(),
      hasPreviousPage: page > 1,
    },
  };

  // Calculate loading states
  const isInitialLoading = isLoading && !data;
  const isRefreshing = isLoading && data;

  return {
    // Data
    data: transformedData,
    error,

    // Loading states
    isLoading: isInitialLoading,
    isRefreshing,

    // Pagination controls
    page,
    limit,
    handlePageChange,
    handleLimitChange,

    // Filter and sort controls
    filter,
    sort,
    handleFilterChange,
    handleSortChange,

    // Actions
    refreshData,
    mutate,

    // Current states
    currentFilter: filter,
    currentSort: sort,
  };
}

export function useFriends(username) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filter, setFilter] = useState("all"); // all, frequent, recent

  // Construct API URL with query parameters
  const apiUrl = `/api/user/profile/get-friends?username=${username}&page=${page}&limit=${limit}&filter=${filter}`;

  const { data, error, isLoading, mutate } = useSWR(apiUrl, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 30000, // 30 seconds
  });

  // Pagination handlers
  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
  }, []);

  const handleLimitChange = useCallback((newLimit) => {
    setLimit(newLimit);
    setPage(1); // Reset to first page
  }, []);

  // Filter handlers
  const handleFilterChange = useCallback((newFilter) => {
    setFilter(newFilter);
    setPage(1); // Reset to first page
  }, []);

  // Compute friend statistics
  const statistics = useMemo(() => {
    if (!data?.friends) return null;

    return {
      totalFriends: data.pagination.total,
      activeFriends: data.friends.filter(
        (f) => f.lastPlayed > Date.now() - 30 * 24 * 60 * 60 * 1000
      ).length,
      averageGamesPerFriend:
        data.friends.reduce((acc, f) => acc + f.gamesPlayed, 0) /
        data.friends.length,
      tournamentParticipation: data.friends.filter((f) => f.tournamentGames > 0)
        .length,
    };
  }, [data]);

  // Transform friend data for easier consumption
  const transformedData = {
    friends: data?.friends || [],
    statistics,
    pagination: {
      currentPage: page,
      totalPages: data?.pagination?.pages || 0,
      totalItems: data?.pagination?.total || 0,
      itemsPerPage: limit,
      hasNextPage: page < (data?.pagination?.pages || 0),
      hasPreviousPage: page > 1,
    },
  };

  // Loading states
  const isInitialLoading = isLoading && !data;
  const isRefreshing = isLoading && data;

  return {
    // Data
    data: transformedData,
    error,

    // Loading states
    isLoading: isInitialLoading,
    isRefreshing,

    // Pagination controls
    page,
    limit,
    handlePageChange,
    handleLimitChange,

    // Filter controls
    filter,
    handleFilterChange,

    // Actions
    refreshData: mutate,

    // Current states
    currentFilter: filter,
  };
}

export function useAvatarProfiles() {
  const { data, error, mutate, isLoading } = useSWR(
    "/api/cards/kadistrategy/get",
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
    }
  );

  return {
    avatarPlayer: data?.avatarPlayer,
    error,
    mutate,
    isLoading,
  };
}
