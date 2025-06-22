# 🧠 AI Article Summariser – Chrome Extension

AI Article Summariser is a Chrome extension that intelligently extracts and summarizes web articles using **Gemini AI**. Designed for busy professionals, students, and researchers, it transforms long-form content into easy-to-consume formats, enhancing productivity and accessibility.

---
## 🚀 Features

### ✨ Summarization Modes

* 🧾 **Brief Summary** – Condensed 1-2 line overview
* 📜 **Descriptive Summary** – Paragraph-style in-depth explanation
* 📌 **Bullet Point Summary** – Key takeaways in bullet format

### 🛠️ Utility Features

* 📋 **Copy to Clipboard** – One-click copy for quick sharing
* 🔊 **Text-to-Speech (TTS)** – Listen to the generated summary using audio
* 📥 **Download Summary** – Save the summary as a text file for offline reading

---

## 🤖 Powered by Gemini AI

Summaries are generated using **Google's Gemini AI model**, known for its contextual understanding and coherent natural language generation. This integration provides:

* High-quality, context-aware summaries
* Support for various writing tones and structures
* Fast and reliable output for real-time interaction

---

## 🛠️ Tech Stack

| Layer              | Technology                           |
| ------------------ | ------------------------------------ |
| Frontend UI        | HTML, CSS, JavaScript                |
| Extension Platform | Chrome Manifest V3                   |
| Backend Logic      | Content Scripts, Service Workers     |
| AI Integration     | Gemini AI (via API)                  |
| Browser APIs       | Chrome Scripting, Storage, ActiveTab |

---

## 📁 Project Structure

```
AI Article Summariser/
│
├── manifest.json            # Extension configuration and permissions
├── background.js            # Service worker for background tasks
├── content.js               # Script injected into web pages to extract content
├── icon.png                 # Extension icon
├── popup.html               # Main UI popup displayed on extension click
├── popup.js                 # Logic for handling summarization and display
├── options.html             # Settings page for user preferences
└── options.js               # Handles storage and retrieval of settings
```

---

## 🧩 Permissions Used

* `activeTab` – Access the current tab to read article content
* `scripting` – Dynamically inject content scripts
* `storage` – Save and retrieve user settings
* `<all_urls>` – Operates across all websites

---

## 📈 How It Works

1. When a user visits an article, the extension injects `content.js` to extract the readable text.
2. On clicking the extension icon, `popup.html` appears, letting the user choose a summary type.
3. The content is sent to **Gemini AI**, and the response is rendered in the popup.
4. Users can:

   * Copy the summary
   * Listen via TTS
   * Download the summary

---

## 🔮 Future Enhancements

* 🌐 Language translation
* 💬 Chat-based Q\&A on article context
* 📲 Companion mobile app
* 🧑‍🎓 Educational integration for schools and research
* ☁️ Cloud sync for saved summaries

---

## 📸 Demo Video

https://github.com/user-attachments/assets/ca51035c-19b1-41f6-b79c-a233e8551def


