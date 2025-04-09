"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useThemeSwitcher } from "@/lib/theme/useThemeSwitcher";

// Helper Components
const SocialLink = ({ href, image, name }) => (
  <Link
    href={href}
    target="_blank"
    rel="noreferrer"
    className="hover:opacity-80 transition-opacity"
  >
    <Image
      src={image}
      alt={`${name}_icon`}
      height={30}
      width={30}
      className="dark:brightness-90"
    />
  </Link>
);

const FooterLink = ({ href, children }) => (
  <li>
    <Link
      href={href}
      className="text-muted-foreground hover:text-foreground text-sm transition-colors"
    >
      {children}
    </Link>
  </li>
);

const FooterPages = [
  "/",
  "/privacy-policy",
  "/terms-of-service",
  "/plans",
  "/kadi/how-to-play",
  "/kadi/rules",
  "/kadi/cards",
  "/kadi/sequences",
  "/kadi/strategies",
  "/kadi/glossary",
  "/tournaments",
];

const Footer = () => {
  const pathname = usePathname();
  const [mode, setMode] = useThemeSwitcher();

  const currentYear = new Date().getFullYear();

  const isLandingPage = pathname === "/";
  const footerBgClass = isLandingPage
    ? "bg-customPrimary"
    : "dark:bg-slate-900 border-t border-border";

  if (
    FooterPages.includes(pathname) ||
    pathname.startsWith("/giveaways") ||
    pathname.startsWith("/blog")
  ) {
    return (
      <footer className={`${footerBgClass} px-4 py-8 text-foreground`}>
        <div className="max-w-6xl mx-auto">
          <section className="flex justify-between items-center mb-12">
            <div>
              <Image
                src={
                  isLandingPage
                    ? "/wufwuflogo1.png"
                    : mode === "light"
                    ? "/wu_logo.png"
                    : "/wufwuflogo1.png"
                }
                width={40}
                height={40}
                alt="wufwuf_logo"
                className="dark:brightness-90"
              />
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              <SocialLink href="#!" image="/facebook.svg" name="facebook" />
              <SocialLink
                href="https://twitter.com/_wufwuf"
                image="/x.svg"
                name="twitter"
              />
              <SocialLink href="#!" image="/instagram.svg" name="instagram" />
              <SocialLink href="#!" image="/youtube.svg" name="youtube" />
              <SocialLink
                href="https://www.linkedin.com/company/wufwuf1/"
                image="/linkedin.svg"
                name="linkedin"
              />
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 text-center">
            <div>
              <h3
                className={` ${
                  isLandingPage && "text-light"
                } text-lg font-semibold mb-4`}
              >
                Platform
              </h3>
              <ul className="space-y-2">
                <FooterLink href="/arena">Tournaments</FooterLink>
                <FooterLink href="/arena">Games</FooterLink>
                <FooterLink href="/plans">Plans</FooterLink>
              </ul>
            </div>

            <div>
              <h3
                className={` ${
                  isLandingPage && "text-light"
                } text-lg font-semibold mb-4`}
              >
                Kadi
              </h3>
              <ul className="space-y-2">
                <FooterLink href="/kadi/learn">Learn Kadi</FooterLink>
                <FooterLink href="/kadi/how-to-play">
                  How to Play Kadi
                </FooterLink>
                <FooterLink href="/kadi/rules">Kadi Rules</FooterLink>
                <FooterLink href="/kadi/cards">Kadi Guide</FooterLink>
                <FooterLink href="/kadi/sequences">Kadi Sequences</FooterLink>
              </ul>
            </div>

            <div>
              <h3
                className={` ${
                  isLandingPage && "text-light"
                } text-lg font-semibold mb-4`}
              >
                Wufwuf
              </h3>
              <ul className="space-y-2">
                <FooterLink href="/blog">Blog</FooterLink>
                {/* <FooterLink href="/about">About Us</FooterLink> */}
                <FooterLink href="/terms-of-service">
                  Terms of Service
                </FooterLink>
                <FooterLink href="/privacy-policy">Privacy Policy</FooterLink>
              </ul>
            </div>
          </div>

          <div className="text-center text-sm text-gray-400 pt-8 border-t border-gray-700">
            <p>&copy; {currentYear} wufwuf.io. All rights reserved.</p>
          </div>
        </div>
      </footer>
    );
  }
  return null;
};

export default Footer;
