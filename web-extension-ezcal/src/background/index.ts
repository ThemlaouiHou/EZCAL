import { firecrawlScrapeMarkdown, firecrawlScrapeHTML } from "@/services/firecrawl";
import { mistralExtractFromMarkdown, mistralExtractFromHTML } from "@/services/ai-mistral";
import { getFromStorage, STORAGE_KEYS } from "@/utils/storage";
import { isWebmailPlatform } from "@/services/webmail-detector";
import type { EventItem } from "@/types/events";

interface ExtractionState {
  isExtracting: boolean;
  tabId?: number;
  url?: string;
  startTime?: number;
  abortController?: AbortController;
}

let extractionState: ExtractionState = { isExtracting: false };
const HISTORY_KEY = "extracted_events";

function extractEmailContent() {
  const selectors = ['[role="main"]', 'main', '.email-content', '.message-body'];
  
  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element?.textContent?.trim()) {
      let content = element.textContent.trim();
      
      if (content.length > 10000) {
        const parts = content.split(/(?:\n\s*){3,}/).filter(p => p.trim().length > 50);
        if (parts.length > 0) {
          content = parts.reduce((longest, current) => current.length > longest.length ? current : longest);
        }
      }
      
      return content;
    }
  }
  
  return document.body?.textContent?.trim() || '';
}

function sendMessageSafe(message: any) {
  try {
    const promise = chrome.runtime.sendMessage(message);
    promise?.catch(() => {});
  } catch (e) {}
  
  if (message.type === 'EXTRACTION_STARTED') {
    chrome.storage.local.set({ panelExtracting: true }).catch(() => {});
  } else if (message.type === 'EVENTS_EXTRACTED') {
    chrome.storage.local.set({ panelExtracting: false }).catch(() => {});
  }
}

async function performExtraction(tabId: number): Promise<EventItem[]> {
  const tab = await chrome.tabs.get(tabId);
  if (!tab?.url) throw new Error('No tab URL found');

  if (!chrome.scripting) {
    throw new Error('Scripting API not available');
  }

  const [firecrawlKey, mistralKey] = await Promise.all([
    getFromStorage(STORAGE_KEYS.firecrawlKey),
    getFromStorage(STORAGE_KEYS.mistralKey)
  ]);

  if (!firecrawlKey?.trim() || !mistralKey?.trim()) {
    throw new Error('API keys not configured');
  }

  const isWebmail = isWebmailPlatform(tab.url);
  let extractedEvents: EventItem[] = [];
  let success = false;

  try {
    if (isWebmail) {
      const emailResults = await chrome.scripting.executeScript({
        target: { tabId },
        func: extractEmailContent
      });
      
      const emailContent = emailResults?.[0]?.result;
      if (emailContent) {
        extractedEvents = await mistralExtractFromMarkdown(mistralKey.trim(), emailContent, tab.url);
        success = true;
      }
    } else {
      const result = await firecrawlScrapeMarkdown(
        firecrawlKey.trim(),
        tab.url,
        20000,
        extractionState.abortController?.signal
      );
      
      if (result.markdown?.trim()) {
        extractedEvents = await mistralExtractFromMarkdown(mistralKey.trim(), result.markdown, tab.url);
        success = true;
      }
    }
  } catch (error) {
  }

  if (!success) {
    try {
      const htmlResult = await firecrawlScrapeHTML(
        firecrawlKey.trim(),
        tab.url,
        20000,
        extractionState.abortController?.signal
      );
      
      if (htmlResult.html?.trim()) {
        extractedEvents = await mistralExtractFromHTML(mistralKey.trim(), htmlResult.html, tab.url);
      }
    } catch (error) {
    }
  }

  return extractedEvents;
}

function resetExtractionState() {
  extractionState.isExtracting = false;
  extractionState.tabId = undefined;
  extractionState.url = undefined;
  extractionState.startTime = undefined;
  extractionState.abortController = undefined;
}

async function saveExtractionState() {
  await chrome.storage.local.set({
    extractionState: {
      isExtracting: extractionState.isExtracting,
      tabId: extractionState.tabId,
      url: extractionState.url,
      startTime: extractionState.startTime
    }
  });
}

async function loadExtractionState() {
  const result = await chrome.storage.local.get(['extractionState']);
  if (result.extractionState) {
    extractionState = {
      ...result.extractionState,
      abortController: extractionState.isExtracting ? new AbortController() : undefined
    };
  }
}

chrome.runtime.onMessage.addListener((message: any, sender: any, sendResponse: any) => {
  if (message.type === 'EXTRACT_EVENTS') {
    (async () => {
      try {
        if (extractionState.isExtracting) {
          return { success: false, error: 'Extraction already in progress' };
        }

        extractionState.isExtracting = true;
        extractionState.tabId = message.tabId;
        extractionState.startTime = Date.now();
        extractionState.abortController = new AbortController();
        
        const tab = await chrome.tabs.get(message.tabId);
        extractionState.url = tab.url;
        
        await saveExtractionState();
        await chrome.storage.sync.set({ [HISTORY_KEY]: [] });
        sendMessageSafe({ type: 'EXTRACTION_STARTED' });

        if (typeof message.tabId !== 'number') {
          throw new Error('Tab ID is missing for extraction');
        }
        const events = await performExtraction(message.tabId);

        resetExtractionState();
        await saveExtractionState();

        if (events.length > 0) {
          await chrome.storage.sync.set({ [HISTORY_KEY]: events });
          sendMessageSafe({ type: 'EVENTS_EXTRACTED', events });
        } else {
          chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icon-128.png',
            title: 'EzCal',
            message: 'No events found on this page.'
          });
        }

        return { success: true };
      } catch (error) {
        resetExtractionState();
        await saveExtractionState();
        return { 
          success: false, 
          error: error instanceof Error ? error.message : String(error)
        };
      }
    })().then(sendResponse);
    
    return true;
  }

  if (message.type === 'GET_EXTRACTION_STATE') {
    sendResponse(extractionState);
    return false;
  }

  if (message.type === 'CANCEL_EXTRACTION') {
    if (extractionState.abortController) {
      extractionState.abortController.abort();
    }
    resetExtractionState();
    saveExtractionState();
    
    sendResponse({ success: true, ...extractionState });
    return false;
  }
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.tabs.query({}, (tabs: any) => {
    for (const t of tabs) {
      if (t.id && t.url?.startsWith('http')) {
        chrome.sidePanel?.setOptions?.({
          tabId: t.id,
          path: chrome.runtime.getURL("src/pages/panel/index.html"),
          enabled: true
        }).catch(() => {});
      }
    }
  });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url?.startsWith('http')) {
    chrome.sidePanel?.setOptions?.({
      tabId,
      path: chrome.runtime.getURL("src/pages/panel/index.html"),
      enabled: true
    }).catch(() => {});
  }
});

loadExtractionState();