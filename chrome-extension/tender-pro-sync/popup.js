const defaultEndpoint = "https://tender-pro-gamma.vercel.app/api/mahatender/import";
const endpointInput = document.getElementById("endpoint");
const saveButton = document.getElementById("save");
const syncButton = document.getElementById("sync");
const statusText = document.getElementById("status");

function setStatus(message) {
  statusText.textContent = message;
}

async function getActiveTab() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  return tabs[0];
}

async function loadEndpoint() {
  const data = await chrome.storage.sync.get(["endpoint"]);
  endpointInput.value = data.endpoint || defaultEndpoint;
}

async function saveEndpoint() {
  await chrome.storage.sync.set({ endpoint: endpointInput.value.trim() || defaultEndpoint });
  setStatus("API URL saved.");
}

async function readPageText(tabId) {
  const [result] = await chrome.scripting.executeScript({
    target: { tabId },
    func: () => ({
      text: document.body ? document.body.innerText : "",
      pageUrl: location.href,
      title: document.title,
    }),
  });

  return result.result;
}

async function syncVisiblePage() {
  syncButton.disabled = true;
  setStatus("Reading visible MahaTender page...");

  try {
    const endpoint = endpointInput.value.trim() || defaultEndpoint;
    const tab = await getActiveTab();

    if (!tab?.id) {
      setStatus("No active tab found.");
      return;
    }

    const page = await readPageText(tab.id);
    if (!page.text || page.text.length < 30) {
      setStatus("No readable page text found. Open tender list/details page and try again.");
      return;
    }

    setStatus("Sending data to Tender Pro...");
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: page.text,
        pageUrl: page.pageUrl,
        pageTitle: page.title,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      setStatus(data.error || "Tender Pro rejected this page. Open tender list/details and try again.");
      return;
    }

    setStatus(
      `Done. Synced ${data.imported} tender(s). Created ${data.created}, updated ${data.updated}.`,
    );
  } catch (error) {
    setStatus("Sync failed. Check that you are on MahaTender and Tender Pro URL is correct.");
  } finally {
    syncButton.disabled = false;
  }
}

saveButton.addEventListener("click", saveEndpoint);
syncButton.addEventListener("click", syncVisiblePage);
loadEndpoint();
