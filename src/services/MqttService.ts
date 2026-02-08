import mqtt, { MqttClient, IClientOptions } from "mqtt";
import dotenv from "dotenv";

/* ENV */
const BROKER_URL = process.env.MQTT_BROKER_URL;
const USERNAME = process.env.MQTT_USERNAME;
const PASSWORD = process.env.MQTT_PASSWORD;

// 3. Define the Message Payload
interface SensorData {
  deviceId: string;
  temperature: number;
  timestamp: string;
}

dotenv.config();

type MessageHandler = (payload: any, topic: string) => void;

// 1. Connection Configuration
const options: IClientOptions = {
  protocol: "wss",
  username: USERNAME,
  password: PASSWORD,
  clientId: `react-${crypto.randomUUID()}`,
  clean: true,
  reconnectPeriod: 2000,
  connectTimeout: 10_000,
};

const topic = "/agrosync/sensordata";
const payload: SensorData = {
  deviceId: "sensor-01",
  temperature: 22.5,
  timestamp: new Date().toISOString(),
};

interface Subscription {
  topicPattern: string;
  regex: RegExp;
  handler: MessageHandler;
}

class MqttService {
  private client: MqttClient | null = null;
  private subscriptions: Subscription[] = [];
  private readonly brokerUrl: string = BROKER_URL as string;

  constructor() {
    this.connect();
  }

  private connect(): void {
    this.client = mqtt.connect(this.brokerUrl, options);

    this.client.on('connect', () => {
      console.log('🟢 MQTT Client Connected');
    });

    this.client.on('error', (err) => {
      console.error('🔴 MQTT Connection Error:', err);
    });

    this.client.on("message", (incomingTopic, buffer) => {
      const message = this.parsePayload(buffer);

      // Find all subscriptions that match this incoming topic
      this.subscriptions.forEach((sub) => {
        if (sub.regex.test(incomingTopic)) {
          sub.handler(message, incomingTopic);
        }
      });
    });
  }

  /**
   * Converts MQTT wildcards (+ and #) into Regular Expressions
   */
  private topicToRegex(topic: string): RegExp {
    const pattern = topic
      .replace(/\+/g, "[^/]+") // Single level wildcard
      .replace(/#/g, ".*") // Multi level wildcard
      .replace(/\//g, "\\/"); // Escape slashes
    return new RegExp(`^${pattern}$`);
  }

  private parsePayload(buffer: Buffer): any {
    try {
      return JSON.parse(buffer.toString());
    } catch {
      return buffer.toString();
    }
  }

  /**
   * Publish a JSON message to a specific topic
   */
  public publish(topic: string, payload: object): void {
    if (!this.client?.connected) {
      console.warn("⚠️ MQTT not connected. Message skipped.");
      return;
    }

    const message = JSON.stringify(payload);
    this.client.publish(topic, message, { qos: 1 }, (err) => {
      if (err) console.error(`❌ Failed to publish to ${topic}`, err);
    });
    console.log(`✅ published message on topic: ${topic}`);
  }

  /**
   * Registers a handler for a specific topic or wildcard pattern
   */
  public on(topicPattern: string, handler: MessageHandler): void {
    if (!this.client) return;

    this.client.subscribe(topicPattern, (err) => {
      if (!err) {
        this.subscriptions.push({
          topicPattern,
          regex: this.topicToRegex(topicPattern),
          handler,
        });
        console.log(`📡 Registered handler for: ${topicPattern}`);
      }
    });
  }
}

export const mqttService = new MqttService();
