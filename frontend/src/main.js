// import './style.css'
// import javascriptLogo from './assets/javascript.svg'
// import viteLogo from './assets/vite.svg'
// import heroImg from './assets/hero.png'
// import { setupCounter } from './counter.js'
//
// document.querySelector('#app').innerHTML = `
// <section id="center">
//   <div class="hero">
//     <img src="${heroImg}" class="base" width="170" height="179">
//     <img src="${javascriptLogo}" class="framework" alt="JavaScript logo"/>
//     <img src="${viteLogo}" class="vite" alt="Vite logo" />
//   </div>
//   <div>
//     <h1>Get started</h1>
//     <p>Edit <code>src/main.js</code> and save to test <code>HMR</code></p>
//   </div>
//   <button id="counter" type="button" class="counter"></button>
// </section>
//
// <div class="ticks"></div>
//
// <section id="next-steps">
//   <div id="docs">
//     <svg class="icon" role="presentation" aria-hidden="true"><use href="/icons.svg#documentation-icon"></use></svg>
//     <h2>Documentation</h2>
//     <p>Your questions, answered</p>
//     <ul>
//       <li>
//         <a href="https://vite.dev/" target="_blank">
//           <img class="logo" src="${viteLogo}" alt="" />
//           Explore Vite
//         </a>
//       </li>
//       <li>
//         <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank">
//           <img class="button-icon" src="${javascriptLogo}" alt="">
//           Learn more
//         </a>
//       </li>
//     </ul>
//   </div>
//   <div id="social">
//     <svg class="icon" role="presentation" aria-hidden="true"><use href="/icons.svg#social-icon"></use></svg>
//     <h2>Connect with us</h2>
//     <p>Join the Vite community</p>
//     <ul>
//       <li><a href="https://github.com/vitejs/vite" target="_blank"><svg class="button-icon" role="presentation" aria-hidden="true"><use href="/icons.svg#github-icon"></use></svg>GitHub</a></li>
//       <li><a href="https://chat.vite.dev/" target="_blank"><svg class="button-icon" role="presentation" aria-hidden="true"><use href="/icons.svg#discord-icon"></use></svg>Discord</a></li>
//       <li><a href="https://x.com/vite_js" target="_blank"><svg class="button-icon" role="presentation" aria-hidden="true"><use href="/icons.svg#x-icon"></use></svg>X.com</a></li>
//       <li><a href="https://bsky.app/profile/vite.dev" target="_blank"><svg class="button-icon" role="presentation" aria-hidden="true"><use href="/icons.svg#bluesky-icon"></use></svg>Bluesky</a></li>
//     </ul>
//   </div>
// </section>
//
// <div class="ticks"></div>
// <section id="spacer"></section>
// `
//
// setupCounter(document.querySelector('#counter'))

import "./style.css";

/* -------------------------
   API: загрузка сообщения
-------------------------- */
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

/* -------------------------
   DOM
-------------------------- */
const messages = document.getElementById("messages");
const input = document.getElementById("msg");
const sendButton = document.getElementById("send-btn");

/* -------------------------
   WebSocket (stable version)
-------------------------- */
let ws;
let isConnected = false;
let reconnectTimer = null;

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

    // авто-reconnect
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

/* -------------------------
   Send message
-------------------------- */
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

/* -------------------------
   Events
-------------------------- */
sendButton?.addEventListener("click", sendMessage);

input?.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    sendMessage();
  }
});