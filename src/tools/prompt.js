import { PROMPTS } from "./enums";

export function generatePrompt(text, promptType, prompt = "") {
    const baseInstruction = `You MUST follow these instructions exactly. 
    - DO NOT explain, rephrase, format, add context, or give suggestions.  
    - DO NOT include reasoning, interpretation, or personal thoughts.  
    - DO NOT alter, remove, or introduce any information beyond the strict request.  
    - Your response MUST be limited to the exact requested output.`;

    switch (promptType) {
        case PROMPTS.CORRECT:
            return `${baseInstruction}
            TASK: Correct spelling and grammar **without** changing meaning, structure, or style unless fixing an actual error.
            OUTPUT ONLY: The corrected text.
            INPUT: "${text}"`;

        case PROMPTS.CUSTOM:
            return `${baseInstruction}
            TASK: ${prompt}  
            OUTPUT ONLY: Provide the exact result as required, with zero modifications beyond the strict request.
            INPUT: "${text}"`;

        default:
            return null;
    }
}
