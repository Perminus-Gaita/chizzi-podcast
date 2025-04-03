"use client";
import { useState } from "react";

import { motion } from "framer-motion";

import { Check, BarChart, Users, Shield } from "lucide-react";

import { init_page } from "@/app/store/pageSlice";
import PricingTable from "@/page_components/Pricing/PricingTable";

import "@/styles/pricing.css";

import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TrialButton = () => {
  return (
    <div className="flex flex-col items-center justify-center">
      <button
        className="text-md text-white rounded-xl font-semibold px-6 py-2.5"
        style={{
          background: "rgb(0,184,255)",
          background:
            "linear-gradient(16deg, rgba(0,184,255,.3) 0%, rgba(250,202,0,0.4290091036414566) 76%)",
          "&:hover": {
            transition: "all .3s ease-in-out",
            border: ".1px solid #9f9f9f",
            background:
              "linear-gradient(16deg, rgba(0,184,255,3) 0%, rgba(250,202,0,0.4290091036414566) 76%)",
          },
        }}
      >
        {" "}
        Start 7-Day FREE Trial
      </button>

      <small className="text-primaryGray text-sm">
        No credit card required
      </small>
    </div>
  );
};

// const Plans = () => {
//   const dispatch = useDispatch();
//   // set page state
//   useEffect(() => {
//     dispatch(
//       init_page({
//         page_title: "Plans",
//         show_back: false,
//         show_menu: true,
//         route_to: "",
//       })
//     );
//   }, []);

//   const [isYearly, setIsYearly] = useState(false);

//   const plans = [
//     {
//       name: "Creator",
//       image: "/creatorplan.png",
//       monthlyPrice: 30,
//       yearlyPrice: 300,
//       description:
//         "Amplify your online presence and engage your audience like never before",
//       idealFor: "Perfect for aspiring influencers and content creators",
//       features: [
//         "5 Social Accounts",
//         "1 Workspace",
//         "Basic Analytics",
//         "100 Scheduled Posts/month",
//         "2 Free Tournaments/month",
//       ],
//     },
//     {
//       name: "Professional",
//       image: "/professionalplan.png",
//       monthlyPrice: 50,
//       yearlyPrice: 500,
//       description:
//         "Take your brand to the next level with advanced tools and insights",
//       idealFor: "Ideal for established influencers and growing businesses",
//       features: [
//         "10 Social Accounts",
//         "3 Workspaces",
//         "Advanced Analytics",
//         "300 Scheduled Posts/month",
//         "5 Tournaments/month",
//         "Custom Branding",
//       ],
//     },
//     {
//       name: "Agency",
//       image: "/agencyplan.png",
//       monthlyPrice: 100,
//       yearlyPrice: 1000,
//       description:
//         "Manage multiple brands and campaigns with powerful, scalable solutions",
//       idealFor: "Perfect for marketing agencies and large enterprises",
//       features: [
//         "25 Social Accounts",
//         "10 Workspaces",
//         "Advanced Analytics",
//         "Unlimited Posts",
//         "Unlimited Tournaments",
//         "Priority Support",
//       ],
//     },
//   ];

//   return (
//     <div
//       // className="flex flex-col"
//       className="bg-customPrimary h-full pt-5"
//       style={{ minHeight: "100vh", paddingBottom: "8rem" }}
//     >
//       <div className="flex flex-col gap-8 w-11/12 md:w-full mx-auto">
// <div
//   className="flex flex-col justify-center items-center gap-4 w-11/12 md:w-8/12"
//   style={{
//     margin: "0 auto",
//     minHeight: "30vh",
//   }}
// >
//   <h1 className="text-4xl font-bold text-white">Plans</h1>
//   <h4 className="text-primaryGray text-lg md:text-xl">
//     We offer flexible plans to fit the needs of any social media user,
//     from individual creators to large agencies. Find the perfect plan to
//     automate your posting, analyze your audience, and skyrocket your
//     social media game!
//   </h4>
// </div>

//         <div className="flex justify-center items-center mb-8">
//           <span
//             className={`mr-3 ${
//               isYearly ? "text-primaryGray" : "font-semibold text-light"
//             }`}
//           >
//             Monthly
//           </span>
//           <input
//             type="checkbox"
//             id="switch"
//             checked={isYearly}
//             onChange={() => setIsYearly(!isYearly)}
//           />
//           <label for="switch">Toggle</label>
//           <span
//             className={`ml-3 ${
//               isYearly ? "font-semibold text-light" : "text-primaryGray"
//             }`}
//           >
//             Yearly (Save 20%)
//           </span>
//         </div>

