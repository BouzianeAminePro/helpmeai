import { useCallback } from "preact/hooks";
import { ACTIONS } from "../tools/enums";

export default function useClipboard(response) {
  const copyToClipboard = useCallback(async () => {
    await navigator.clipboard.writeText(response);
    await chrome.runtime.sendMessage({ action: ACTIONS.COPY, payload: response });
    window.close();
  }, [response]);

  return copyToClipboard;
}
