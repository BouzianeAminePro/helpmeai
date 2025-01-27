import { useCallback, useState, useMemo, useEffect } from "preact/hooks";

import { generatePrompt } from "./tools/prompt";
import { ACTIONS, PROMPTS } from "./tools/enums";
import useSyncStorage from "./hooks/useSyncStorage";

import HobbyKnifeIcon from "./ui/svgs/HobbyKnifeIcon";
import MagicWandIcon from "./ui/svgs/MagicWandIcon";
import ClipboardCopyIcon from "./ui/svgs/ClipboardCopyIcon";
import EraserIcon from "./ui/svgs/EraserIcon";
import CircleBackSlash from "./ui/svgs/CircleBackSlash";
import Button from "./ui/button";
import Dropdown from "./ui/dropdown";
import Tooltip from "./ui/tooltip";
import TextArea from "./ui/textarea";

export default function App() {
  const [promptType, setPromptType] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [models, setModels] = useState([]);
  const [bodyReader, setBodyReader] = useState();
  const [forceVisible, setForceVisible] = useState(false);

  const [message, setMessage] = useSyncStorage('value');
  const [selectedModel, setSelectedModel] = useSyncStorage('model');
  const [response, setResponse] = useSyncStorage('response');
  const [customPrompt, setCustomPrompt] = useSyncStorage('customPrompt');

  useEffect(() => {
    async function getModels() {
      fetch(
        `${import.meta.env.VITE_OLLAMA_API_BASE_URL ?? 'http://localhost:11434/api'}/tags`)
        .then(response => response.json())
        .then(data => setModels(data?.models?.map(({ name }) => name)))
        .catch(error => console.error('Error fetching models:', error));
    }
    getModels();
  }, []);

  const generate = useCallback(async (promptType, prompt = "") => {
    let textResponse = "";
    await setResponse(textResponse);

    try {
      setIsRunning(true);
      setPromptType(promptType)

      const response = await fetch(`${import.meta.env.VITE_OLLAMA_API_BASE_URL ?? 'http://localhost:11434/api'}/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: selectedModel ?? "llama3.2",
          prompt: generatePrompt(message, promptType, prompt),
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const reader = response.body.getReader();
      setBodyReader(reader);

      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading ?? true;
        const chunkValue = decoder.decode(value, { stream: true });
        try {
          if (chunkValue === "") {
            done = true;
            continue;
          }
          const parsedValue = JSON.parse(chunkValue === "" ? null : chunkValue);
          textResponse += parsedValue?.response ?? "";

          await setResponse(textResponse);
        } catch (parseError) {
          console.error("Error parsing JSON:", parseError);
          console.error("Received chunk:", chunkValue);
        }
      }
    } catch (error) {
      console.error("Error fetching the streaming response:", error);
    } finally {
      setIsRunning(false);
      setPromptType(null);
    }
  }, [message, selectedModel]);

  const copyToClipboard = useCallback(async () => {
    await navigator.clipboard.writeText(response);
    await chrome.runtime.sendMessage({ action: ACTIONS.COPY, payload: response });
    window.close();
  }, [response]);

  const clearAll = useCallback(async () => {
    await setResponse('');
    await setMessage('');
  }, []);

  const isEmptyMessage = useMemo(() => !message?.trim().length, [message]);
  const isEmptyResponse = useMemo(() => !response?.trim().length, [response]);


  const onPromptKeyDown = useCallback(
    async (e) => {
      if (e.key === "Enter" && (e?.target?.value ?? "")?.trim().length) {
        setForceVisible(false);
        setCustomPrompt(e?.target?.value)
        await generate(PROMPTS.CUSTOM, e?.target?.value);
      }
    }, []);

  return (
    <div className="h-[100%] overflow-y-scroll py-2 px-5">
      <header className="fixed top-0 left-0 right-0 z-10">
        <div className="flex flex-row items-center p-2">
          <div className="flex flex-row items-center">
            <img
              src="/images/logo.png"
              alt="logo"
              className="w-[60px] h-[60px] dark:invert"
            />
            <h1 className="text-sm">helpmeai</h1>
          </div>
          <div className="ml-auto">
            <Dropdown
              onClick={async (option) => await setSelectedModel(option)}
              selected={selectedModel}
              options={models}
            />
          </div>
        </div>
      </header>
      <div className="pt-[80px] w-[100%]">
        {!selectedModel &&
          <div className="flex items-center justify-center p-8 text-xs">
            Please select/download your favorite Ollama model...
          </div>
        }
        {isEmptyMessage && isEmptyResponse &&
          <div className="flex items-center justify-center p-8">
            Nothing to process...
          </div>
        }
        <div className="flex flex-col gap-y-3 items-center">
          {
            !isEmptyMessage &&
            <p className="text-sm leading-6 mb-4 bg-slate-600 p-2.5 rounded-2xl w-fit self-end dark:text-white">{message}</p>
          }
          {
            !isEmptyResponse &&
            <div className="flex flex-row gap-x-2 items-center">
              <img
                src="/images/logo.png"
                alt="logo"
                className="w-[40px] h-[40px] dark:invert"
              />
              <p className="text-sm leading-6 mb-4 overflow-y-scroll h-max-[200px] dark:text-white">{response}</p>
            </div>
          }
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex gap-4 justify-evenly">
            <Button
              onClick={async () =>
                isRunning &&
                  promptType === PROMPTS.CORRECT ?
                  await bodyReader?.cancel() :
                  await generate(PROMPTS.CORRECT)
              }
              disabled={(isRunning && promptType !== PROMPTS.CORRECT) || isEmptyMessage || !selectedModel}
              fallback={<CircleBackSlash />}
              isRunning={isRunning && promptType === PROMPTS.CORRECT}
              tooltip="Correction"
            >
              <HobbyKnifeIcon />
            </Button>

            <Tooltip
              text={
                <TextArea
                  value={customPrompt ?? ""}
                  placeholder="Enter to validate prompt..."
                  key="prompter"
                  onKeyDown={onPromptKeyDown}
                />
              }
              forceVisible={forceVisible}
              bgColor="bg-slate-700"
            >
              <Button
                onClick={async () =>
                  isRunning && promptType === PROMPTS.CUSTOM ?
                    await bodyReader?.cancel() :
                    setForceVisible(prev => !prev)
                }
                disabled={(isRunning && promptType !== PROMPTS.CUSTOM) || isEmptyMessage || !selectedModel}
                fallback={<CircleBackSlash />}
                isRunning={isRunning && promptType === PROMPTS.CUSTOM}
              >
                <MagicWandIcon />
              </Button>
            </Tooltip>

            <Button
              onClick={copyToClipboard}
              disabled={isRunning || isEmptyMessage || !selectedModel}
              tooltip="Copy/Insert"
            >
              <ClipboardCopyIcon />
            </Button>

            <Button
              onClick={clearAll}
              disabled={isRunning || isEmptyMessage || !selectedModel}
              tooltip="Clear"
            >
              <EraserIcon />
            </Button>

          </div>
        </div>
      </div>
    </div>
  );
}
