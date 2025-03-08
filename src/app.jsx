import { useCallback, useEffect, useMemo, useState } from "preact/hooks";
import { PROMPTS } from "./tools/enums";
import useSyncStorage, { ONE_MONTH_MS } from "./hooks/useSyncStorage";
import useModels from "./hooks/useModels";
import useGenerateResponse from "./hooks/useGenerateResponse";
import useClipboard from "./hooks/useClipboard";
import Header from "./components/Header";
import ChatDisplay from "./components/ChatDisplay";
import ActionButtons from "./components/ActionButtons";
import { FeedbackIcon } from "./components/ui/svgs/FeedbackIcon";
import Button from "./components/ui/button";
import { migrateStorage } from "./utils/storageMigration";

export default function App() {
  const [forceVisible, setForceVisible] = useState(false);

  const [message, setMessage] = useSyncStorage('value');
  const [selectedModel, setSelectedModel] = useSyncStorage('model');
  const [response, setResponse] = useSyncStorage('response');
  const [customPrompt, setCustomPrompt] = useSyncStorage('customPrompt');
  const [feedback, setFeedBack] = useSyncStorage('feedback', ONE_MONTH_MS);
  const [migrationComplete, setMigrationComplete] = useSyncStorage('migration');

  useEffect(() => {
    if (migrationComplete) return;

    async function runMigration() {
      try {
        await migrateStorage();
        setMigrationComplete(true);
      } catch (error) {
        console.error("Storage migration failed:", error);
        setMigrationComplete(true);
      }
    }

    runMigration();
  }, [migrationComplete]);

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

  if (!migrationComplete) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  return (
    <div className="h-[100%] overflow-y-scroll py-2 px-5">
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

        <ActionButtons
          isRunning={isRunning}
          promptType={promptType}
          bodyReader={bodyReader}
          generate={generate}
          isEmptyMessage={isEmptyMessage}
          selectedModel={true}
          forceVisible={forceVisible}
          setForceVisible={setForceVisible}
          customPrompt={customPrompt}
          onPromptKeyDown={onPromptKeyDown}
          copyToClipboard={copyToClipboard}
          clearAll={clearAll}
        />

        {!feedback &&
          <div className="flex justify-center mt-4">
            <a
              target="_blank"
              href={import.meta.env.VITE_CANNY_URL ?? "https://helpmeai.canny.io/feature-requests"}
              onClick={() => setFeedBack(true)}
            >
              <Button tooltip="Feedback">
                <FeedbackIcon />
              </Button>
            </a>
          </div>
        }
      </div>
    </div>
  );
}
