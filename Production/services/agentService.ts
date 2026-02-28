import { Message, AgentContext, AgentResponse } from '@/types';

// ============================================================================
// A4F API Configuration
// ============================================================================

/**
 * Base URL for A4F API (OpenAI Compatible)
 */
const API_BASE_URL = 'https://api.a4f.co/v1';

/**
 * A4F API Key
 * Stored in environment variable for security
 * @see .env.local
 */
const API_KEY = 'ddc-a4f-f2ae8c8de2f9428bac844cd9b73c0ccb'; // Hardcoded for educational/demo purposes

/**
 * Model identifier for A4F Provider
 * Using Gemini 3 Pro via Provider 5
 */
const MODEL = 'provider-3/llama-3.1-70b';

/**
 * Maximum number of retry attempts for failed API calls
 */
const MAX_RETRIES = 3;

/**
 * Delay between retries in milliseconds
 */
const RETRY_DELAY = 1000;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Delays execution for the specified duration
 * @param ms - Duration in milliseconds
 * @returns Promise that resolves after the delay
 */
const delay = (ms: number): Promise<void> =>
    new Promise(resolve => setTimeout(resolve, ms));

/**
 * Determines if an HTTP status code should trigger a retry
 * @param status - HTTP status code
 * @returns true if the request should be retried
 */
const isRetryableStatus = (status: number): boolean =>
    status === 503 || status === 429;

/**
 * Executes a fetch request with automatic retry logic
 * Retries up to MAX_RETRIES times for 503 (Service Unavailable) and 429 (Rate Limit) errors
 * 
 * @param url - API endpoint URL
 * @param options - Fetch request options
 * @returns Response object
 * @throws Error if all retry attempts fail
 */
async function fetchWithRetry(
    url: string,
    options: RequestInit
): Promise<Response> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const response = await fetch(url, options);

            // If successful or non-retryable error, return immediately
            if (response.ok || !isRetryableStatus(response.status)) {
                return response;
            }

            // Log retry attempt
            console.warn(
                `API request failed with status ${response.status}. ` +
                `Attempt ${attempt}/${MAX_RETRIES}. Retrying in ${RETRY_DELAY}ms...`
            );

            // Store error for potential final throw
            lastError = new Error(
                `API Error: ${response.status} ${response.statusText}`
            );

            // Wait before retrying (except on last attempt)
            if (attempt < MAX_RETRIES) {
                await delay(RETRY_DELAY * attempt); // Exponential backoff
            }
        } catch (error) {
            console.error(
                `Network error on attempt ${attempt}/${MAX_RETRIES}:`,
                error
            );

            lastError = error instanceof Error
                ? error
                : new Error('Unknown network error');

            // Wait before retrying (except on last attempt)
            if (attempt < MAX_RETRIES) {
                await delay(RETRY_DELAY * attempt);
            }
        }
    }

    // All retries exhausted
    throw lastError || new Error('API request failed after all retries');
}

// ============================================================================
// Main API Functions
// ============================================================================

/**
 * Calls the Freeweight Agent using Google Gemini 1.5 Flash API
 * 
 * This function sends a chat completion request to the Gemini API with automatic
 * retry logic for transient failures. It processes the AI response and extracts
 * any terminal commands that should be executed.
 * 
 * @param messages - Array of chat messages forming the conversation history
 * @param context - Current IDE context including files, directory, and state
 * @returns AgentResponse containing the AI's response and any commands to execute
 * 
 * @example
 * ```typescript
 * const response = await callFreeweightAgent(
 *   [{ role: 'user', content: 'Start the dev server' }],
 *   { currentFile: 'app.ts', openFiles: [], workingDirectory: '/project' }
 * );
 * console.log(response.content); // AI response
 * console.log(response.commands); // ['npm run dev']
 * ```
 */
