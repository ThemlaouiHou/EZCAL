import { useEffect, useState } from "react";
import { getSync, setSync, STORAGE_KEYS } from "@/utils/storage";
import { MISTRAL_MODEL } from "@/services/ai-mistral";
import './Options.css';

export default function Options() {
  const [fc, setFc] = useState("");
  const [mk, setMk] = useState("");
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState({ firecrawl: false, mistral: false });
  const [testResults, setTestResults] = useState<{ firecrawl: string | null; mistral: string | null }>({ firecrawl: null, mistral: null });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setFc((await getSync<string>(STORAGE_KEYS.firecrawlKey)) || "");
    setMk((await getSync<string>(STORAGE_KEYS.mistralKey)) || "");
  };

  const save = async () => {
    const keysToSave = {
      [STORAGE_KEYS.firecrawlKey]: fc.trim(),
      [STORAGE_KEYS.mistralKey]: mk.trim(),
    };


    try {
      await setSync(keysToSave);
      const verification = await Promise.all([
        getSync(STORAGE_KEYS.firecrawlKey),
        getSync(STORAGE_KEYS.mistralKey)
      ]);

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      alert('Failed to save: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  const testFirecrawl = async () => {
    if (!fc.trim()) return;

    setTesting(prev => ({ ...prev, firecrawl: true }));
    try {
      const response = await fetch('https://api.firecrawl.dev/v2/scrape', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${fc.trim()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: 'https://example.com',
          formats: ['markdown']
        })
      });

      const data = await response.json();
      setTestResults(prev => ({
        ...prev,
        firecrawl: response.ok ? 'success' : `Error: ${data.error || response.statusText}`
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        firecrawl: `Network error: ${error instanceof Error ? error.message : String(error)}`
      }));
    } finally {
      setTesting(prev => ({ ...prev, firecrawl: false }));
    }
  };

  const testMistral = async () => {
    if (!mk.trim()) return;

    setTesting(prev => ({ ...prev, mistral: true }));
    try {
      const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${mk.trim()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: MISTRAL_MODEL,
          messages: [{ role: 'user', content: 'Hello' }],
          max_tokens: 10
        })
      });

      const data = await response.json();
      setTestResults(prev => ({
        ...prev,
        mistral: response.ok ? 'success' : `Error: ${data.error?.message || response.statusText}`
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        mistral: `Network error: ${error instanceof Error ? error.message : String(error)}`
      }));
    } finally {
      setTesting(prev => ({ ...prev, mistral: false }));
    }
  };


  return (
    <div className="options-root">
      <div className="options-container">
        <header className="options-header">
          <h1 className="options-title">
            EzCal Settings
          </h1>
          <p className="options-description">
            Configure your API keys to extract calendar events from web pages using AI.
          </p>
        </header>

        <div className="options-content">
          {/* API Configuration */}
          <section className="options-section">
            <h2 className="section-title">
              🔑 API Configuration
            </h2>

            <div className="form-group">
              <div className="form-field">
                <label className="field-label">
                  Firecrawl API Key
                  <a href="https://firecrawl.dev" target="_blank" rel="noopener noreferrer"
                    className="field-link">
                    (Get API key)
                  </a>
                </label>
                <div className="input-group">
                  <input
                    type="password"
                    className="field-input"
                    value={fc}
                    onChange={e => setFc(e.target.value)}
                    placeholder="fc-..."
                  />
                  <button
                    onClick={testFirecrawl}
                    disabled={!fc.trim() || testing.firecrawl}
                    className="test-button"
                  >
                    {testing.firecrawl ? '⏳' : 'Test'}
                  </button>
                </div>
                {testResults.firecrawl && (
                  <p className={`test-result ${testResults.firecrawl === 'success'
                    ? 'success'
                    : 'error'
                    }`}>
                    {testResults.firecrawl === 'success'
                      ? '✅ Connection successful!'
                      : testResults.firecrawl
                    }
                  </p>
                )}
              </div>

              <div className="form-field">
                <label className="field-label">
                  Mistral AI API Key
                  <a href="https://console.mistral.ai/" target="_blank" rel="noopener noreferrer"
                    className="field-link">
                    (Get API key)
                  </a>
                </label>
                <div className="input-group">
                  <input
                    type="password"
                    className="field-input"
                    value={mk}
                    onChange={e => setMk(e.target.value)}
                    placeholder="sk-..."
                  />
                  <button
                    onClick={testMistral}
                    disabled={!mk.trim() || testing.mistral}
                    className="test-button"
                  >
                    {testing.mistral ? '⏳' : 'Test'}
                  </button>
                </div>
                {testResults.mistral && (
                  <p className={`test-result ${testResults.mistral === 'success'
                    ? 'success'
                    : 'error'
                    }`}>
                    {testResults.mistral === 'success'
                      ? '✅ Connection successful!'
                      : testResults.mistral
                    }
                  </p>
                )}
              </div>

              <div className="form-field">
                <label className="field-label">
                  AI Model
                </label>
                <div className="field-info">
                  {MISTRAL_MODEL}
                </div>
              </div>
            </div>
          </section>

          {/* Save Button */}
          <div className="save-actions">
            <button
              onClick={save}
              className="save-button"
            >
              💾 Save Configuration
            </button>

            {saved && (
              <div className="save-status">
                ✅ Saved!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
