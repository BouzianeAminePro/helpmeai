import { PROMPTS } from "./enums";

export function generatePrompt(text, promptType) {
    switch (promptType) {
        case PROMPTS.CORRECT:
            return `Answer only with the requested information. Do not include explanations, formatting, or suggestions.
            Please correct the spelling and grammar of the following text. Maintain the original meaning, do not change the structure unless necessary to fix errors:
            Text: ${text}
            `;
        case PROMPTS.PROMPT_IT:
            return `Answer only with the requested information. Do not include explanations, formatting, or suggestions.
            You are a language model that helps users turn raw text into well-structured prompts. Rewrite the following text as a clear, concise prompt:
            Text: "${text}"
            `;
        default:
            return null;
    }
}