//         <div
//           className="flex flex-col gap-8 md:gap-0 md:flex-row justify-center md:justify-evenly items-center"
//           style={{ minHeight: "100vh" }}
//         >
//           {plans.map((plan, index) => (
//             <div
//               key={index}
//               className="flex flex-col justify-between gap-4 rounded-xl  p-4 py-8 w-11/12 md:w-3/12"
//               style={{
//                 height: plan.name === "Professional" ? "90vh" : "85vh",
//                 background: "rgba(25, 32, 95, 0.37)",
//                 boxShadow:
//                   plan.name === "Professional"
//                     ? "rgba(24, 119, 242, 1) -4px 9px 25px -6px"
//                     : "0 4px 30px rgba(0, 0, 0, 0.1)",
//                 backdropFilter: "blur(20px)",
//                 border: "1px solid rgba(25, 32, 95, 1)",
//               }}
//             >
//               <header className="flex flex-col gap-2">
//                 <div className="flex items-center gap-4">
//                   <Image
//                     src={plan.image}
//                     width={50}
//                     height={50}
//                     alt="plan_image"
//                   />
//                   <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
//                 </div>

//                 <p className="text-gray-600 text-base">{plan.description}</p>
//                 <div className="text-4xl text-white font-semibold">
//                   ${isYearly ? plan.yearlyPrice : plan.monthlyPrice}
//                   <span className="text-base font-normal text-gray-500">
//                     /{isYearly ? "year" : "month"}
//                   </span>
//                 </div>
//                 <p className="text-sm text-primaryGray">{plan.idealFor}</p>

//                 <Divider light sx={{ bgcolor: "#9f9f9f" }} />
//               </header>

//               <ul className="mb-6 flex flex-col gap-4 justify-start">
//                 {plan.features.map((feature, index) => (
//                   <li key={index} className="flex items-center">
//                     <CheckIcon className="text-[#78d64b] mr-2" />
//                     <span className="text-sm md:text-md font-medium text-white">
//                       {feature}
//                     </span>
//                   </li>
//                 ))}
//               </ul>

//               <TrialButton />
//             </div>
//           ))}
//         </div>

//         <div
//           className="flex flex-col justify-center items-center gap-4 w-11/12 md:w-8/12"
//           style={{
//             margin: "0 auto",
//             minHeight: "30vh",
//           }}
//         >
//           <h1 className="text-4xl font-bold text-white">Compare Plans</h1>
//           <h4 className="text-primaryGray text-lg md:text-xl">
//             Find the ideal plan to fuel your social media success, whether
//             you&apos;re starting or scaling.
//           </h4>
//         </div>

//         <PricingTable />
//       </div>
//     </div>
//   );
// };

