import "./style.css";

const messages = document.getElementById("messages");
const input = document.getElementById("msg");
const sendButton = document.getElementById("send-btn");

let ws;
let isConnected = false;
let reconnectTimer = null;

async function loadMessage() {
  try {
    const res = await fetch("/api/message");

    if (!res.ok) {
      console.error("HTTP error:", res.status);
      return;
    }

    const data = await res.json();

    if (!data?.message) {
      console.error("Empty response");
      return;
    }

    console.log("API message:", data.message);
  } catch (err) {
    console.error("Error loading message:", err);
  }
}

loadMessage();

function connectWS() {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const url = `${protocol}//${window.location.host}/ws`;

  ws = new WebSocket(url);

  ws.addEventListener("open", () => {
    console.log("✅ WebSocket connected");
    isConnected = true;

    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
  });

  ws.addEventListener("message", (event) => {
    if (!messages) return;

    const el = document.createElement("div");
    el.textContent = event.data;

    messages.appendChild(el);
    messages.scrollTop = messages.scrollHeight;
  });

  ws.addEventListener("close", () => {
    console.log("❌ WebSocket closed");
    isConnected = false;

    reconnectTimer = setTimeout(() => {
      console.log("🔄 Reconnecting WebSocket...");
      connectWS();
    }, 1500);
  });

  ws.addEventListener("error", () => {
    console.log("⚠️ WebSocket error");
    ws.close();
  });
}

connectWS();

function sendMessage() {
  if (!input || !messages) return;

  const text = input.value.trim();
  if (!text) return;

  if (!ws || !isConnected || ws.readyState !== WebSocket.OPEN) {
    console.error("WebSocket is not connected");
    return;
  }

  ws.send(text);

  input.value = "";
  input.focus();
}

sendButton?.addEventListener("click", sendMessage);

input?.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    sendMessage();
  }
});
