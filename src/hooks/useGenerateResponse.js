import { useCallback, useState } from "preact/hooks";
import { generatePrompt } from "../tools/prompt";

export default function useGenerateResponse({ message, selectedModel, setResponse }) {
  const [isRunning, setIsRunning] = useState(false);
  const [promptType, setPromptType] = useState(null);
  const [bodyReader, setBodyReader] = useState();

  const generate = useCallback(async (promptType, prompt = "") => {
    let textResponse = "";
    await setResponse(textResponse);

    try {
      setIsRunning(true);
      setPromptType(promptType);

      const response = await fetch(
        `${import.meta.env.VITE_OLLAMA_API_BASE_URL ?? 'http://localhost:11434/api'}/generate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: selectedModel ?? "llama3.2",
            prompt: generatePrompt(message, promptType, prompt),
            stream: true,
          }),
        }
      );

      if (!response.ok) throw new Error("Network response was not ok");

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
        }
      }
    } catch (error) {
      console.error("Error fetching the streaming response:", error);
    } finally {
      setIsRunning(false);
      setPromptType(null);
    }
  }, [message, selectedModel]);

  return { generate, isRunning, promptType, bodyReader };
}