const Plans = () => {
  const [isYearly, setIsYearly] = useState(false);
  const [currency, setCurrency] = useState("USD");
  const [selectedPlan, setSelectedPlan] = useState(null);

  const plans = [
    {
      name: "Free",
      priceKES: 0,
      priceUSD: 0,
      highlight: false,
      features: {
        tournaments: {
          title: "Tournament Features",
          items: [
            "2 free tournaments per month",
            "Up to 32 players per tournament",
            "Tournament chat rooms",
            "Basic tournament brackets",
            "Public tournament listing",
          ],
        },
        monetization: {
          title: "Monetization",
          items: [
            "Buy-in tournaments up to KES 1,000",
            "15% platform fee on buy-ins",
            // "Basic analytics",
          ],
        },
      },
      cta: "Start Free",
    },
    {
      name: "Pro Organizer",
      priceKES: 3000,
      priceUSD: 30,
      highlight: true,
      features: {
        tournaments: {
          title: "Tournament Features",
          items: [
            "Unlimited tournaments",
            "Up to 128 players per tournament",
            "Custom tournament branding",
            "Priority support",
            "Advanced leaderboards",
          ],
        },
        monetization: {
          title: "Monetization",
          items: [
            "Buy-in tournaments up to KES 10,000",
            "10% platform fee on buy-ins",
            "Merchandise store integration",
            "8% fee on merchandise sales",
            "Advanced analytics",
          ],
        },
      },
      cta: "Go Pro",
    },
    {
      name: "Enterprise",
      priceKES: 10000,
      priceUSD: 100,
      highlight: false,
      features: {
        tournaments: {
          title: "Tournament Features",
          items: [
            "Unlimited tournaments",
            "Unlimited players",
            "White-label branding",
            "Dedicated support",
            "Custom leaderboards",
          ],
        },
        monetization: {
          title: "Monetization",
          items: [
            "Unlimited buy-in amount",
            "7% platform fee on buy-ins",
            "Full marketplace integration",
            "5% fee on merchandise sales",
            "Custom analytics & API access",
          ],
        },
      },
      cta: "Contact Sales",
    },
  ];

  const getAdjustedPrice = (basePrice) => {
    if (basePrice === 0) return 0;
    const yearlyPrice = basePrice * 12;
    return isYearly ? Math.round(yearlyPrice * 0.8) : basePrice;
  };

  const handleSubscribe = (planName) => {
    // Replace with your subscription logic
    setSelectedPlan(planName);
    console.log(`Subscribing to ${planName} plan`);
    // Add your subscription API call here
  };

  return (
    <div className="py-20 bg-gradient-to-b from-gray-900 to-indigo-900/40">
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            Choose Your Tournament Package
          </h2>
          <p className="text-xl text-[#9f9f9f]">
            Start free, scale as you grow
          </p>
        </div>

        <div className="flex flex-col md:flex-row justify-center items-center gap-8 mb-8">
          <motion.div className="flex items-center gap-3 bg-gray-800/50 p-2 rounded-full">
            <span
              className={`text-sm ${
                !isYearly ? "text-white" : "text-gray-400"
              }`}
            >
              Monthly
            </span>
            <Switch
              checked={isYearly}
              onCheckedChange={() => setIsYearly(!isYearly)}
            />
            <span
              className={`text-sm ${isYearly ? "text-white" : "text-gray-400"}`}
            >
              Yearly (Save 20%)
            </span>
          </motion.div>
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger className="w-24 bg-gray-800/50 border-gray-700 text-white">
              <SelectValue placeholder="Currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="KES">KES</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-2xl p-6 ${
                plan.highlight
                  ? "bg-indigo-600/20 border-2 border-indigo-500/50"
                  : "bg-gray-800/50 border border-gray-700"
              }`}
            >
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">
                  {plan.name}
                </h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-white">
                    {plan.priceUSD === 0
                      ? "Free"
                      : `${currency === "USD" ? "$" : "KES"} ${getAdjustedPrice(
                          currency === "USD" ? plan.priceUSD : plan.priceKES
                        ).toLocaleString()}`}
                  </span>
                  {plan.basePrice > 0 && (
                    <span className="text-gray-400 ml-2">
                      /{isYearly ? "year" : "month"}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleSubscribe(plan.name)}
                  className={`w-full py-2 px-4 rounded-lg font-semibold 
                    ${
                      selectedPlan === plan.name ? "ring-2 ring-indigo-400" : ""
                    } 
                    ${
                      plan.highlight
                        ? "bg-indigo-500 hover:bg-indigo-600 text-white"
                        : "bg-gray-700 hover:bg-gray-600 text-white"
                    } transition-all duration-200 transform hover:scale-105`}
                >
                  {plan.cta}
                </button>
              </div>

              {Object.entries(plan.features).map(([key, section]) => (
                <div key={key} className="mb-6">
                  <h4 className="text-gray-400 text-sm uppercase mb-3">
                    {section.title}
                  </h4>
                  <ul className="space-y-3">
                    {section.items.map((feature, index) => (
                      <li
                        key={index}
                        className="flex items-center gap-2 text-gray-300"
                      >
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-16 text-center"
        >
          <p className="text-gray-400 mb-4">All plans include:</p>
          <div className="flex flex-wrap justify-center gap-6">
            <span className="text-gray-300 flex items-center gap-2">
              <Shield className="w-4 h-4" /> Secure Payments
            </span>
            <span className="text-gray-300 flex items-center gap-2">
              <BarChart className="w-4 h-4" /> Real-time Analytics
            </span>
            <span className="text-gray-300 flex items-center gap-2">
              <Users className="w-4 h-4" /> Community Tools
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Plans;
