const defaultEndpoint = "https://tender-pro-gamma.vercel.app/api/mahatender/import";
const endpointInput = document.getElementById("endpoint");
const saveButton = document.getElementById("save");
const syncButton = document.getElementById("sync");
const deepScanButton = document.getElementById("deepScan");
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
      tables: Array.from(document.querySelectorAll("table")).map((table) =>
        Array.from(table.querySelectorAll("tr"))
          .map((row) =>
            Array.from(row.querySelectorAll("th,td"))
              .map((cell) => cell.innerText.replace(/\s+/g, " ").trim())
              .filter(Boolean),
          )
          .filter((cells) => cells.length >= 3),
      ),
      links: Array.from(document.querySelectorAll("a"))
        .map((link) => ({
          text: link.innerText.replace(/\s+/g, " ").trim(),
          href: link.href,
        }))
        .filter((link) => link.href && !link.href.startsWith("javascript:")),
    }),
  });

  return result.result;
}

async function syncPage(endpoint, page) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text: page.text,
      pageUrl: page.pageUrl,
      pageTitle: page.title,
      tables: page.tables || [],
    }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Tender Pro rejected this page.");
  return data;
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
    const data = await syncPage(endpoint, page);
    setStatus(
      `Done. Synced ${data.imported} tender(s). Created ${data.created}, updated ${data.updated}, bidders ${data.biddersSynced || 0}.`,
    );
  } catch (error) {
    setStatus("Sync failed. Check that you are on MahaTender and Tender Pro URL is correct.");
  } finally {
    syncButton.disabled = false;
  }
}

function candidateDetailLinks(page) {
  const seen = new Set();
  const current = new URL(page.pageUrl);

  return (page.links || [])
    .filter((link) => {
      try {
        const url = new URL(link.href);
        const haystack = `${link.text} ${url.href}`.toLowerCase();
        const looksRelevant = /tender|detail|view|work|nit|bid|notice|auction|boq|corrigendum/.test(haystack);
        const sameSite = url.hostname === current.hostname;
        const notCurrent = url.href !== page.pageUrl;
        if (!looksRelevant || !sameSite || !notCurrent || seen.has(url.href)) return false;
        seen.add(url.href);
        return true;
      } catch {
        return false;
      }
    })
    .slice(0, 30);
}

function waitForTabComplete(tabId) {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      chrome.tabs.onUpdated.removeListener(listener);
      resolve();
    }, 12000);

    function listener(updatedTabId, changeInfo) {
      if (updatedTabId === tabId && changeInfo.status === "complete") {
        clearTimeout(timeout);
        chrome.tabs.onUpdated.removeListener(listener);
        setTimeout(resolve, 1200);
      }
    }

    chrome.tabs.onUpdated.addListener(listener);
  });
}

async function deepScanLinks() {
  deepScanButton.disabled = true;
  syncButton.disabled = true;
  setStatus("Finding tender detail links on this page...");

  try {
    const endpoint = endpointInput.value.trim() || defaultEndpoint;
    const tab = await getActiveTab();
    if (!tab?.id) {
      setStatus("No active tab found.");
      return;
    }

    const listPage = await readPageText(tab.id);
    const listResult = await syncPage(endpoint, listPage);
    const links = candidateDetailLinks(listPage);

    if (links.length === 0) {
      setStatus(
        `List synced ${listResult.imported} tender(s), but no separate detail links were found on this page.`,
      );
      return;
    }

    let created = listResult.created || 0;
    let updated = listResult.updated || 0;
    let imported = listResult.imported || 0;
    let biddersSynced = listResult.biddersSynced || 0;

    for (let index = 0; index < links.length; index += 1) {
      const link = links[index];
      setStatus(`Scanning detail ${index + 1}/${links.length}: ${link.text || link.href}`);
      const detailTab = await chrome.tabs.create({ url: link.href, active: false });
      await waitForTabComplete(detailTab.id);
      const detailPage = await readPageText(detailTab.id);
      detailPage.pageUrl = link.href;
      const detailResult = await syncPage(endpoint, detailPage);
      imported += detailResult.imported || 0;
      created += detailResult.created || 0;
      updated += detailResult.updated || 0;
      biddersSynced += detailResult.biddersSynced || 0;
      await chrome.tabs.remove(detailTab.id);
    }

    setStatus(`Deep scan done. Synced ${imported}. Created ${created}, updated ${updated}, bidders ${biddersSynced}.`);
  } catch (error) {
    setStatus(error.message || "Deep scan failed. Try syncing the visible page first.");
  } finally {
    deepScanButton.disabled = false;
    syncButton.disabled = false;
  }
}

saveButton.addEventListener("click", saveEndpoint);
syncButton.addEventListener("click", syncVisiblePage);
deepScanButton.addEventListener("click", deepScanLinks);
loadEndpoint();
