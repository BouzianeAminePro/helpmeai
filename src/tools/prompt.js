export const PROMPTS = {
    CORRECT: 1,
    PROMPT_IT: 2
}

export function generatePrompt(text, promptType) {
    switch (promptType) {
        case PROMPTS.CORRECT:
            return `Please correct the spelling and grammar of the following text. Maintain the original meaning and tone. Do not change the structure unless necessary to fix errors: ${text} and respond only with the corrected text noting more`;
        case PROMPTS.PROMPT_IT:
            return `You are a language model that helps users turn raw text into well-structured prompts. Rewrite the following text as a clear, concise prompt:

            Text: "${text}"

            Rewrite it as a prompt and respond with only the prompt nothing more:`;
        default:
            return null;
    }
}