'use client';

import { useState, useRef, useEffect } from 'react';
import { Message, AgentContext } from '@/types';
import { callFreeweightAgent } from '@/services/agentService';

interface AgentChatProps {
    context: AgentContext;
    onCommandExecute: (command: string) => void;
    fileSystemManager: any;
}

export default function AgentChat({ context, onCommandExecute, fileSystemManager }: AgentChatProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: '> FREEWEIGHT ONLINE\n\nHey there! I\'m Freeweight, your autonomous dev agent. Ask me to build something, debug code, or run commands. I can read your files and help you code!',
            timestamp: Date.now(),
        },
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            // Enhance context with file contents
            const enhancedContext = {
                ...context,
                fileContents: context.openFiles.reduce((acc: any, path: string) => {
                    const content = fileSystemManager.readFile(path);
                    if (content) {
                        acc[path] = content;
                    }
                    return acc;
                }, {}),
            };

            const response = await callFreeweightAgent([...messages, userMessage], enhancedContext);

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response.content,
                timestamp: Date.now(),
            };

            setMessages((prev) => [...prev, assistantMessage]);

            // Execute any commands found in the response
            if (response.commands && response.commands.length > 0) {
                response.commands.forEach((cmd) => onCommandExecute(cmd));
            }
        } catch (error) {
            console.error('Freeweight error:', error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: '❌ Error connecting to Freeweight. The API might be having issues. Please check the console for details.',
                timestamp: Date.now(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="h-full flex flex-col bg-cyber-black border-l border-cyber-green overflow-hidden">
            {/* Header */}
            <div className="p-3 border-b border-cyber-gray flex-shrink-0">
                <h2 className="text-cyber-green font-bold terminal-glow text-sm flex items-center gap-2">
                    <span>💪</span>
                    <span>FREEWEIGHT AI</span>
                </h2>
                {context.currentFile && (
                    <div className="text-xs text-cyber-gray mt-1">
                        Current: {context.currentFile.split('/').pop()}
                    </div>
                )}
            </div>

            {/* Messages - Scrollable container */}
            <div
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-3"
                style={{ scrollBehavior: 'smooth' }}
            >
                {messages.map((msg) => (
                    <div key={msg.id} className={`chat-bubble ${msg.role}`}>
                        <div className="text-xs opacity-70 mb-1">
                            {msg.role === 'user' ? 'YOU' : 'FREEWEIGHT'}
                        </div>
                        <div className="whitespace-pre-wrap break-words">{msg.content}</div>
                    </div>
                ))}
                {isLoading && (
                    <div className="chat-bubble assistant">
                        <div className="text-xs opacity-70 mb-1">FREEWEIGHT</div>
                        <div className="loading-dots">Thinking</div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input - Fixed at bottom */}
            <div className="p-3 border-t border-cyber-gray flex-shrink-0">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask Freeweight anything..."
                        className="cyber-input flex-1 text-sm"
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleSend}
                        disabled={isLoading || !input.trim()}
                        className="cyber-button text-xs px-3"
                    >
                        SEND
                    </button>
                </div>
            </div>
        </div>
    );
}
