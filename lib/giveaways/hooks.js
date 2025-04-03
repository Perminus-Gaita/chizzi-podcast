"use client";
import useSWR from "swr";
import { fetcher } from "../fetch";

export function useEntriesHandler() {
  const { data, error, mutate } = useSWR(
    `/api/giveaways/get_entries_with_details?giveawayId=65accf464e7234c965289a15`,
    fetcher,
    {
      revalidate: false,
    }
  );
  return { data, error, mutate };
}

export function useKRGEntriesHandler() {
  const { data, error, mutate } = useSWR(
    `/api/giveaways/get_entries?giveawayId=65b62701ef540493c797a5c7`,
    fetcher,
    {
      revalidate: false,
    }
  );
  return { data, error, mutate };
}

export function useELIEntriesHandler() {
  const { data, error, mutate } = useSWR(
    `/api/giveaways/get_entries?giveawayId=65c9cce2e196b92bba36d152`,
    fetcher,
    {
      revalidate: false,
    }
  );
  return { data, error, mutate };
}

export function useArrowBwoyEntriesHandler() {
  const { data, error, mutate } = useSWR(
    `/api/giveaways/get_entries?giveawayId=65e06a4d4536497b97f94b4c`,
    fetcher,
    {
      revalidate: false,
    }
  );
  return { data, error, mutate };
}

export function useArrowBwoyVotesHandler(giveawayId) {
  const { data, error, mutate } = useSWR(
    `/api/giveaways/get_entries_with_votes?giveawayId=65e06a4d4536497b97f94b4c`,
    fetcher,
    {
      revalidate: false,
    }
  );
  return { data, error, mutate };
}

export function useVotesHandler(giveawayId) {
  const { data, error, mutate } = useSWR(
    `/api/giveaways/get_entries_with_votes?giveawayId=65accf464e7234c965289a15`,
    fetcher,
    {
      revalidate: false,
    }
  );
  return { data, error, mutate };
}

export function useGiveawayHandler() {
  const { data, error, mutate } = useSWR(
    "/api/giveaways/get_giveaway",
    fetcher,
    {
      revalidate: false,
    }
  );
  return { data, error, mutate };
}

export function useArrowBoyCommentsHandler() {
  const { data, error, mutate } = useSWR(
    `/api/giveaways/get_entries_with_comments?giveawayId=65e06a4d4536497b97f94b4c`,
    fetcher
  );
  return { data, error, mutate };
}

export function useCommentsHandler() {
  const { data, error, mutate } = useSWR(
    `/api/giveaways/get_entries_with_comments?giveawayId=65accf464e7234c965289a15`,
    fetcher
  );
  return { data, error, mutate };
}

export function useEntryCommentsHandler(entryId) {
  const { data, error, mutate } = useSWR(
    `/api/giveaways/get_entry_comments?entryId=${entryId}`,
    fetcher
  );
  return { data, error, mutate };
}

export function useGiveawayDetailsHandler() {
  const { data, error, mutate } = useSWR(
    `/api/giveaways/get_giveaway_details?giveawayId=65accf464e7234c965289a15`,
    fetcher
  );
  return { data, error, mutate };
}

export function useArrowBoyGiveawayDetailsHandler() {
  const { data, error, mutate } = useSWR(
    `/api/giveaways/get_giveaway_details?giveawayId=65e06a4d4536497b97f94b4c`,
    fetcher
  );
  return { data, error, mutate };
}
