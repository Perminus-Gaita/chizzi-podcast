"use client";
import {
  setGlobalNotifications,
  setUnreadCount,
  addNewNotification,
  setUrgentMatches,
} from "@/app/store/notificationSlice";
import mqtt from "mqtt";
import axios from "axios";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createNotification } from "@/app/store/notificationSlice";

const MQTTNotification = () => {
  const dispatch = useDispatch();

  // const mqttConnectUrl = useSelector(
  //   (state) => state.notification.mqttConnectUrl
  // );

  const userProfile = useSelector((state) => state.auth.profile);

  const globalNotifications = useSelector(
    (state) => state.notification.globalNotifications
  );

  const [mqttConnectUrl, setMqttConnectUrl] = useState("");
  const [mqttClient, setMqttClient] = useState(null);

  useEffect(() => {
    const getMqttConnection = async () => {
      try {
        const response = await axios.get("/api/notifications/mqtt");

        if (response.status === 200) {
          setMqttConnectUrl(response.data.webSocketsUrl);
        } else {
          console.error("Unexpected response status:", response.status);
          // Optionally, you can set a default or fallback URL here
          // setMqttConnectUrl("fallback-mqtt-url");
        }
      } catch (error) {
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          // console.error("Server responded with an error:", error.response.status, error.response.data);
        } else if (error.request) {
          // The request was made but no response was received
          // console.error("No response received from the server:", error.request);
        } else {
          // Something happened in setting up the request that triggered an error
          // console.error("Error setting up the request:", error.message);
        }

        // Optionally, you can set a default or fallback URL here
        // setMqttConnectUrl("fallback-mqtt-url");
      }
    };

    getMqttConnection();
  }, []);

  useEffect(() => {
    if (!userProfile?.uuid) return;

    const checkUrgentMatches = async () => {
      try {
        const response = await axios.get("/api/cards/get-urgent-matches");
        const urgentCount = response.data.count;

        dispatch(setUrgentMatches(urgentCount));

        // // Create notification if there are urgent matches
        // if (urgentCount > 0) {
        //   dispatch(
        //     createNotification({
        //       open: true,
        //       type: "info",
        //       message: `You have ${urgentCount} active game${
        //         urgentCount > 1 ? "s" : ""
        //       } waiting for your move!`,
        //     })
        //   );
        // }
      } catch (error) {
        console.error("Error checking urgent matches:", error);
      }
    };

    // Initial check
    checkUrgentMatches();

    // // Set up periodic polling (every 30 seconds)
    // const pollInterval = setInterval(checkUrgentMatches, 30000);

    // return () => clearInterval(pollInterval);
  }, [userProfile, dispatch]);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (!userProfile?.uuid) return;

      try {
        const response = await axios.get("/api/notifications/unread-count");
        dispatch(setUnreadCount(response.data.count));
      } catch (error) {
        console.error("Error fetching unread count:", error);
      }
    };

    fetchUnreadCount();
  }, [userProfile, dispatch]);

  useEffect(() => {
    if (mqttConnectUrl && userProfile?.uuid) {
      const mqttClient = mqtt.connect(mqttConnectUrl);
      setMqttClient(mqttClient);

      mqttClient.on("connect", () => {
        mqttClient.subscribe(userProfile?.uuid, (err, granted) => {
          if (err) {
            console.error("Error subscribing:", err);
          }

          // mqttClient.publish(
          //   userProfile?.uuid || "",
          //   JSON.stringify({ message: "Hello from nextjs pages/iot line 29" })
          // );
        });
      });

      mqttClient.on("message", async (topic, message) => {
        if (!message) return;
        try {
          const parsedMessage = JSON.parse(message.toString());
          if (topic === userProfile?.uuid) {
            // console.log(
            //   `Received message on topic ${topic}: ${message.toString()}`
            // );
            // console.log("### The parsed message");
            // console.log(parsedMessage);

            dispatch(
              addNewNotification({
                ...parsedMessage,
                isRead: false,
                receivedAt: new Date().toISOString(),
              })
            );

            dispatch(
              createNotification({
                open: true,
                type: parsedMessage.type || "info",
                message: parsedMessage.message,
              })
            );

            //  dispatch(setGlobalNotifications(true));

            // // Update the state
            // dispatch(
            //   setGlobalNotifications([...globalNotifications, parsedMessage])
            // );
          }
        } catch (err) {
          console.error("Error parsing MQTT message:", err);
        }
      });

      return () => {
        mqttClient.end();
      };
    }
  }, [mqttConnectUrl, userProfile]);

  return null;
};

export default MQTTNotification;
