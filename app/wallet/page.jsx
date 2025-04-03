import Wallet from "./client";

export const metadata = {
  title: "Wallet - Wufwuf : Manage Your Wallet, Deposits & Withdrawals",
  description:
    "Deposit and withdraw funds securely on your Wufwuf wallet. Enjoy a seamless experience topping up your balance for exciting games like KingKadi and many more. Easy access to your funds for smooth transactions on Wufwuf.",
  keywords: [
    "Wufwuf",
    "wallet",
    "deposit",
    "withdrawal",
    "transactions",
    "payments",
    "secure",
  ],
  robots: {
    index: false,
    follow: false,
  },
};

const Page = () => {
  return <Wallet />;
};

export default Page;
