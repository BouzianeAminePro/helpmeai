import { useCallback, useEffect, useMemo, useState } from "preact/hooks";
import { ACTIONS, PROMPTS } from "./tools/enums";
import useSyncStorage, { ONE_MONTH_MS } from "./hooks/useSyncStorage";
import useModels from "./hooks/useModels";
import useGenerateResponse from "./hooks/useGenerateResponse";
import useClipboard from "./hooks/useClipboard";
import Header from "./components/Header";
import ChatDisplay from "./components/ChatDisplay";
import ActionButtons from "./components/ActionButtons";
import UserDisplay from "./components/UserDisplay";
import { FeedbackIcon } from "./components/ui/svgs/FeedbackIcon";
import Button from "./components/ui/button";
import Tooltip from "./components/ui/tooltip";

export default function App() {
  const [forceVisible, setForceVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  const [message, setMessage] = useSyncStorage('value');
  const [selectedModel, setSelectedModel] = useSyncStorage('model');
  const [user, setUser] = useSyncStorage('user');
  const [response, setResponse] = useSyncStorage('response');
  const [customPrompt, setCustomPrompt] = useSyncStorage('customPrompt');
  const [feedback, setFeedBack] = useSyncStorage('feedback', ONE_MONTH_MS);

  const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

  useEffect(() => {
    chrome.runtime.sendMessage({ action: ACTIONS.GET_AUTH_TOKEN }, (response) => {
      if (response?.authToken && response?.user) {
        const now = new Date();
        const expires = new Date(response.expires);

        if (now < expires) {
          setUser(response.user);
        } else {
          chrome.runtime.sendMessage({ action: 'LOGOUT' });
        }
      }
      setLoading(false);
    });
  }, []);

  const logout = async () => {
    chrome.runtime.sendMessage({ action: 'LOGOUT' }, () => {
      setUser(null);
    });
    await chrome.tabs.create({ url: `${API_URL}/api/auth/logout` });
  };

  // Custom hooks
  const models = useModels();
  const { generate, isRunning, promptType, bodyReader } = useGenerateResponse({
    message,
    selectedModel,
    setResponse
  });
  const copyToClipboard = useClipboard(response);

  // Memoized values
  const isEmptyMessage = useMemo(() => !message?.trim().length, [message]);
  const isEmptyResponse = useMemo(() => !response?.trim().length, [response]);

  // Handlers
  async function handleLogin() {
    const tab = await chrome.tabs.create({ url: `${API_URL}/api/auth/signin?callbackUrl=/extension-auth` });
    chrome.tabs?.remove(tab.id)
    chrome.runtime.onMessage.addListener(async (request) => {
      if (request?.action === ACTIONS.OPEN_EXTENSION) {
      }
    });
  }

  const clearAll = useCallback(async () => {
    await setResponse('');
    await setMessage('');
    await setCustomPrompt('');
  }, []);

  const onPromptKeyDown = useCallback(async (e) => {
    if (e.key === "Enter" && (e?.target?.value ?? "")?.trim().length) {
      setForceVisible(false);
      setCustomPrompt(e?.target?.value);
      await generate(PROMPTS.CUSTOM, e?.target?.value);
    }
  }, [generate]);

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  return (
    <div className="h-[100%] overflow-y-scroll py-2 px-5 relative">
      <Header
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
        models={models}
      />

      <div className="pt-[80px] w-[100%]">
        {!selectedModel && (
          <div className="flex items-center justify-center p-8 text-xs">
            Please select your favorite Ollama model...
          </div>
        )}

        <ChatDisplay
          message={message}
          response={response}
          isEmptyMessage={isEmptyMessage}
          isEmptyResponse={isEmptyResponse}
        />

        <div className="mb-[3rem]">
          <ActionButtons
            isRunning={isRunning}
            promptType={promptType}
            bodyReader={bodyReader}
            generate={generate}
            isEmptyMessage={isEmptyMessage}
            selectedModel={selectedModel}
            // selectedModel={true}
            forceVisible={forceVisible}
            setForceVisible={setForceVisible}
            customPrompt={customPrompt}
            onPromptKeyDown={onPromptKeyDown}
            copyToClipboard={copyToClipboard}
            clearAll={clearAll}
          />
        </div>

        <div className="flex justify-center">
          {!feedback &&
            <a
              target="_blank"
              href={import.meta.env.VITE_CANNY_URL ?? "https://helpmeai.canny.io/feature-requests"}
              onClick={() => setFeedBack(true)}
            >
              <Button tooltip="Feedback">
                <FeedbackIcon />
              </Button>
            </a>
          }
        </div>
      </div>

      <div className={`fixed bottom-${user?.email ? 4 : 0.5} right-${user?.email ? 4 : 6}`}>
        <UserDisplay
          user={user}
          onLogout={logout}
          onLogin={handleLogin}
        />
      </div>
      {user?.email &&
        <Tooltip text="Credits">
          <div className="fixed bottom-4 left-4 flex items-center gap-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 px-3 py-1 rounded-full text-xs transition-colors duration-200 font-semibold">
            {Math.ceil(user?.credits / 1000).toFixed(2)} ✨
          </div>
        </Tooltip>
      }
    </div>
  );
}
