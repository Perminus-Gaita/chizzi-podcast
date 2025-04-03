"use client";
import Link from "next/link";
import axios from "axios";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { useDispatch, useSelector } from "react-redux";

// from redux store
import { setProfile, setShowBalance } from "../../app/store/authSlice";

// material components
import { Avatar, Divider, Chip, useTheme, useMediaQuery } from "@mui/material";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";

import {
  AccountBalanceWalletOutlined,
  Receipt,
  Home,
  DarkMode,
  LightMode,
  Logout,
} from "@mui/icons-material";

// stylesheet
import { fetcher } from "../../lib/fetch";
import Image from "next/image";

import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

import NotificationsMenu from "./NotificationsMenu";
import LogoutButton from "./LogoutButton";

import { useThemeSwitcher } from "../../lib/theme/useThemeSwitcher";
import { ArrowLeft, NotificationIcon } from "../icons";
import { useWalletHandler } from "@/lib/user";
import MiniLoader from "../Loader/MiniLoader";

const GiveawaysHeader = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));

  const [mode, setMode] = useThemeSwitcher();

  const [isOpenNotifications, setIsOpenNotifications] = useState(false);
  const notificationsRef = useRef(null);

  const [isOpenMenu, setIsOpenMenu] = useState(false);
  const menuRef = useRef(null);

  const page_title = useSelector((state) => state.page.page_state.page_title);
  const showBack = useSelector((state) => state.page.page_state.show_back);
  const routeTo = useSelector((state) => state.page.page_state.route_to);

  const userProfile = useSelector((state) => state.auth.profile);
  const showBalance = useSelector((state) => state.auth.showBalance);

  const openLeftSidebar = useSelector((state) => state.page.openLeftSidebar);

  const userPages = [
    "/dashboard",
    "/analytics",
    "/notifications",
    "/create",
    "/calendar",
    "/library",
    "/posts",
    "/connect",
  ];

  // redux page states

  const isGlobalNotification = useSelector(
    (state) => state.notification.isGlobalNotification
  );

  const [loading, setLoading] = useState(false);

  const [expanded, setExpanded] = useState(false);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  // notifications menu state
  const [anchorNotifications, setAnchorNotifications] = useState(null);
  const openNotifications = Boolean(anchorNotifications);

  const [open_bar, set_open_bar] = useState(false);

  const [anchorProduct, setAnchorProduct] = useState(null);
  const [anchorProductMobile, setAnchorProductMobile] = useState(null);

  const [openMobile, setOpenMobile] = useState(false);

  const {
    data: walletData,
    error: walletError,
    mutate: walletMutate,
  } = useWalletHandler();

  const handle_click = (e) => {
    console.log("Hello there");
    set_open_bar(!open_bar);
    setAnchorEl(e.currentTarget);
  };

  const handleShowBalance = () => {
    console.log("handing,...");
    if (showBalance) {
      dispatch(setShowBalance(false));
    } else {
      dispatch(setShowBalance(true));
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
    set_open_bar(!open_bar);
  };

  const sign_out = useCallback(async () => {
    try {
      await fetcher("/api/auth/log-out", {
        method: "DELETE",
      });
      dispatch(setProfile(null));

      document.cookie =
        "sessionCookie=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

      handleClose();
      router.push("/");
    } catch (error) {
      // console.log("Error signing out");
      // console.log(error.message);
      return;
    }
  }, []);

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const response = await axios.patch("/api/onboarding/account", {
        accountType: "professional",
      });

      if (response.status === 200) {
        router.push("/onboarding/connect");
      }

      setLoading(false);

      return;
    } catch (error) {
      setLoading(false);
      console.error("Error upgrading account:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target)
      ) {
        setIsOpenNotifications(false);
      }
    };

    window.addEventListener("click", handleClickOutside);

    return;

    () => window.removeEventListener("click", handleClickOutside);
  }, [isOpenNotifications]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpenMenu(false);
      }
    };

    window.addEventListener("click", handleClickOutside);

    return;

    () => window.removeEventListener("click", handleClickOutside);
  }, [isOpenMenu]);

  return (
    <div
      className="flex items-center justify-between px-4 bg-customPrimary"
      style={{ height: "7vh" }}
    >
      <section className="flex items-center gap-4">
        {showBack ? (
          <Link href={routeTo}>
            <ArrowLeft
              className="fill-quaternary"
              style={{ width: "30px", height: "30px" }}
            />
          </Link>
        ) : (
          <Link href={"/"}>
            <Image src="/wufwuflogo1.png" width={40} height={40} />
          </Link>
        )}
      </section>

      <section className="">
        <h4 className="text-white text-sm md:text-lg font-semibold text-center">
          {page_title.length > 6 && isSmallScreen
            ? page_title.slice(0, 6) + "..."
            : page_title}
        </h4>
      </section>

      <section>
        {userProfile ? (
          <div className="flex items-center xs:gap-1 md:gap-4">
            <div ref={notificationsRef}>
              <button
                className="rounded-xl p-2"
                style={{
                  position: "relative",
                  boxShadow: "rgba(51, 51, 51, 0.35) 0px 5px 15px",
                }}
                onClick={() => setIsOpenNotifications(!isOpenNotifications)}
              >
                {isGlobalNotification && (
                  <div
                    style={{
                      position: "absolute",
                      right: "8px",
                      top: "4px",
                      width: "9px",
                      height: "9px",
                      borderRadius: "50%",
                      backgroundColor: "rgba(120, 214, 75, 6)",
                      border: "1px solid rgba(120, 214, 75, .9)",
                      boxShadow: "0 0 15px rgba(120, 214, 75, 1)",
                    }}
                  />
                )}

                <NotificationIcon style={{ width: "20px", height: "20px" }} />
              </button>

              {isOpenNotifications && (
                <div
                  className="w-11/12 md:w-3/12 rounded-xl p-1 z-50 
                      border border-[#9f9f9f] bg-light/80 dark:bg-dark/80 backdrop-blur-sm"
                  style={{
                    position: "absolute",
                    top: "5%",
                    right: "5%",
                    height: "600px",

                    "&::-webkit-scrollbar": {
                      width: "8px",
                    },
                    "&::-webkit-scrollbar-track": {
                      backgroundColor: "#131633",
                    },
                    "&::-webkit-scrollbar-thumb": {
                      backgroundColor: "#19205f",
                      borderRadius: "4px",
                    },
                    "&::-webkit-scrollbar-thumb:hover": {
                      backgroundColor: "#555",
                    },
                  }}
                >
                  <NotificationsMenu />
                </div>
              )}
            </div>

            <div ref={menuRef}>
              <div className="flex items-center">
                {walletData && !walletError && (
                  <Chip
                    sx={{ marginRight: "-1rem", paddingRight: ".5rem" }}
                    label={
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        <h4 className="text-white text-xs md:text-sm">
                          KES
                          <span
                            style={{
                              color: "#78d64b",
                              fontWeight: 600,
                              paddingLeft: "5px",
                            }}
                          >
                            {showBalance
                              ? walletData.balances.KES.toFixed(2) / 100
                              : "***"}
                          </span>
                        </h4>
                      </div>
                    }
                  />
                )}
                <Avatar
                  alt="/default_profile.png"
                  src={userProfile?.profilePicture}
                  onClick={() => setIsOpenMenu(!isOpenMenu)}
                  sx={{
                    cursor: "pointer",
                  }}
                />
              </div>

              {isOpenMenu && (
                <div className="w-80 absolute top-16 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden z-50">
                  {userProfile && (
                    <ul className="flex flex-col gap-4">
                      <div className="p-4 bg-gray-100 dark:bg-gray-700">
                        <div className="flex items-center space-x-3">
                          <Avatar
                            src={
                              userProfile?.profilePicture ||
                              "/default_profile.png"
                            }
                            alt="Profile"
                            width={40}
                            height={40}
                          />
                          <div>
                            <h3 className="font-semibold text-gray-800 dark:text-white">
                              {userProfile?.name}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {userProfile?.accountType}
                            </p>
                          </div>

                          {walletData && !walletError && (
                            <Chip
                              label={
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "column",
                                  }}
                                >
                                  <h4 className="text-white">
                                    KES
                                    <span
                                      style={{
                                        color: "#78d64b",
                                        fontWeight: 600,
                                        paddingLeft: "5px",
                                        fontSize: ".9rem",
                                      }}
                                    >
                                      {walletData.balances.KES.toFixed(2) / 100}
                                    </span>
                                  </h4>
                                </div>
                              }
                            />
                          )}

                          {showBalance ? (
                            <button
                              onClick={() => handleShowBalance()}
                              style={{ position: "relative", zIndex: 99 }}
                            >
                              <VisibilityOutlinedIcon
                                sx={{ color: "#00b8ff" }}
                              />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleShowBalance()}
                              style={{ position: "relative", zIndex: 99 }}
                            >
                              <VisibilityOffOutlinedIcon
                                sx={{ color: "#00b8ff" }}
                              />
                            </button>
                          )}
                        </div>
                      </div>

                      <nav className="p-2">
                        <Link
                          href="/wallet"
                          className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors duration-150"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <AccountBalanceWalletOutlined className="text-blue-500" />
                              <span className="text-gray-700 dark:text-gray-200">
                                Wallet
                              </span>
                            </div>
                            <div>
                              {walletError ? (
                                <span className="text-red-500 text-sm">
                                  Error
                                </span>
                              ) : walletData ? (
                                <div className="text-right">
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    KES{" "}
                                    {walletData.balances.KES.toFixed(2) / 100}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    USD {walletData.balances.USD.toFixed(2)}
                                  </p>
                                </div>
                              ) : (
                                <Image
                                  src="/buttonloader.svg"
                                  width={20}
                                  height={20}
                                  alt="Loading"
                                />
                              )}
                            </div>
                          </div>
                        </Link>

                        <Link
                          href="/transactions"
                          className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors duration-150"
                        >
                          <div className="flex items-center space-x-3">
                            <Receipt className="text-green-500" />
                            <span className="text-gray-700 dark:text-gray-200">
                              Transactions
                            </span>
                          </div>
                        </Link>
                      </nav>
                    </ul>
                  )}

                  <div className="p-4 border-t border-gray-200 dark:border-gray-600">
                    <button
                      onClick={sign_out}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-150"
                    >
                      <Logout />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex gap-4">
            {!userProfile && isSmallScreen && (
              <Link
                href="/login"
                style={{
                  textDecoration: "none",
                }}
              >
                <button
                  className="text-white px-3 py-1 rounded-lg font-semibold text-xs md:text-md"
                  style={{
                    background: "rgba(25, 32, 95, 0.6)",
                    boxShadow: "0 4px 30px rgba(0, 184, 255, 0.09)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(25, 32, 95, 1)",
                  }}
                >
                  {isSmallScreen ? " Log In / Sign Up" : "Log In"}
                </button>
              </Link>
            )}

            {!isSmallScreen && (
              <div className="flex gap-2">
                <Link
                  href="/login"
                  style={{
                    textDecoration: "none",
                  }}
                >
                  <button
                    className="text-white px-3 py-1 rounded-lg font-semibold text-md"
                    style={{
                      background: "rgba(25, 32, 95, 0.6)",
                      boxShadow: "0 4px 30px rgba(0, 184, 255, 0.09)",
                      backdropFilter: "blur(20px)",
                      border: "1px solid rgba(25, 32, 95, 1)",
                    }}
                  >
                    Log In
                  </button>
                </Link>

                <Link
                  href="/login"
                  style={{
                    textDecoration: "none",
                  }}
                >
                  <button
                    className="text-dark px-3 py-1 font-medium rounded-lg"
                    style={{
                      background: "#fff",
                      boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
                      backdropFilter: "blur(20px)",
                      border: "1px solid rgba(25, 32, 95, 1)",
                    }}
                  >
                    Sign Up{" "}
                  </button>
                </Link>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default GiveawaysHeader;
