import { useState, useEffect } from "preact/hooks";

export default function useModels() {
  const [models, setModels] = useState([]);

  useEffect(() => {
    async function getModels() {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_OLLAMA_API_BASE_URL ?? 'http://localhost:11434/api'}/tags`
        );
        const data = await response.json();
        setModels(data?.models?.map(({ name }) => name));
      } catch (error) {
        console.error('Error fetching models:', error);
      }
    }
    getModels();
  }, []);

  return models;
}
