const chatBox = document.getElementById("chat");
const userInput = document.getElementById("userInput");
const ttsAudio = document.getElementById("ttsAudio");

async function sendMessage() {
  const message = userInput.value.trim();
  if (!message) return;

  appendMessage("You", message, "user");
  userInput.value = "";

  try {
    const res = await fetch("http://127.0.0.1:5000/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    const data = await res.json();
    if (data.reply) {
      appendMessage("Bot", data.reply, "bot");
      playVoice(data.reply);
    } else {
      appendMessage("Bot", "Error: " + data.error, "bot");
    }
  } catch (err) {
    appendMessage("Bot", "Connection error", "bot");
  }
}

function appendMessage(sender, text, cls) {
  const p = document.createElement("p");
  p.className = cls;
  p.textContent = `${sender}: ${text}`;
  chatBox.appendChild(p);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function startVoice() {
  if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
    alert("Speech recognition not supported in this browser.");
    return;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = false;

  recognition.start();

  recognition.onresult = function (event) {
    const transcript = event.results[0][0].transcript;
    userInput.value = transcript;
    sendMessage();
  };

  recognition.onerror = function (event) {
    alert("Speech recognition error: " + event.error);
  };
}

async function playVoice(text) {
  try {
    const res = await fetch("http://127.0.0.1:5000/speak", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    if (!res.ok) {
      console.error("TTS error:", await res.text());
      return;
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    ttsAudio.src = url;
    ttsAudio.play();
  } catch (err) {
    console.error("Error playing voice:", err);
  }
}