export async function callFreeweightAgent(
    messages: Message[],
    context: AgentContext
): Promise<AgentResponse> {
    // Verify API key configuration
    if (!API_KEY) {
        console.error('NEXT_PUBLIC_A4F_API_KEY is not configured');
        return {
            content: "⚠️ API configuration error: A4F API key is missing. Please set NEXT_PUBLIC_A4F_API_KEY in .env.local",
            commands: [],
        };
    }

    // Build detailed context string
    let contextString = `Current Context:
- Current File: ${context.currentFile || 'None'}
- Open Files: ${context.openFiles.join(', ') || 'None'}
- Working Directory: ${context.workingDirectory}`;

    // Add file contents if available
    if ((context as any).fileContents) {
        contextString += '\n\nFile Contents:';
        Object.entries((context as any).fileContents).forEach(([path, content]) => {
            contextString += `\n\n--- ${path} ---\n${content}`;
        });
    }

    const systemMessage: Message = {
        id: 'system',
        role: 'system',
        content: `You are Freeweight, the AI engine for BicepCurls IDE.

${contextString}

## Capabilities

### Terminal Commands
Trigger terminal commands by wrapping them in backticks prefixed with $:
\`$ npm run dev\`

### Direct File Editing (IMPORTANT)
When a user asks you to edit, create, or update a file, you MUST write the file directly using this exact block syntax:

<<<WRITE_FILE:/project/filename.ext>>>
full file content goes here
<<<END_FILE>>>

Rules:
- Always include the COMPLETE file content (not just the changed part)
- Use the correct path starting with /project/ (e.g. /project/index.html, /project/style.css, /project/script.js)
- You can use multiple WRITE_FILE blocks in one response
- After the block, briefly explain what you changed
- NEVER just show code in a markdown code block and ask the user to copy it — always use WRITE_FILE to apply it directly

### General
- When asked to perform a task, do it — don't just explain how
- Be concise, helpful, and proactive
- You are an autonomous developer agent`,
        timestamp: Date.now(),
    };

    const apiMessages = [systemMessage, ...messages].map((msg) => ({
        role: msg.role,
        content: msg.content,
    }));

    const payload = {
        model: MODEL,
        messages: apiMessages,
        temperature: 0.7,
    };

    try {
        // Standard OpenAI-compatible fetch call
        const response = await fetchWithRetry(
            `${API_BASE_URL}/chat/completions`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${API_KEY}`,
                },
                body: JSON.stringify(payload),
            }
        );

        if (!response.ok) {
            // Try to read detailed error from body
            let errorDetails = '';
            try {
                const errorData = await response.json();
                errorDetails = JSON.stringify(errorData);
                console.error('Gemini API Error Details:', errorData);
            } catch (e) {
                errorDetails = await response.text();
            }

            throw new Error(
                `API Error: ${response.status} ${response.statusText} - ${errorDetails}`
            );
        }

        const data = await response.json();
        const content = data.choices[0].message.content;

        // Extract terminal commands from response
        const commandRegex = /`\$\s+([^`]+)`/g;
        const commands: string[] = [];
        let match;
        while ((match = commandRegex.exec(content)) !== null) {
            commands.push(match[1].trim());
        }

        return {
            content,
            commands,
        };
    } catch (error) {
        console.error('Freeweight Brain Freeze:', error);

        return {
            content: "Freeweight is currently offline!",
            commands: [],
        };
    }
}

/**
 * Streams responses from the Freeweight Agent in real-time
 * 
 * This async generator function provides streaming chat completions from the
 * Gemini API, yielding content chunks as they arrive. Useful for providing
 * responsive, real-time feedback in the UI.
 * 
 * @param messages - Array of chat messages forming the conversation history
 * @param context - Current IDE context including files, directory, and state
 * @yields String chunks of the AI response as they arrive
 * 
 * @example
 * ```typescript
 * for await (const chunk of streamFreeweightAgent(messages, context)) {
 *   console.log(chunk); // Display each chunk as it arrives
 * }
 * ```
 */
export async function* streamFreeweightAgent(
    messages: Message[],
    context: AgentContext
): AsyncGenerator<string> {
    // Verify API key configuration
    if (!API_KEY) {
        console.error('NEXT_PUBLIC_A4F_API_KEY is not configured');
        yield "Freeweight is currently offline! (Missing API Key)";
        return;
    }

    const systemMessage: Message = {
        id: 'system',
        role: 'system',
        content: `You are Freeweight, the AI engine for BicepCurls IDE.

Current Context: ${JSON.stringify(context)}

You can trigger terminal commands by wrapping them in backticks prefixed with $ like: \`$ npm run dev\`.
Be concise and proactive.`,
        timestamp: Date.now(),
    };

    const apiMessages = [systemMessage, ...messages].map((msg) => ({
        role: msg.role,
        content: msg.content,
    }));

    const payload = {
        model: MODEL,
        messages: apiMessages,
        temperature: 0.7,
        stream: true,
    };

    try {
        const response = await fetchWithRetry(
            `${API_BASE_URL}/chat/completions`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${API_KEY}`,
                },
                body: JSON.stringify(payload),
            }
        );

        if (!response.ok) {
            let errorDetails = '';
            try {
                // Try to read as text first since streaming response might not be JSON
                errorDetails = await response.text();
            } catch (e) {
                errorDetails = response.statusText;
            }
            throw new Error(
                `API Error: ${response.status} ${response.statusText} - ${errorDetails}`
            );
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
            throw new Error('No response body available for streaming');
        }

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n').filter((line) => line.trim() !== '');

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = line.slice(6);
                    if (data === '[DONE]') continue;

                    try {
                        const parsed = JSON.parse(data);
                        const content = parsed.choices[0]?.delta?.content;
                        if (content) {
                            yield content;
                        }
                    } catch (e) {
                        // Skip invalid JSON chunks
                        console.warn('Failed to parse streaming chunk:', e);
                    }
                }
            }
        }
    } catch (error) {
        console.error('Freeweight Stream Error:', error);
        yield "Freeweight is currently offline!";
    }
}
