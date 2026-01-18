import { Message, AgentContext, AgentResponse } from '@/types';

const API_BASE_URL = 'https://api.a4f.co/v1';
const API_KEY = process.env.NEXT_PUBLIC_A4F_API_KEY || 'ddc-a4f-f2ae8c8de2f9428bac844cd9b73c0ccb';
const MODEL = 'provider-5/gemini-2.5-flash-lite';

/**
 * Freeweight Agent Client
 * Connects to A4F API for agentic reasoning
 */
export async function callFreeweightAgent(
    messages: Message[],
    context: AgentContext
): Promise<AgentResponse> {
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

Capabilities:
You can trigger terminal commands by wrapping them in backticks prefixed with $ like: \`$ npm run dev\`
You can read files, create files, and assist with coding tasks.
When a user asks you to perform a task (e.g., 'start the server'), you do not just explain how—you check the package.json or requirements, identify the correct command, and execute it.

Be concise, helpful, and proactive. You are an autonomous developer agent.`,
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
        const response = await fetch(`${API_BASE_URL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${API_KEY}`,
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
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
            content: "I'm having trouble connecting to the neural mainframe. Check console for details.",
            commands: [],
        };
    }
}

/**
 * Stream version for real-time responses (optional enhancement)
 */
export async function* streamFreeweightAgent(
    messages: Message[],
    context: AgentContext
): AsyncGenerator<string> {
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
        const response = await fetch(`${API_BASE_URL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${API_KEY}`,
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
            throw new Error('No response body');
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
                        // Skip invalid JSON
                    }
                }
            }
        }
    } catch (error) {
        console.error('Freeweight Stream Error:', error);
        yield "I'm having trouble connecting to the neural mainframe.";
    }
}
