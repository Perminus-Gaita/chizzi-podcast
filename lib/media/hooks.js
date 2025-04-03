"use client";
import useSWR from "swr";
import { fetcher } from "../fetch";

export function useFacebookOnboardingHandler() {
  const { data, error, mutate } = useSWR(`/api/onboarding/facebook`, fetcher, {
    revalidate: false,
  });
  return { data, error, mutate };
}

export function useInstagramOnboardingHandler() {
  const { data, error, mutate } = useSWR(`/api/onboarding/instagram`, fetcher, {
    revalidate: false,
  });
  return { data, error, mutate };
}

export function useYoutubeOnboardingHandler() {
  const { data, error, mutate } = useSWR(`/api/onboarding/youtube`, fetcher, {
    revalidate: false,
  });
  return { data, error, mutate };
}

export function useTiktokOnboardingHandler() {
  const { data, error, mutate } = useSWR(`/api/onboarding/tiktok`, fetcher, {
    revalidate: false,
  });
  return { data, error, mutate };
}

export function useUploadsHandler() {
  const { data, error, mutate, isLoading } = useSWR(
    `/api/media/getuploads`,
    fetcher
  );
  return { data, error, mutate, isLoading };
}

export function useImagesHandler() {
  const { data, error, mutate, isLoading } = useSWR(
    `/api/media/getimages`,
    fetcher
  );
  return { data, error, mutate, isLoading };
}

export function useDeletedUploadsHandler() {
  const { data, error, mutate, isLoading } = useSWR(
    `/api/media/gettrash`,
    fetcher
  );
  return { data, error, mutate, isLoading };
}

export function usePostsHandler() {
  const { data, error, mutate, isLoading } = useSWR(
    `/api/media/getposts`,
    fetcher
  );

  return { data, error, mutate, isLoading };
}
