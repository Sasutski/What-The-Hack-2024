#include <WiFi.h>
#include <WebSocketsClient.h>
#include <ArduinoJson.h>
#include <HTTPClient.h>
const char* ssid = "AndroidAP08a7";
const char* password = "xglv1607";
const char* websocketServer = "192.168.122.54"; // Replace with your server's IP
const int websocketPort = 3000;

WebSocketsClient webSocket;

void setup() {
  pinMode(12,OUTPUT);
    Serial.begin(115200);

    // Connect to Wi-Fi
    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println("Connected to Wi-Fi");

    // Connect to WebSocket server
    webSocket.begin(websocketServer, websocketPort, "/");
    webSocket.onEvent(webSocketEvent);
    turnLightOn(true);
}

void loop() {
    webSocket.loop();
}

// Handle WebSocket Events
void webSocketEvent(WStype_t type, uint8_t *payload, size_t length) {
    switch (type) {
        case WStype_DISCONNECTED:
            Serial.println("WebSocket disconnected.");
            break;

        case WStype_CONNECTED:
            Serial.println("WebSocket connected.");
            break;

        case WStype_TEXT: {
            Serial.printf("Message from server: %s\n", payload);
            // Parse incoming JSON
            StaticJsonDocument<200> doc; // Define inside this case
            DeserializationError error = deserializeJson(doc, payload);

            if (!error) {
                if (doc["type"] == "lightState") {
                    bool lightOn = doc["lightOn"];
                    Serial.printf("Light is now %s\n", lightOn ? "On" : "Off");
                    if (lightOn) {
                      digitalWrite(12,HIGH);
                    } else {
                      digitalWrite(12,LOW);
                    }
                } else if (doc["type"] == "fanSpeed") {
                    int fanSpeed = doc["speed"];
                    Serial.printf("Fan speed set to %d\n", fanSpeed);
                }
            } else {
                Serial.println("Failed to parse incoming message.");
            }
            break;
        }

        default:
            break;
    }
}

void turnLightOn(bool lightOn) {
    if (WiFi.status() == WL_CONNECTED) {
        HTTPClient http;
        http.begin("http://192.168.122.54:3000/light");
        http.addHeader("Content-Type", "application/json");

        StaticJsonDocument<200> doc;
        doc["lightOn"] = lightOn;
        String payload;
        serializeJson(doc, payload);

        int httpResponseCode = http.POST(payload);

        if (httpResponseCode > 0) {
            String response = http.getString();
            Serial.printf("Light state updated. Server response: %s\n", response.c_str());
            if (lightOn){
                digitalWrite(12,HIGH);
            }
        } else {
            Serial.printf("Error in sending light state: %d\n", httpResponseCode);
        }

        http.end();
    } else {
        Serial.println("Wi-Fi not connected");
    }
}
