import Button from "./ui/button";
import Tooltip from "./ui/tooltip";
import TextArea from "./ui/textarea";
import HobbyKnifeIcon from "./ui/svgs/HobbyKnifeIcon";
import MagicWandIcon from "./ui/svgs/MagicWandIcon";
import ClipboardCopyIcon from "./ui/svgs/ClipboardCopyIcon";
import EraserIcon from "./ui/svgs/EraserIcon";
import CircleBackSlash from "./ui/svgs/CircleBackSlash";
import { PROMPTS } from "../tools/enums";

export default function ActionButtons({
  isRunning,
  promptType,
  bodyReader,
  generate,
  isEmptyMessage,
  selectedModel,
  forceVisible,
  setForceVisible,
  customPrompt,
  onPromptKeyDown,
  copyToClipboard,
  clearAll
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-4 justify-evenly">
        <Button
          onClick={async () =>
            isRunning && promptType === PROMPTS.CORRECT
              ? await bodyReader?.cancel()
              : await generate(PROMPTS.CORRECT)
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
              isRunning && promptType === PROMPTS.CUSTOM
                ? await bodyReader?.cancel()
                : setForceVisible((prev) => !prev)
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
  );
}
