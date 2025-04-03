import Transactions from "./client";

export const metadata = {
  title:
    "Transactions - Wufwuf : Track Your Transactions on Wufwuf - Deposits, Withdrawals & More",
  description:
    "Get a clear overview of your Wufwuf transactions! View your deposit, withdrawal, and in-game activity with ease. Track your funds and stay on top of your Wufwuf finances.",
  keywords: [
    "Wufwuf",
    "transactions",
    "deposits",
    "withdrawals",
    "in-game",
    "activity",
    "finance",
    "money management",
    "financial history",
    "KingKadi",
    "kadi",
    "games",
  ],
  openGraph: {
    title: "Wufwuf Transactions: Your Financial Activity Log",
    description:
      "Gain complete control over your Wufwuf finances! View your transaction history for deposits, withdrawals, and in-game activity. Manage your Wufwuf funds effectively with ease.",
    image:
      "https://www.wufwuf.io/public/transactions/transactions_hero_image.jpg", // Replace with Transaction-specific image
  },
  twitter: {
    title: "Wufwuf Transactions: Keep Tabs on Your Money Flow",
    description:
      "Stay informed about your Wufwuf finances! Track your deposits, withdrawals, and in-game activity effortlessly. Manage your Wufwuf money with confidence. #WufwufTransactions #Finance #MoneyManagement",
  },
  additionalMetadata: {
    // Add any other relevant metadata here, such as transaction types (deposit, withdrawal, buy-in), filters available on the page (date range, transaction type), etc.
  },
};

const Page = () => {
  return <Transactions />;
};

export default Page;
