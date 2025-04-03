"use client";
import { useSelector } from "react-redux";

import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";

import moment from "moment";

// import {
//   Grid,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Paper,
//   MenuItem,
//   Select,
//   FormControl,
//   InputLabel,
// } from "@mui/material";

// import CachedIcon from "@mui/icons-material/Cached";

import { useTransactionsHandler } from "../../lib/user/hooks";
import { createNotification } from "../store/notificationSlice";
import { init_page } from "../store/pageSlice";

import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  RefreshCw,
  ArrowUpCircle,
  ArrowDownCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Trophy,
  Gamepad2,
} from "lucide-react";

const TransactionCard = ({ transaction }) => {
  const getStatusColor = (status) => {
    const colors = {
      processing: "bg-yellow-500/10 text-yellow-500",
      success: "bg-green-500/10 text-green-500",
      failed: "bg-red-500/10 text-red-500",
      reversed: "bg-blue-500/10 text-blue-500",
    };
    return colors[status] || "bg-gray-500/10 text-gray-500";
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "deposit":
        return <ArrowUpCircle className="w-5 h-5 text-primary" />;
      case "withdraw":
        return <ArrowDownCircle className="w-5 h-5 text-muted-foreground" />;
      case "buyIn":
        return <Gamepad2 className="w-5 h-5 text-violet-500" />;
      case "tournamentBuyIn":
        return <Trophy className="w-5 h-5 text-amber-500" />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className="p-4 mb-3 bg-card hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {getTypeIcon(transaction.type)}
            <div>
              <p className="font-medium capitalize">
                {transaction.type.replace(/([A-Z])/g, " $1").trim()}
              </p>
              <p className="text-xs text-muted-foreground">
                {moment(transaction.createdAt).format("MMM D, h:mm a")}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1">
            <span className="font-semibold">
              {transaction.type === "withdraw" ? "-" : "+"}
              KES {(transaction.amount / 100).toLocaleString()}
            </span>
            <Badge
              variant="secondary"
              className={getStatusColor(transaction.status)}
            >
              {transaction.status}
            </Badge>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

const Transactions = () => {
  const dispatch = useDispatch();

  const userProfile = useSelector((state) => state.auth.profile);

  const [openModal, setOpenModal] = useState(false);

  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const [currentTransaction, setCurrentTransaction] = useState(null);

  const [filterOpen, setFilterOpen] = useState(false);

  const {
    data: transactionsData,
    isLoading: transactionsLoading,
    mutate: transactionsMutate,
    error: transactionsError,
  } = useTransactionsHandler();

  const [filter, setFilter] = useState("all");
  const [timeRange, setTimeRange] = useState("all");

  const filterTransactions = (txns) => {
    if (!txns) return [];

    return txns.filter((t) => {
      if (filter !== "all" && t.type !== filter) return false;
      if (timeRange === "today") {
        return moment(t.createdAt).isSame(moment(), "day");
      }
      if (timeRange === "week") {
        return moment(t.createdAt).isAfter(moment().subtract(7, "days"));
      }
      if (timeRange === "month") {
        return moment(t.createdAt).isAfter(moment().subtract(30, "days"));
      }
      return true;
    });
  };

  const getStats = (txns) => {
    const stats = {
      totalDeposits: 0,
      totalWithdrawals: 0,
      totalGames: 0,
      totalTournaments: 0,
    };

    txns?.forEach((t) => {
      const amount = t.amount / 100;
      if (t.type === "deposit") stats.totalDeposits += amount;
      if (t.type === "withdraw") stats.totalWithdrawals += amount;
      if (t.type === "buyIn") stats.totalGames++;
      if (t.type === "tournamentBuyIn") stats.totalTournaments++;
    });

    return stats;
  };

  const stats = getStats(transactionsData);
  const filteredTransactions = filterTransactions(transactionsData);

  // const [filteredTransactions, setFilteredTransactions] =
  //   useState(transactionsData);

  // const [filterType, setFilterType] = useState("");

  // const handleFilterButtonClick = () => {
  //   setFilterOpen(!filterOpen);
  // };

  const handleStatusChange = (event) => {
    setSelectedStatus(event.target.value);
  };

  // const handleOpen = (data) => {
  //   setCurrentTransaction(data);

  //   console.log(data);

  //   setOpenModal(true);
  // };
  // const handleClose = () => {
  //   setCurrentTransaction(null);
  //   setOpenModal(false);
  // };

  // const filterTransactions = (type) => {
  //   if (type === "") {
  //     setFilteredTransactions(transactionsData);
  //   } else {
  //     const filtered = transactionsData.filter(
  //       (transaction) => transaction.transactionType === type
  //     );
  //     setFilteredTransactions(filtered);
  //   }
  // };

  // const handleFilterChange = (event) => {
  //   const selectedType = event.target.value;
  //   setFilterType(selectedType);
  //   filterTransactions(selectedType);
  // };

  // const handleSearchTermChange = (event) => {
  //   setSearchTerm(event.target.value);
  // };

  const refetch = async () => {
    transactionsMutate();

    dispatch(
      createNotification({
        open: true,
        type: "info",
        message: "Transactions are up to date",
      })
    );
  };

  //   const filteredData = transactionsData?.filter((item) => {
  //     // Apply status filter
  //     if (
  //       selectedStatus !== "all" &&
  //       item.status !== selectedStatus &&
  //       item.transactionType !== selectedStatus
  //     ) {
  //       return false;
  //     }

  //     // Apply search term filter
  //     const searchTermLC = searchTerm.toLowerCase();
  //     const isMatchingSearch = item.code.toLowerCase().includes(searchTermLC);

  //     return isMatchingSearch;
  //   });

  // set page state
  useEffect(() => {
    dispatch(
      init_page({
        page_title: "Transactions",
        show_back: false,
        show_menu: true,
        route_to: "",
      })
    );
  }, []);

  return (
    <>
      {userProfile ? (
        // <div className="flex flex-col gap-8" style={{ minHeight: "100vh" }}>
        //   <div className="flex justify-end" style={{ width: "95%" }}>
        //     <div className="flex gap-4">
        //       <FormControl>
        //         <InputLabel sx={{ color: "#fff" }}>Status</InputLabel>
        //         <Select
        //           value={selectedStatus}
        //           onChange={handleStatusChange}
        //           label={<span className="text-white">Status</span>}
        //           sx={{ color: "white" }}
        //         >
        //           <MenuItem value="all">All</MenuItem>
        //           <MenuItem value="deposit">Deposits</MenuItem>
        //           <MenuItem value="withdrawal">Withdrawals</MenuItem>
        //           <MenuItem value="pending">Pending</MenuItem>
        //           <MenuItem value="processed">Processed</MenuItem>
        //           <MenuItem value="cancelled">Cancelled</MenuItem>
        //         </Select>
        //       </FormControl>

        //       <button
        //         className="px-4"
        //         onClick={refetch}
        //         style={{
        //           boxShadow: "rgba(51, 51, 51, 0.60) 0px 5px 15px",
        //           borderRadius: "10px",
        //         }}
        //       >
        //         <CachedIcon sx={{ color: "#fff" }} />

        //         <span className="text-white ml-1">Refresh</span>
        //       </button>
        //     </div>
        //   </div>

        //   {/* Loading state */}
        //   {!transactionsData && !transactionsError && (
        //     <>
        //       <span className="text-[#00b8ff] text-md">
        //         Fetching your transactions...
        //       </span>
        //     </>
        //   )}

        //   {/* Error state */}
        //   {transactionsError && (
        //     <>
        //       <span className="text-primaryRed text-md">
        //         Error fetching your transactions.
        //       </span>
        //     </>
        //   )}

        //   <div style={{ height: "80vh", width: "95%" }}>
        //     {transactionsData && !transactionsError && (
        //       <TableContainer
        //         component={Paper}
        //         sx={{
        //           maxHeight: "70vh",
        //           overflowY: "auto",
        //           bgcolor: "transparent",
        //           boxShadow: "rgba(51, 51, 51, 0.60) 0px 5px 15px",
        //           padding: "1rem",
        //           borderRadius: "10px",

        //           "&::-webkit-scrollbar": {
        //             width: "8px",
        //           },
        //           "&::-webkit-scrollbar-track": {
        //             backgroundColor: "#9f9f9f",
        //           },
        //           "&::-webkit-scrollbar-thumb": {
        //             backgroundColor: "#1c1c1c",
        //             borderRadius: "4px",
        //           },
        //           "&::-webkit-scrollbar-thumb:hover": {
        //             backgroundColor: "#555",
        //           },
        //         }}
        //       >
        //         <Table
        //           sx={{ minWidth: 650 }}
        //           stickyHeader
        //           aria-label="sticky table"
        //         >
        //           <TableHead>
        //             <TableRow>
        //               <TableCell align="right">
        //                 <span className="text-dark font-semibold">Type</span>
        //               </TableCell>
        //               <TableCell align="right">
        //                 <span className="text-dark font-semibold">
        //                   Amount(KES)
        //                 </span>
        //               </TableCell>
        //               <TableCell align="right">
        //                 <span className="text-dark font-semibold">Status</span>
        //               </TableCell>
        //               <TableCell align="right">
        //                 <span className="text-dark font-semibold">Created</span>
        //               </TableCell>
        //             </TableRow>
        //           </TableHead>
        //           <TableBody>
        //             {transactionsData?.map((row, index) => (
        //               <TableRow
        //                 key={index}
        //                 sx={{
        //                   "&:last-child td, &:last-child th": { border: 0 },
        //                 }}
        //               >
        //                 <TableCell align="right">
        //                   <span
        //                     className="capitalize"
        //                     variant="body2"
        //                     style={{
        //                       color:
        //                         row.type === "deposit" ? "#00a7e1" : "#9f9f9f",
        //                     }}
        //                   >
        //                     {row.type === "buyIn" && "Buy In"}
        //                     {row.type === "gameCancelled" && "Game Cancelled"}
        //                     {row.type === "payOut" && "Paid Out"}
        //                     {row.type === "deposit" && "Deposit"}
        //                     {row.type === "withdraw" && "Withdraw"}
        //                   </span>
        //                 </TableCell>
        //                 <TableCell align="right">
        //                   <span className="text-white">{row.amount / 100}</span>
        //                 </TableCell>
        //                 <TableCell align="right">
        //                   <span
        //                     className="text-md font-semibold capitalize"
        //                     style={{
        //                       color:
        //                         row.status === "processing"
        //                           ? "#faca00"
        //                           : row.status === "success"
        //                           ? "#78d64b"
        //                           : row.status === "failed"
        //                           ? "#ff5733"
        //                           : row.status === "reversed"
        //                           ? "#00b8ff"
        //                           : "#fff",
        //                     }}
        //                   >
        //                     {row.status}
        //                   </span>
        //                 </TableCell>
        //                 <TableCell align="right">
        //                   <span className="text-white">
        //                     {moment(row.createdAt).format("MMMM Do, h:mm a")}
        //                   </span>
        //                 </TableCell>
        //               </TableRow>
        //             ))}
        //           </TableBody>
        //         </Table>
        //       </TableContainer>
        //     )}
        //   </div>
        // </div>

        // <div className="container max-w-4xl mx-auto p-4">

        <div
          className="flex flex-col gap-8 md:max-w-4xl mx-auto"
          style={{ minHeight: "100vh" }}
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold">Transactions</h1>
              <p className="text-sm text-muted-foreground">
                View and track your transaction history
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={refetch}
              disabled={transactionsLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw
                className={`w-4 h-4 ${
                  transactionsLoading ? "animate-spin" : ""
                }`}
              />
              Refresh
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <Card className="p-4">
              <p className="text-sm text-muted-foreground mb-1">
                Total Deposits
              </p>
              <p className="text-xl font-bold text-green-500">
                {stats.totalDeposits.toLocaleString()}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-muted-foreground mb-1">
                Total Withdrawn
              </p>
              <p className="text-xl font-bold text-blue-500">
                {stats.totalWithdrawals.toLocaleString()}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-muted-foreground mb-1">Games Played</p>
              <p className="text-xl font-bold text-violet-500">
                {stats.totalGames}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-muted-foreground mb-1">Tournaments</p>
              <p className="text-xl font-bold text-amber-500">
                {stats.totalTournaments}
              </p>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Transactions</SelectItem>
                <SelectItem value="deposit">Deposits</SelectItem>
                <SelectItem value="withdraw">Withdrawals</SelectItem>
                <SelectItem value="buyIn">Game Buy-ins</SelectItem>
                <SelectItem value="tournamentBuyIn">
                  Tournament Buy-ins
                </SelectItem>
              </SelectContent>
            </Select>

            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Transactions List */}
          {transactionsLoading ? (
            <div className="text-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
              <p className="text-muted-foreground">Loading transactions...</p>
            </div>
          ) : transactionsError ? (
            <Card className="p-8 text-center">
              <XCircle className="w-8 h-8 text-destructive mx-auto mb-2" />
              <p className="text-destructive">Error loading transactions</p>
              <Button variant="outline" onClick={refetch} className="mt-4">
                Try Again
              </Button>
            </Card>
          ) : filteredTransactions.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No transactions found</p>
            </Card>
          ) : (
            <ScrollArea className="h-[600px] rounded-md border p-4">
              <AnimatePresence mode="popLayout">
                {filteredTransactions.map((transaction) => (
                  <TransactionCard
                    key={transaction._id}
                    transaction={transaction}
                  />
                ))}
              </AnimatePresence>
            </ScrollArea>
          )}
        </div>
      ) : null}
    </>
  );
};

export default Transactions;
