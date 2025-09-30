import { useEffect, useState } from "react";
import { getFromStorage, STORAGE_KEYS } from "@/utils/storage";
import './Popup.css';

export default function Popup() {
  const [busy, setBusy] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [currentUrl, setCurrentUrl] = useState<string>("");

  useEffect(() => {
    Promise.all([
      getFromStorage(STORAGE_KEYS.firecrawlKey),
      getFromStorage(STORAGE_KEYS.mistralKey)
    ]).then(([firecrawlKey, mistralKey]) => {
      setIsConfigured(!!(firecrawlKey?.trim() && mistralKey?.trim()));
    }).catch(error => {
      setIsConfigured(false);
    });

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.url) {
        setCurrentUrl(tabs[0].url);
      }
    });

    chrome.runtime.sendMessage({ type: 'GET_EXTRACTION_STATE' }, (response) => {
      if (response && response.isExtracting) {
        setBusy(true);
      }
    });

  }, []);

  const cancelOperation = () => {
    chrome.runtime.sendMessage({ type: 'CANCEL_EXTRACTION' });
    setBusy(false);
  };

  const extractEvents = () => {
    if (!isConfigured) {
      chrome.runtime.openOptionsPage();
      return;
    }

    setBusy(true);

    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const tab = tabs[0];
      if (!tab?.id) {
        alert('No active tab found');
        setBusy(false);
        return;
      }

      if (chrome.sidePanel?.open) {
        chrome.sidePanel.open({ tabId: tab.id }).catch(() => {
          chrome.windows.create({
            url: chrome.runtime.getURL('src/pages/panel/index.html'),
            type: 'popup',
            width: 600,
            height: 800
          }).catch(() => {});
        });
      } else {
        chrome.windows.create({
          url: chrome.runtime.getURL('src/pages/panel/index.html'),
          type: 'popup',
          width: 600,
          height: 800
        }).catch(() => {});
      }

      try {
        const response = await chrome.runtime.sendMessage({
          type: 'EXTRACT_EVENTS',
          tabId: tab.id
        });

        if (!response?.success) {
          throw new Error(response?.error || 'Extraction failed');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        alert(`Failed to extract events: ${errorMessage}`);
      } finally {
        setBusy(false);
      }
    });
  };

  const openOptions = () => chrome.runtime.openOptionsPage();

  const getDomainFromUrl = (url: string): string => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  };

  const openPanel = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id && chrome.sidePanel?.open) {
        chrome.sidePanel.open({ tabId: tabs[0].id }).catch(() => {
          chrome.windows.create({
            url: chrome.runtime.getURL('src/pages/panel/index.html'),
            type: 'popup',
            width: 600,
            height: 800
          }).catch(() => {});
        });
      } else {
        // Fallback to popup window
        chrome.windows.create({
          url: chrome.runtime.getURL('src/pages/panel/index.html'),
          type: 'popup',
          width: 600,
          height: 800
        }).catch(() => {});
      }
    });
  };

  return (
    <div className="popup-root">
      <header className="popup-header">
        <h1 className="popup-title">
          <img src="/icon-32.png" alt="EzCal" className="popup-logo" />
          EzCal
        </h1>
        <span className="popup-version">
          v1.0
        </span>
      </header>
      


      {!isConfigured && (
        <div className="config-warning">
          <div className="config-warning-content">
            <span>⚠️</span>
            <span className="config-warning-text">API keys required</span>
          </div>
          <p className="config-warning-description">
            Configure Firecrawl and Mistral API keys in options.
          </p>
        </div>
      )}

      <div className="popup-content">
        <div className="current-url">
          <span>🌐</span>
          <span className="current-url-text" title={currentUrl}>
            {getDomainFromUrl(currentUrl)}
          </span>
        </div>

        {busy ? (
          <div className="extract-busy-section">
            <button disabled className="extract-button">
              <div className="extract-button-content">
                <div className="loading-spinner"></div>
                <span>Extracting...</span>
              </div>
            </button>
            <button
              onClick={cancelOperation}
              className="cancel-button"
              title="Cancel operation"
            >
              ❌
            </button>
          </div>
        ) : (
          <button
            onClick={extractEvents}
            className="extract-button"
          >
            <div className="extract-button-content">
              <span>🔍</span>
              <span>Extract Events</span>
            </div>
          </button>
        )}

        <div className="action-buttons">
          <button
            onClick={openOptions}
            className="action-button"
          >
            ⚙️ Settings
          </button>

          <button
            onClick={() => openPanel()}
            className="panel-button"
            title="Open Events Panel"
          >
            Panel
          </button>
        </div>
      </div>
    </div>
  );
}


