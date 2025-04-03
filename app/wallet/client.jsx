"use client";

import Link from "next/link";
import Image from "next/image";
import moment from "moment";
import axios from "axios";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { createNotification } from "../store/notificationSlice";
import { useWalletHandler, useTransactionsHandler } from "@/lib/user";
import { init_page } from "../store/pageSlice";
import WithdrawModal from "./components/withdraw-modal/index";

const Wallet = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("deposit");
  const [amount, setAmount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const userProfile = useSelector((state) => state.auth.profile);

  const {
    data: walletData,
    error: walletError,
    mutate: walletMutate,
  } = useWalletHandler();

  const {
    data: transactionsData,
    isLoading: transactionsLoading,
    mutate: transactionsMutate,
    error: transactionsError,
  } = useTransactionsHandler();

  const splicedTransactions = transactionsData?.slice(0, 3);

  const makeMpesaDeposit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post("/api/payments/deposit/paystack", {
        amount: Number(amount) * 100,
        currency: "KES",
        transactionBelongsTo: userProfile?.type,
        callbackUrl: `${window.location.origin}/wallet`,
      });

      if (!response.data.authorizationUrl) {
        throw new Error("No authorization URL received");
      }
      window.location.href = response.data.authorizationUrl;
    } catch (error) {
      console.error("Deposit error:", error);
      dispatch(
        createNotification({
          open: "true",
          type: "error",
          message: error.response?.data?.message || "Failed to process deposit",
        })
      );
      setLoading(false);
    }
  };

  const handleWithdraw = async (recipientData) => {
    try {
      const response = await axios.post("/api/payments/withdraw/paystack", {
        paystackRecipientCode: recipientData.paystackRecipientCode,
        transactionBelongsTo: userProfile?.type,
        amount: Number(recipientData.amount) * 100,
        currency: "KES",
      });

      dispatch(
        createNotification({
          open: "true",
          type: "success",
          message: "Withdrawal initiated successfully",
        })
      );

      // Refresh wallet and transaction data
      walletMutate();
      transactionsMutate();
    } catch (error) {
      dispatch(
        createNotification({
          open: "true",
          type: "error",
          message: error.response?.data?.message || "Failed to process withdrawal",
        })
      );
    }
  };

  useEffect(() => {
    dispatch(
      init_page({
        page_title: "Manage Wallet",
        show_back: false,
        show_menu: true,
        route_to: "/",
      })
    );
  }, []);

  return (
    <>
      {userProfile ? (
        <div className="flex flex-col gap-8" style={{ minHeight: "100vh" }}>
          <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Your Wallet</CardTitle>
              <CardDescription>
                Manage your funds and transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Current Balance</h2>
                {!walletData && !walletError && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                {walletError && (
                  <p className="text-destructive">An error occurred</p>
                )}
                {walletData && !walletError && (
                  <div className="flex justify-between">
                    <div>
                      <p className="text-2xl font-bold">
                        KES {(walletData.balances.KES / 100).toFixed(2)}
                      </p>
                      <p className="text-muted-foreground">
                        USD {walletData.balances.USD.toFixed(2)}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <Tabs
                defaultValue="deposit"
                value={activeTab}
                onValueChange={setActiveTab}
              >
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="deposit">Deposit</TabsTrigger>
                  <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
                  <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>

                <TabsContent value="deposit">
                  <form
                    onSubmit={makeMpesaDeposit}
                    className="space-y-4"
                  >
                    <div>
                      <h3 className="text-lg font-semibold mb-2">
                        Deposit via M-Pesa
                      </h3>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {[10, 20, 50, 100, 200, 500].map((value) => (
                          <Badge
                            key={value}
                            variant="outline"
                            className={`cursor-pointer ${
                              Number(amount) === value ? "bg-primary text-primary-foreground" : ""
                            }`}
                            onClick={() => setAmount(value)}
                          >
                            {value}
                          </Badge>
                        ))}
                      </div>
                      <Input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Enter amount"
                        min="10"
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Must be greater than 10
                      </p>
                    </div>
                    <Button type="submit" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Deposit"
                      )}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="withdraw">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold mb-2">
                      Withdraw Funds
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Withdraw your funds to M-Pesa.
                      {/* Withdraw your funds to M-Pesa, bank account, or card. */}
                    </p>
                    
                                          <Button 
                      onClick={() => setShowWithdrawModal(true)}
                      className="w-full"
                    >
                      Withdraw via M-Pesa
                    </Button>
                    
                    <WithdrawModal 
                      isOpen={showWithdrawModal}
                      onClose={() => setShowWithdrawModal(false)}
                      onWithdraw={handleWithdraw}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="history">
                  <h3 className="text-lg font-semibold mb-2">
                    Transaction History
                  </h3>
                  {!transactionsData && !transactionsError && (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      <span>Loading transactions...</span>
                    </div>
                  )}
                  {transactionsError && (
                    <p className="text-destructive">
                      Error fetching transactions.
                    </p>
                  )}
                  {transactionsData && !transactionsError && (
                    <ScrollArea className="h-[300px]">
                      {splicedTransactions?.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                          No transactions found
                        </p>
                      ) : (
                        splicedTransactions?.map((transaction, index) => (
                          <div
                            key={index}
                            className="mb-4 p-3 border rounded-lg"
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-semibold">
                                {transaction.type === "deposit" && "Deposit"}
                                {transaction.type === "withdraw" && "Withdrawal"}
                                {transaction.type === "buyIn" && "Buy In"}
                                {transaction.type === "gameCancelled" && "Cancelled Game"}
                              </span>
                              <span
                                className={`font-bold ${
                                  transaction.type === "withdraw" ||
                                  transaction.type === "buyIn"
                                    ? "text-red-500"
                                    : "text-green-500"
                                }`}
                              >
                                {transaction.type === "withdraw" ||
                                transaction.type === "buyIn"
                                  ? "-"
                                  : "+"}
                                KES{(transaction.amount / 100).toFixed(2)}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {moment(transaction.createdAt).format(
                                "YYYY-MM-DD HH:mm:ss"
                              )}
                            </p>
                          </div>
                        ))
                      )}
                    </ScrollArea>
                  )}
                  <div className="mt-4 text-right">
                    <Link href="/transactions">
                      <Button variant="outline">View All Transactions</Button>
                    </Link>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </>
  );
};

export default Wallet;