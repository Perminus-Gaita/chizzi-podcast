import MQTTTestClient from "./client";

export const metadata = {
  title: "MQTT Test Client: Wufwuf - Test MQTT Connections",
  description: "Test MQTT connections, publish and subscribe to topics with Wufwuf.io's MQTT test client.",
  keywords: [
    "MQTT",
    "WebSocket",
    "IoT",
    "publish/subscribe",
    "messaging protocol",
    "wufwuf",
  ],
  openGraph: {
    title: "Test MQTT Connections with Wufwuf.io",
    description: "Wufwuf.io provides an MQTT test client for easy testing of MQTT connections and messaging.",
    image: "https://www.wufwuf.io/public/wufwuf_logo_1.png",
  },
};

const Page = () => {
  return <div><MQTTTestClient />;</div>
  
};

export default Page;