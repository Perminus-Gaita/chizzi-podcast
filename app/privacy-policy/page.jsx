// "use client";
// import { useEffect } from "react";
// import { useDispatch } from "react-redux";
// import { init_page } from "@/app/store/pageSlice";

// const PrivacyPolicy = () => {
//   const dispatch = useDispatch();

//   useEffect(() => {
//     dispatch(
//       init_page({
//         page_title: "Privacy Policy and Cookie Use",
//         show_back: false,
//         show_menu: true,
//         route_to: "/",
//       })
//     );
//   }, []);

//   return (
//     <>
//       <div
//         style={{
//           backgroundColor: "#131633",
//           color: "white",
//           padding: "20px",
//           maxWidth: "950px",
//           display: "flex",
//           flexDirection: "column",
//           alignItems: "center",
//           justifyContent: "center",
//           margin: "40px auto 10px auto",
//         }}
//       >
//         <h1>Privacy Policy and Cookie Use</h1>
//         <h1>Privacy Policy</h1>
//         <p>
//           At Wufwuf, we take your privacy seriously. This Privacy Policy
//           explains how we collect, use, and share your personal information in
//           connection with our Services. By creating an account or using our Services,
//           you agree to the collection and use of information in accordance with this policy.
//         </p>
//         <h2>Information Collection and Use</h2>
//         <p>
//           We collect several types of information to provide you with the best possible
//           service experience. This includes:
//         </p>
//         <ul>
//           <li>
//             Personal information that you provide to us, such as your name,
//             email address, and payment information
//           </li>
//           <li>
//             Information about your use of our Services, such as your device type,
//             IP address, and interaction patterns
//           </li>
//           <li>
//             Information that we collect through cookies, analytics tools, and similar
//             technologies
//           </li>
//         </ul>
//         <h2>Analytics Tools</h2>
//         <p>
//           To improve our Services and provide you with the best possible experience,
//           we use the following analytics tools:
//         </p>
//         <ul>
//           <li>
//             <strong>Google Analytics:</strong> This service helps us understand how
//             visitors interact with our website by collecting information about page
//             views, session duration, geographic location, and other usage patterns.
//           </li>
//           <li>
//             <strong>Microsoft Clarity:</strong> This tool helps us understand how
//             users navigate our website by recording interactions such as mouse
//             movements, clicks, and scrolling patterns. This information is invaluable
//             in helping us improve our user interface and overall user experience.
//           </li>
//         </ul>
//         <p>
//           The data collected by these tools is used solely for the purpose of
//           improving our Services and understanding how we can better serve our users.
//           This information is processed in a way that does not personally identify
//           individual users.
//         </p>
//         <h2>Your Consent and Choices</h2>
//         <p>
//           By creating an account and using Wufwuf&apos;s services, you&apos;re agreeing to
//           our use of these analytics tools. We believe these tools are essential to
//           providing and improving our core services. As these analytics are an integral
//           part of how we maintain and improve Wufwuf, they are a necessary part of
//           using our service.
//         </p>
//         <h2>Information Sharing</h2>
//         <p>
//           We share limited data with our analytics providers (Google Analytics and
//           Microsoft Clarity) as described above. Beyond these essential service
//           providers, we do not share your personal information with third parties
//           except as necessary to provide our Services to you, to comply with
//           applicable laws, or to protect our rights and interests.
//         </p>
//         <h2>Security</h2>
//         <p>
//           We take reasonable measures to protect your personal information from
//           unauthorized access, disclosure, or use. However, no method of
//           transmission over the internet or method of electronic storage is 100%
//           secure.
//         </p>
//         <h2>Changes to this Privacy Policy</h2>
//         <p>
//           We may update this Privacy Policy from time to time. We will notify
//           you of any changes by posting the new Privacy Policy on this page. You
//           are advised to review this Privacy Policy periodically for any
//           changes.
//         </p>
//         <h1>Cookie Use</h1>
//         <p>
//           Wufwuf uses cookies and similar technologies to provide and improve
//           our Services to you. By using our Services, you agree to the use of
//           cookies in accordance with this policy.
//         </p>
//         <h2>What are Cookies?</h2>
//         <p>
//           Cookies are small text files that are placed on your device when you
//           visit our website. They allow us to recognize your device and remember
//           your preferences, settings, and login information.
//         </p>
//         <h2>How We Use Cookies</h2>
//         <p>We use cookies to:</p>
//         <ul>
//           <li>Provide and improve our Services to you</li>
//           <li>Remember your preferences and settings</li>
//           <li>Recognize your device when you return to our website</li>
//           <li>Support our analytics tools in collecting usage data</li>
//           <li>Enhance overall user experience</li>
//         </ul>
//         <h2>Types of Cookies We Use</h2>
//         <p>Here are the main types of cookies we use:</p>
//         <ul>
//           <li>
//             <strong>Essential cookies:</strong> These cookies are necessary for our website to
//             function properly and cannot be switched off in our systems. They
//             are usually only set in response to actions made by you, such as
//             setting your privacy preferences, logging in, or filling in forms.
//           </li>
//           <li>
//             <strong>Analytics cookies:</strong> These cookies, including those from Google Analytics
//             and Microsoft Clarity, allow us to measure and analyze how our website
//             is being used, helping us improve our Services and user experience.
//           </li>
//         </ul>
//         <h2>Disclosure of Data</h2>
//         <p>
//           Wufwuf&apos;s use and transfer to any other app of information received from
//           Google APIs will adhere to{" "}
//           <Link href="https://developers.google.com/terms/api-services-user-data-policy#additional_requirements_for_specific_api_scopes">
//             Google API Services User Data Policy
//           </Link> 
//           , including the Limited Use requirements.
//         </p>
//         <h2>Contact Us</h2>
//         <p>
//           If you have any questions about our Privacy Policy or use of cookies,
//           please contact us at wufwuf78@gmail.com.
//         </p>
//       </div>
//     </>
//   );
// };

