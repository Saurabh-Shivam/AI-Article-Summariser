document.getElementById("summarize").addEventListener("click", async () => {
  const resultDiv = document.getElementById("result");
  resultDiv.innerHTML = '<div class="loading"><div class="loader"></div></div>';

  const summaryType = document.getElementById("summary-type").value;

  // Get Gemini API key from storage
  chrome.storage.sync.get(["geminiApiKey"], async (result) => {
    const geminiApiKey = result.geminiApiKey;
    if (!geminiApiKey) {
      resultDiv.innerHTML =
        "<span style='color:red;'>No Gemini API key found. Please set your Gemini API key in the extension options.</span>";
      return;
    }
    try {
      // Get the active tab
      const [tab] = await new Promise((resolve, reject) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
          else resolve(tabs);
        });
      });
      // Send message to content script to get article text
      const res = await new Promise((resolve) => {
        chrome.tabs.sendMessage(
          tab.id,
          { type: "GET_ARTICLE_TEXT" },
          (response) => resolve(response)
        );
      });
      if (!res || !res.text) {
        resultDiv.innerHTML =
          "<span style='color:red;'>Could not extract article text from this page. Try reloading the page and summarizing again.</span>";
        return;
      }
      const summary = await getGeminiSummary(
        res.text,
        summaryType,
        geminiApiKey
      );
      resultDiv.innerText = summary;
    } catch (error) {
      resultDiv.innerHTML = `<span style='color:red;'>Error: ${
        error.message || "Failed to generate summary."
      }</span>`;
    }
  });
});

// for copying content
document.getElementById("copy-btn").addEventListener("click", () => {
  const summaryText = document.getElementById("result").innerText;

  if (summaryText && summaryText.trim() !== "") {
    navigator.clipboard
      .writeText(summaryText)
      .then(() => {
        const copyBtn = document.getElementById("copy-btn");
        const originalText = copyBtn.innerText;

        copyBtn.innerText = "Copied!";
        setTimeout(() => {
          copyBtn.innerText = originalText;
        }, 2000);
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
  }
});

// Add result-pleasing class for better appearance
const resultDiv = document.getElementById("result");
resultDiv.classList.add("result-pleasing");

// text to speech button
const ttsBtn = document.getElementById("tts-btn");
let isSpeaking = false;
let utterance = null;

ttsBtn.addEventListener("click", () => {
  const summaryText = resultDiv.innerText;
  if (!summaryText || summaryText.trim() === "") {
    return;
  }
  if (isSpeaking) {
    window.speechSynthesis.cancel();
    return;
  }
  utterance = new window.SpeechSynthesisUtterance(summaryText);
  utterance.rate = 1;
  utterance.pitch = 1;
  utterance.lang = "en-US";
  utterance.onend = () => {
    isSpeaking = false;
    ttsBtn.innerText = "Listen to Summary";
  };
  utterance.onerror = () => {
    isSpeaking = false;
    ttsBtn.innerText = "Listen to Summary";
  };
  isSpeaking = true;
  ttsBtn.innerText = "Stop Listening";
  window.speechSynthesis.speak(utterance);
});
// If speech is stopped by other means, reset button
window.speechSynthesis.addEventListener("end", () => {
  isSpeaking = false;
  ttsBtn.innerText = "Listen to Summary";
});
window.speechSynthesis.addEventListener("voiceschanged", () => {
  if (!window.speechSynthesis.speaking) {
    isSpeaking = false;
    ttsBtn.innerText = "Listen to Summary";
  }
});

// dowbnload summafry as pdf button
document.getElementById("download-pdf-btn").addEventListener("click", () => {
  const summaryText = document.getElementById("result").innerText;
  if (!summaryText || summaryText.trim() === "") {
    return;
  }
  // Check if jsPDF is available
  if (window.jsPDF) {
    try {
      const doc = new window.jsPDF();

      // Set font and size
      doc.setFont("helvetica");
      doc.setFontSize(12);

      // Add title
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Article Summary", 20, 20);

      // Add content
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");

      // Split text into lines that fit the page width
      const maxWidth = 170;
      const lineHeight = 6;
      let yPosition = 35;

      const lines = doc.splitTextToSize(summaryText, maxWidth);

      for (let i = 0; i < lines.length; i++) {
        // Check if we need a new page
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(lines[i], 20, yPosition);
        yPosition += lineHeight;
      }

      // Save the PDF
      doc.save("article-summary.pdf");
    } catch (error) {
      console.error("Error generating PDF:", error);
      // Fallback to text download
      downloadAsText(summaryText);
    }
  } else {
    // Fallback: download as TXT
    downloadAsText(summaryText);
  }
});

function downloadAsText(summaryText) {
  const blob = new Blob([summaryText], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "summary.txt";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

async function getGeminiSummary(text, summaryType, apiKey) {
  // Truncating very long texts to avoid API limits (typically around 30K tokens)
  const maxLength = 20000;
  const truncatedText =
    text.length > maxLength ? text.substring(0, maxLength) + "..." : text;

  let prompt;
  switch (summaryType) {
    case "brief":
      prompt = `Provide a brief summary of the following article in 2-3 sentences:\n\n${truncatedText}`;
      break;
    case "detailed":
      prompt = `Provide a detailed summary of the following article, covering all main points and key details:\n\n${truncatedText}`;
      break;
    case "bullets":
      prompt = `Summarize the following article in 5-7 key points. Format each point as a line starting with "- " (dash followed by a space). Do not use asterisks or other bullet symbols, only use the dash. Keep each point concise and focused on a single key insight from the article:\n\n${truncatedText}`;
      break;
    default:
      prompt = `Summarize the following article:\n\n${truncatedText}`;
  }

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.2,
          },
        }),
      }
    );

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error?.message || "API request failed");
    }

    const data = await res.json();
    return (
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No summary available."
    );
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to generate summary. Please try again later.");
  }
}
