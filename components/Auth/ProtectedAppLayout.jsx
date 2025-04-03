import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useUserHandler } from "@/lib/user";
import PageLoader from "@/components/Loader/PageLoader";
// import { createNotification } from "@/app/store/notificationSlice";
// import { useDispatch, useSelector } from "react-redux";

export default function ProtectedAppLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  const {
    data: userData,
    error: userError,
    isLoading,
    // shouldRedirect,
    // checkSession,
    // isAuthenticated,
  } = useUserHandler();

  useEffect(() => {
    if (!isLoading && (userError || !userData || userData?.uuid === null)) {
      router.replace("/login");
    }
  }, [isLoading, userData, userError, router]);

  // // Unified authentication check effect
  // useEffect(() => {
  //   if (!isLoading && (!isAuthenticated || shouldRedirect)) {
  //     // Store current path for redirect after login
  //     if (pathname !== "/login") {
  //       sessionStorage.setItem("redirectPath", pathname);
  //     }

  //     // Show error message if session expired
  //     if (shouldRedirect) {
  //       dispatch(
  //         createNotification({
  //           open: true,
  //           type: "info",
  //           message: "Your session has expired. Please login again.",
  //         })
  //       );
  //     }

  //     router.replace("/login");
  //   }
  // }, [isLoading, isAuthenticated, shouldRedirect, router, pathname]);

  // // Check session on route changes
  // useEffect(() => {
  //   if (!isLoading) {
  //     checkSession();
  //   }
  // }, [pathname, checkSession, isLoading]);

  if (isLoading) {
    return <PageLoader />;
  }

  // if (!isAuthenticated) {
  //   return <PageLoader pageName="Redirecting" />;
  // }

  if (userError || !userData || userData?.uuid === null) {
    return null;
  }

  return children;
}
