"use client";
import React from "react";

import Link from "next/link";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { useDispatch, useSelector } from "react-redux";

// from redux store
import { setProfile } from "../../app/store/authSlice";

// material components
import { Typography, Button, Avatar } from "@mui/material";

// stylesheet
import { fetcher } from "../../lib/fetch";
import { useUserHandler } from "../../lib/user/hooks";
import Image from "next/image";

import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { useThemeSwitcher } from "../../lib/theme/useThemeSwitcher";
import LogoutButton from "./LogoutButton";

const OnboardingPageHeader = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [mode, setMode] = useThemeSwitcher();

  const [isOpenMenu, setIsOpenMenu] = useState(false);
  const menuRef = useRef(null);

  const {
    data: userData,
    error: userError,
    mutate: userMutate,
  } = useUserHandler();

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

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const [open_bar, set_open_bar] = useState(false);

  const handle_click = (e) => {
    console.log("Hello there");
    set_open_bar(!open_bar);
    setAnchorEl(e.currentTarget);
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
      userMutate({ userData: null });
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
  }, [userMutate]);

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
    <>
      <div
        className="flex items-center justify-between px-4 bg-white dark:bg-dark"
        style={{ height: "7vh" }}
      >
        <section className="flex items-center gap-4">
          <Link href={"/"}>
            {mode === "light" ? (
              <Image src="/wu_logo.png" width={40} height={40} />
            ) : (
              <Image src="/wufwuflogo1.png" width={40} height={40} />
            )}
          </Link>
        </section>

        <section className="hidden md:block">
          <h4 className="text-quaternary text-lg font-semibold">Onboarding</h4>
        </section>
        <section>
          {userData ? (
            <div className="flex items-center gap-4">
              <div ref={menuRef}>
                <img
                  src={userData?.profilePicture}
                  alt="/default_profile.png"
                  className="rounded-full w-12 h-12 object-cover cursor-pointer"
                  onClick={() => setIsOpenMenu(!isOpenMenu)}
                />

                {isOpenMenu && (
                  <div
                    className="flex flex-col gap-8 w-11/12 md:w-3/12 rounded-xl p-1 z-50
                    border border-[#9f9f9f] bg-light/80 dark:bg-dark/80 backdrop-blur-sm"
                    style={{
                      position: "absolute",
                      top: "6%",
                      right: "2%",
                      height: "200px",
                    }}
                  >
                    {userData && (
                      <ul className="flex flex-col gap-4">
                        <li
                          className="flex items-center gap-2 w-full hover:bg-[#9f9f9f] cursor-pointer rounded-md
                        transition-all ease-in duration-200 p-1"
                        >
                          <Avatar
                            src={userData?.profilePicture}
                            alt="/default_profile.png"
                            sx={{
                              cursor: "pointer",
                              width: "40px",
                              height: "40px",
                            }}
                          />

                          <div className="flex flex-col items-center">
                            <h4 className="text-dark dark:text-white capitalize font-semibold text-xl">
                              {userData?.name}
                            </h4>
                            <span className="text-dark dark:text-white text-xs font-light">
                              [Onboarding]
                            </span>
                          </div>
                        </li>

                        <li
                          className="flex items-center justify-between w-full hover:bg-[#9f9f9f] cursor-pointer rounded-md
                        transition-all ease-in duration-200 p-1"
                        >
                          <div>
                            <h4 className="text-tertiary dark:text-white capitalize font-medium">
                              Theme:
                            </h4>
                          </div>

                          <div>
                            <input
                              type="checkbox"
                              className="checkbox"
                              id="checkbox"
                              onChange={() =>
                                setMode((prevMode) =>
                                  prevMode === "light" ? "dark" : "light"
                                )
                              }
                            />
                            <label for="checkbox" className="checkbox-label">
                              <DarkModeIcon
                                sx={{
                                  color: "#00b8ff",
                                  fontSize: "29px",
                                }}
                              />
                              <LightModeIcon
                                sx={{
                                  color: "#00b8ff",
                                  fontSize: "29px",
                                }}
                              />
                              <span className="ball"></span>
                            </label>
                          </div>
                        </li>

                        {/* <li
                          className="flex items-center justify-between w-full hover:bg-[#9f9f9f] cursor-pointer rounded-md
                        transition-all ease-in duration-200 p-1"
                        >
                          <div>
                            <h4 className="text-tertiary dark:text-white capitalize font-medium">
                              Theme:
                            </h4>
                          </div>

                          <div>
                            <button
                              className="rounded-xl p-2"
                              style={{
                                zIndex: 999,
                                boxShadow:
                                  "rgba(51, 51, 51, 0.35) 0px 5px 15px",
                              }}
                              onClick={() => {
                                setMode(mode === "light" ? "dark" : "light");
                                // console.log("setting mode...");
                              }}
                              aria-label="theme-switcher"
                            >
                              {mode === "light" ? (
                                <LightModeIcon
                                  sx={{
                                    color: "#00b8ff",
                                  }}
                                />
                              ) : (
                                <DarkModeIcon
                                  sx={{
                                    color: "#00b8ff",
                                  }}
                                />
                              )}
                            </button>
                          </div>
                        </li> */}
                      </ul>
                    )}

                    <div
                      className="flex justify-center w-full cursor-pointer rounded-md
                        transition-all ease-in duration-200 p-1"
                    >
                      {userData && <LogoutButton sign_out={sign_out} />}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="hidden md:flex gap-4">
              {/* {userData && !userError && (
                <Button
                  sx={{
                    backgroundColor: "#19205f",
                    borderRadius: "10px",
                    color: "#fff",
                    fontWeight: "600",
                    textTransform: "capitalize",
                    letterSpacing: "2px",
                    padding: "5px 25px",
                    boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px",
                  }}
                >
                  {" "}
                  <Image src={"/buttonloader.svg"} width={40} height={40} />
                </Button>
              )} */}

              {!userData && (
                <Link
                  href="/login"
                  style={{
                    textDecoration: "none",
                  }}
                >
                  <Button
                    sx={{
                      backgroundColor: "#19205f",
                      borderRadius: "10px",
                      color: "#fff",
                      fontWeight: "600",
                      textTransform: "capitalize",
                      letterSpacing: "2px",
                      padding: "5px 25px",
                      boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px",
                    }}
                  >
                    {" "}
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Log In
                    </Typography>
                  </Button>
                </Link>
              )}
            </div>
          )}
        </section>
      </div>
    </>
  );
};

export default OnboardingPageHeader;
