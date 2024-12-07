import { useCallback, useState, useMemo } from "preact/hooks";

import { generatePrompt, PROMPTS } from "./tools/prompt";
import { ACTIONS } from "./tools/enums";

import HobbyKnifeIcon from "./ui/svgs/HobbyKnifeIcon";
import MagicWandIcon from "./ui/svgs/MagicWandIcon";
import ClipboardCopyIcon from "./ui/svgs/ClipboardCopyIcon";
import EraserIcon from "./ui/svgs/EraserIcon";
import CircleBackSlash from "./ui/svgs/CircleBackSlash";
import Button from "./ui/button";
import Tooltip from "./ui/tooltip";

export default function App() {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const [promptType, setPromptType] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [bodyReader, setBodyReader] = useState();

  chrome.storage.sync.get('value', result => {
    if (chrome.runtime.lastError) {
      console.error('Error retrieving data:', chrome.runtime.lastError);
      return;
    }

    setMessage(result?.value);
  })

  const generate = useCallback(async (promptType) => {
    setResponse("");

    try {
      setIsRunning(true);
      setPromptType(promptType)

      const response = await fetch(`http://localhost:11434/api/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama3.2",
          prompt: generatePrompt(message, promptType),
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
          setResponse((prev) => prev + (parsedValue?.response ?? ""));
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
  }, [message]);

  const copyToClipboard = useCallback(async () => {
    await navigator.clipboard.writeText(response);
    chrome.runtime.sendMessage({ action: ACTIONS.COPY, payload: response });
    setResponse("")
    window.close()
  }, [response]);

  const clearMessage = useCallback(async () => {
    await chrome.storage.sync.set({
      value: ""
    });
    setMessage('')
  }, [])

  const clearAll = useCallback(async () => {
    setResponse("");
    clearMessage();
  }, []);

  const isEmptyMessage = useMemo(() => !message?.trim().length, [message])
  const isEmptyResponse = useMemo(() => !response?.trim().length, [response])

  return (
    <div className="h-[100%] overflow-y-scroll py-2 px-5">
      <div className="flex flex-row h-[100%] items-center">
        <img
          src="/images/logo.png"
          alt="logo"
          className="w-[60px] h-[60px] dark:invert"
        />
        <h1 className="text-base">helpmeai</h1>
      </div>

      <div className="flex flex-col gap-y-3 items-center">
        {
          !isEmptyMessage &&
          <p className="text-base leading-6 mb-4 bg-slate-600 p-2.5 rounded-2xl self-end text-white">{message}</p>
        }
        {
          !isEmptyResponse &&
          <div className="flex flex-row gap-x-2 items-center">
            <img
              src="/images/logo.png"
              alt="logo"
              className="w-[40px] h-[40px] dark:invert"
            />
            <p className="text-base leading-6 mb-4 overflow-y-scroll h-max-[200px] dark:text-white">{response}</p>
          </div>
        }
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex gap-4 justify-evenly">
          <Tooltip text="Correct">
            <Button
              onClick={() =>
                isRunning &&
                  promptType === PROMPTS.CORRECT ?
                  bodyReader?.cancel() :
                  generate(PROMPTS.CORRECT)
              }
              disabled={(isRunning && promptType !== PROMPTS.CORRECT) || isEmptyMessage}
              fallback={<CircleBackSlash />}
              isRunning={isRunning && promptType === PROMPTS.CORRECT}
            >
              <HobbyKnifeIcon />
            </Button>
          </Tooltip>

          <Tooltip text="Promptify">
            <Button
              onClick={() =>
                isRunning &&
                  promptType === PROMPTS.PROMPT_IT ?
                  bodyReader?.cancel() :
                  generate(PROMPTS.PROMPT_IT)}
              disabled={(isRunning && promptType !== PROMPTS.PROMPT_IT) || isEmptyMessage}
              fallback={<CircleBackSlash />}
              isRunning={isRunning && promptType === PROMPTS.PROMPT_IT}
            >
              <MagicWandIcon />
            </Button>
          </Tooltip>

          <Tooltip text="Copy/insert">
            <Button
              onClick={copyToClipboard}
              disabled={isRunning || isEmptyMessage}
            >
              <ClipboardCopyIcon />
            </Button>
          </Tooltip>

          <Tooltip text="Clear">
            <Button
              onClick={clearAll}
              disabled={isRunning || isEmptyMessage}
            >
              <EraserIcon />
            </Button>
          </Tooltip>

        </div>
      </div>
    </div>
  );
}