// export default PrivacyPolicy;

"use client";
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

const PolicySection = ({ title, children }) => (
  <section className="space-y-4">
    <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
      {title}
    </h2>
    {children}
  </section>
);

const SubSection = ({ title, children }) => (
  <div className="space-y-2">
    <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200">
      {title}
    </h3>
    {children}
  </div>
);

const BulletList = ({ items }) => (
  <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
    {items.map((item, index) => (
      <li key={index}>{item}</li>
    ))}
  </ul>
);

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden">
          <CardContent className="p-8">
            <div className="space-y-8">
              {/* Header */}
              <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Privacy Policy
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Last Updated: November 6, 2024
                </p>
              </div>

              {/* Introduction */}
              <PolicySection title="1. Introduction">
                <p className="text-gray-600 dark:text-gray-300">
                  At Wufwuf, we take your privacy seriously. This Privacy Policy
                  explains how we collect, use, and protect your personal
                  information when you use our esports tournament platform. By
                  using our Services, you agree to the collection and use of
                  information in accordance with this policy.
                </p>
              </PolicySection>

              {/* Information Collection */}
              <PolicySection title="2. Information Collection">
                <SubSection title="2.1 Personal Information">
                  <p className="text-gray-600 dark:text-gray-300">
                    Through Google Sign-In, we collect:
                  </p>
                  <BulletList
                    items={[
                      "Google account email address",
                      "Google profile name",
                      "Google profile picture",
                      "Google account ID",
                      "Authentication tokens",
                    ]}
                  />
                </SubSection>

                <SubSection title="2.2 Platform Usage Data">
                  <p className="text-gray-600 dark:text-gray-300">
                    We collect data about:
                  </p>
                  <BulletList
                    items={[
                      "Tournament participation and results",
                      "Game statistics and performance",
                      "Payment transactions and history",
                      "Platform interaction patterns",
                      "Device and connection information",
                    ]}
                  />
                </SubSection>
              </PolicySection>

              {/* Analytics Tools */}
              <PolicySection title="3. Analytics Tools">
                <SubSection title="3.1 Google Analytics">
                  <p className="text-gray-600 dark:text-gray-300">
                    We use Google Analytics to:
                  </p>
                  <BulletList
                    items={[
                      "Track website traffic and usage patterns",
                      "Analyze user behavior and preferences",
                      "Measure tournament engagement",
                      "Improve platform performance",
                      "Optimize user experience",
                    ]}
                  />
                </SubSection>

                <SubSection title="3.2 Microsoft Clarity">
                  <p className="text-gray-600 dark:text-gray-300">
                    Microsoft Clarity helps us understand:
                  </p>
                  <BulletList
                    items={[
                      "User navigation patterns",
                      "Interface interaction behaviors",
                      "Platform usability issues",
                      "User experience optimization opportunities",
                      "Feature engagement metrics",
                    ]}
                  />
                </SubSection>
              </PolicySection>

              {/* Data Usage */}
              <PolicySection title="4. Data Usage">
                <SubSection title="4.1 Primary Uses">
                  <BulletList
                    items={[
                      "Operating and improving the platform",
                      "Managing tournaments and competitions",
                      "Processing payments and prizes",
                      "Communicating with users",
                      "Ensuring fair play and security",
                    ]}
                  />
                </SubSection>

                <SubSection title="4.2 Secondary Uses">
                  <BulletList
                    items={[
                      "Platform analytics and improvements",
                      "Performance optimization",
                      "User experience enhancement",
                      "Service personalization",
                      "Marketing and promotional activities",
                    ]}
                  />
                </SubSection>
              </PolicySection>

              {/* Data Sharing */}
              <PolicySection title="5. Information Sharing">
                <p className="text-gray-600 dark:text-gray-300">
                  We share your information with:
                </p>
                <BulletList
                  items={[
                    "Payment processors (Paystack) for transaction processing",
                    "Analytics providers (Google Analytics, Microsoft Clarity)",
                    "Tournament organizers (limited to necessary tournament data)",
                    "Legal authorities when required by law",
                    "Service providers helping operate our platform",
                  ]}
                />
              </PolicySection>

              {/* Google API Services */}
              <PolicySection title="6. Google API Services">
                <p className="text-gray-600 dark:text-gray-300">
                  Our use and transfer of information received from Google APIs
                  adheres to the Google API Services User Data Policy, including
                  the Limited Use requirements. We access only necessary Google
                  account information for authentication and will not transfer
                  this information to others except as necessary to provide and
                  improve our Services.
                </p>
              </PolicySection>

              {/* Security */}
              <PolicySection title="7. Data Security">
                <p className="text-gray-600 dark:text-gray-300">
                  We implement appropriate security measures to protect your
                  information:
                </p>
                <BulletList
                  items={[
                    "Secure data encryption in transit and at rest",
                    "Regular security audits and updates",
                    "Access controls and authentication",
                    "Secure payment processing",
                    "Regular backup procedures",
                  ]}
                />
              </PolicySection>

              {/* User Rights */}
              <PolicySection title="8. Your Rights">
                <p className="text-gray-600 dark:text-gray-300">
                  You have the right to:
                </p>
                <BulletList
                  items={[
                    "Access your personal data",
                    "Request data correction",
                    "Request data deletion",
                    "Opt out of marketing communications",
                    "Export your data",
                  ]}
                />
              </PolicySection>

              {/* Policy Updates */}
              <PolicySection title="9. Changes to Policy">
                <p className="text-gray-600 dark:text-gray-300">
                  We may update this Privacy Policy periodically. We will notify
                  you of any significant changes through the platform or via
                  email. Continued use of the platform after such modifications
                  constitutes acceptance of the updated Privacy Policy.
                </p>
              </PolicySection>

              {/* Footer */}
              <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  For questions about this Privacy Policy, please contact us at
                  wufwuf78@gmail.com
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
