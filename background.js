chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "translate",
    title: "Translate selected text",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "translate") {
    chrome.storage.sync.get("targetLanguage", (data) => {
      const targetLanguage = data.targetLanguage || "es"; // Default to Spanish if not set
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: translateText,
        args: [info.selectionText, targetLanguage]
      });
    });
  }
});

function translateText(selectedText, targetLanguage) {
  const sourceLanguage = "en"; // Source language code
  const encodedText = encodeURIComponent(selectedText);

  const url = `https://api.mymemory.translated.net/get?q=${encodedText}&langpair=${sourceLanguage}|${targetLanguage}`;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      const translatedText = data.responseData.translatedText;

      // Replace selected text in the DOM
      const range = window.getSelection().getRangeAt(0);
      range.deleteContents();
      range.insertNode(document.createTextNode(translatedText));
    })
    .catch(error => console.error('Error:', error));
}
