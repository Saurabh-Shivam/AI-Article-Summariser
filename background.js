// Add this file to the extension
chrome.runtime.onInstalled.addListener(() => {
  // This will prompt the user to enter their API keys on first install
  chrome.storage.sync.get(["geminiApiKey", "openaiApiKey"], (result) => {
    if (!result.geminiApiKey || !result.openaiApiKey) {
      chrome.tabs.create({
        url: "options.html",
      });
    }
  });
});
