"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import mqtt from "mqtt";
import { Card, Input, Button, Typography } from "@mui/material";

const MQTTTestClient = () => {
  const [mqttUrl, setMqttUrl] = useState("");
  const [client, setClient] = useState(null);
  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");
  const [receivedMessages, setReceivedMessages] = useState([]);

  useEffect(() => {
    const getMqttConnection = async () => {
      try {
        const response = await axios.get("/api/.tests/mqtt");
        if (response.status === 200) {
          console.log("mqtt url recieved", response.data.webSocketsUrl)
          setMqttUrl(response.data.webSocketsUrl);
        }
      } catch (error) {
        console.error("Error fetching MQTT URL:", error);
      }
    };

    getMqttConnection();
  }, []);

  useEffect(() => {
    if (mqttUrl) {
      const mqttClient = mqtt.connect(mqttUrl);
      setClient(mqttClient);

      mqttClient.on("connect", () => {
        console.log("Connected to MQTT broker");
      });

      mqttClient.on("message", (topic, message) => {
        setReceivedMessages((prev) => [...prev, { topic, message: message.toString() }]);
      });

      return () => {
        mqttClient.end();
      };
    }
  }, [mqttUrl]);

  const handleSubscribe = () => {
    if (client && topic) {
      client.subscribe(topic);
      console.log(`Subscribed to topic: ${topic}`);
    }
  };

  const handlePublish = () => {
    if (client && topic && message) {
      client.publish(topic, JSON.stringify({message}));
      console.log(`Published message "${message}" to topic: ${topic}`);
    }
  };

  return (
    <Card sx={{ p: 3, maxWidth: 600, margin: "auto", mt: 4 }}>
      <Typography variant="h5" gutterBottom>MQTT Test Client</Typography>
      <Input
        fullWidth
        placeholder="Topic"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        sx={{ mb: 2 }}
      />
      <Input
        fullWidth
        placeholder="Message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        sx={{ mb: 2 }}
      />
      <Button variant="contained" onClick={handleSubscribe} sx={{ mr: 2 }}>Subscribe</Button>
      <Button variant="contained" onClick={handlePublish}>Publish</Button>
      <Typography variant="h6" sx={{ mt: 3 }}>Received Messages:</Typography>
      {receivedMessages.map((msg, index) => (
        <Typography key={index}>
          Topic: {msg.topic}, Message: {msg.message}
        </Typography>
      ))}
    </Card>
  );
};

export default MQTTTestClient;//