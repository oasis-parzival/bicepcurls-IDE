'use client';

import { useState, useRef, useEffect } from 'react';
import { Message, AgentContext } from '@/types';
import { callFreeweightAgent } from '@/services/agentService';

// ── Lightweight Markdown Renderer ─────────────────────────────────────────────
function parseInline(text: string): React.ReactNode[] {
    const nodes: React.ReactNode[] = [];
    let remaining = text;
    let key = 0;

    while (remaining.length > 0) {
        const candidates: { type: string; index: number; full: string; inner: string }[] = [];

        const tryMatch = (pattern: RegExp, type: string) => {
            const m = pattern.exec(remaining);
            if (m && m.index !== undefined) {
                candidates.push({ type, index: m.index, full: m[0], inner: m[1] });
            }
        };

        tryMatch(/\*\*(.+?)\*\*/s, 'bold');
        tryMatch(/\*([^*\n]+?)\*/, 'italic');
        tryMatch(/`([^`\n]+?)`/, 'code');

        if (candidates.length === 0) {
            nodes.push(<span key={key++}>{remaining}</span>);
            break;
        }

        candidates.sort((a, b) => a.index - b.index);
        const first = candidates[0];

        if (first.index > 0) {
            nodes.push(<span key={key++}>{remaining.slice(0, first.index)}</span>);
        }

        if (first.type === 'bold') {
            nodes.push(
                <strong key={key++} style={{ fontWeight: 600, color: '#e2e2e2' }}>
                    {first.inner}
                </strong>
            );
        } else if (first.type === 'italic') {
            nodes.push(<em key={key++}>{first.inner}</em>);
        } else if (first.type === 'code') {
            nodes.push(
                <code
                    key={key++}
                    style={{
                        background: '#2d2d2d',
                        color: '#ce9178',
                        padding: '1px 5px',
                        borderRadius: '3px',
                        fontFamily: '"JetBrains Mono", Consolas, monospace',
                        fontSize: '0.88em',
                        border: '1px solid #3e3e42',
                    }}
                >
                    {first.inner}
                </code>
            );
        }

        remaining = remaining.slice(first.index + first.full.length);
    }
    return nodes;
}

// ── File-applied card ─────────────────────────────────────────────────────────
function FileAppliedCard({ path }: { path: string }) {
    const fileName = path.split('/').pop() ?? path;
    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            background: '#1a2f27', border: '1px solid #2d6a4f',
            borderLeft: '3px solid #4ec9b0', borderRadius: '4px',
            padding: '8px 12px', margin: '6px 0', fontSize: '12px',
        }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4ec9b0" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
            </svg>
            <span style={{ color: '#4ec9b0', fontWeight: 600 }}>Applied</span>
            <span style={{ color: '#cccccc', fontFamily: '"JetBrains Mono", monospace' }}>{fileName}</span>
            <span style={{ color: '#858585', marginLeft: 'auto', fontSize: '11px' }}>saved to filesystem</span>
        </div>
    );
}

// ── SimpleMarkdown ────────────────────────────────────────────────────────────
function SimpleMarkdown({ content }: { content: string }) {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let idx = 0;

    for (const line of lines) {
        // File-applied marker set by WRITE_FILE parser
        if (line.startsWith('::file-applied::')) {
            const filePath = line.slice('::file-applied::'.length).replace(/::$/, '');
            elements.push(<FileAppliedCard key={idx++} path={filePath} />);
        }
        // Heading
        else if (/^#{1,3}\s/.test(line)) {
            const text = line.replace(/^#+\s/, '');
            elements.push(
                <div key={idx++} style={{ fontWeight: 600, fontSize: '14px', marginTop: '6px', marginBottom: '4px', color: '#e2e2e2' }}>
                    {parseInline(text)}
                </div>
            );
        }
        // Numbered list item
        else if (/^\d+\.\s/.test(line)) {
            const num = line.match(/^(\d+)\./)?.[1] ?? '';
            const text = line.replace(/^\d+\.\s+/, '');
            elements.push(
                <div key={idx++} style={{ display: 'flex', gap: '6px', marginBottom: '3px' }}>
                    <span style={{ color: '#858585', flexShrink: 0, minWidth: '18px' }}>{num}.</span>
                    <span>{parseInline(text)}</span>
                </div>
            );
        }
        // Bullet list
        else if (/^[-*]\s/.test(line)) {
            const text = line.replace(/^[-*]\s+/, '');
            elements.push(
                <div key={idx++} style={{ display: 'flex', gap: '8px', marginBottom: '3px' }}>
                    <span style={{ color: '#858585', flexShrink: 0 }}>•</span>
                    <span>{parseInline(text)}</span>
                </div>
            );
        }
        // Empty line → spacer
        else if (line.trim() === '') {
            elements.push(<div key={idx++} style={{ height: '6px' }} />);
        }
        // Regular paragraph line
        else {
            elements.push(
                <div key={idx++} style={{ marginBottom: '1px' }}>
                    {parseInline(line)}
                </div>
            );
        }
    }

    return <div style={{ lineHeight: '1.7', fontSize: '13px' }}>{elements}</div>;
}

// ── Component ─────────────────────────────────────────────────────────────────

interface AgentChatProps {
    context: AgentContext;
    onCommandExecute: (command: string) => void;
    fileSystemManager: any;
    onApplyFileChange: (path: string, content: string) => void;
}

export default function AgentChat({ context, onCommandExecute, fileSystemManager, onApplyFileChange }: AgentChatProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: 'Freeweight online 💪\n\nI\'m your autonomous dev agent, powered by Gemini. Ask me to build something, debug code, or run commands — I can read and write your files directly!',
            timestamp: Date.now(),
        },
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => { scrollToBottom(); }, [messages]);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
        }
    }, [input]);

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
            const enhancedContext = {
                ...context,
                fileContents: context.openFiles.reduce((acc: any, path: string) => {
                    const content = fileSystemManager.readFile(path);
                    if (content) acc[path] = content;
                    return acc;
                }, {}),
            };

            const response = await callFreeweightAgent([...messages, userMessage], enhancedContext);

            // ── Parse and apply WRITE_FILE blocks ──────────────────────────────
            const WRITE_FILE_RE = /<<<WRITE_FILE:([^>]+)>>>([\s\S]*?)<<<END_FILE>>>/g;
            let processedContent = response.content;
            const fileWrites: { path: string; content: string }[] = [];

            for (const match of response.content.matchAll(WRITE_FILE_RE)) {
                const [fullBlock, filePath, fileContent] = match;
                fileWrites.push({ path: filePath.trim(), content: fileContent.trim() });
                // Replace the raw block with a display marker
                processedContent = processedContent.replace(
                    fullBlock,
                    `::file-applied::${filePath.trim()}::`
                );
            }

            // Apply changes to the IDE filesystem + editor tabs
            fileWrites.forEach(({ path, content }) => onApplyFileChange(path, content));
            // ──────────────────────────────────────────────────────────────────

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: processedContent,  // blocks replaced by ::file-applied:: markers
                timestamp: Date.now(),
            };

            setMessages((prev) => [...prev, assistantMessage]);

            if (response.commands && response.commands.length > 0) {
                response.commands.forEach((cmd) => onCommandExecute(cmd));
            }
        } catch (error) {
            console.error('Freeweight error:', error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: '❌ Error connecting to Freeweight. Check the console for details.',
                timestamp: Date.now(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const clearChat = () => {
        setMessages([{
            id: 'reset',
            role: 'assistant',
            content: 'Freeweight online 💪\n\nChat cleared. How can I help?',
            timestamp: Date.now(),
        }]);
    };

    return (
        <div
            className="h-full flex flex-col overflow-hidden"
            style={{ background: '#252526' }}
        >
            {/* ── Panel Header ─────────────────────────────────────────── */}
            <div
                className="flex items-center justify-between flex-shrink-0 px-3"
                style={{
                    height: '35px',
                    background: '#252526',
                    borderBottom: '1px solid #3e3e42',
                }}
            >
                <div className="flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4ec9b0" strokeWidth="1.8">
                        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                    </svg>
                    <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: '#bbbbbb' }}>
                        Freeweight
                    </span>
                    <span
                        style={{
                            width: '7px', height: '7px', borderRadius: '50%',
                            background: '#4ec9b0', display: 'inline-block',
                            boxShadow: '0 0 4px #4ec9b0',
                        }}
                    />
                </div>

                <div className="flex items-center gap-1">
                    {context.currentFile && (
                        <span
                            style={{
                                fontSize: '10px', color: '#858585',
                                background: '#3c3c3c',
                                padding: '2px 6px', borderRadius: '2px',
                                maxWidth: '100px', overflow: 'hidden',
                                textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            }}
                            title={context.currentFile}
                        >
                            {context.currentFile.split('/').pop()}
                        </span>
                    )}
                    <button
                        onClick={clearChat}
                        className="vsc-btn vsc-btn-icon"
                        title="Clear Chat"
                        style={{ border: 'none', background: 'transparent', color: '#858585', width: '24px', height: '24px' }}
                    >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* ── Messages ─────────────────────────────────────────────── */}
            <div
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto"
                style={{ padding: '12px 12px 8px', display: 'flex', flexDirection: 'column', gap: '8px' }}
            >
                {messages.map((msg) => (
                    <div key={msg.id}>
                        {/* Role label */}
                        <div
                            className="flex items-center gap-1.5 mb-1"
                            style={{ fontSize: '11px', color: msg.role === 'user' ? '#007acc' : '#4ec9b0', fontWeight: 600 }}
                        >
                            {msg.role === 'user' ? (
                                <>
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                                        <circle cx="12" cy="7" r="4" />
                                    </svg>
                                    You
                                </>
                            ) : (
                                <>
                                    <span>💪</span>
                                    Freeweight
                                </>
                            )}
                        </div>
                        <div className={`chat-bubble ${msg.role === 'system' ? 'assistant' : msg.role}`}>
                            <SimpleMarkdown content={msg.content} />
                        </div>
                    </div>
                ))}

                {/* Loading state */}
                {isLoading && (
                    <div>
                        <div
                            className="flex items-center gap-1.5 mb-1"
                            style={{ fontSize: '11px', color: '#4ec9b0', fontWeight: 600 }}
                        >
                            <span>💪</span>
                            Freeweight
                        </div>
                        <div className="chat-bubble assistant">
                            <span className="loading-dots" style={{ color: '#858585', fontStyle: 'italic' }}>Thinking</span>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* ── Context info strip ───────────────────────────────────── */}
            {context.openFiles.length > 0 && (
                <div
                    className="px-3 py-1.5 flex-shrink-0"
                    style={{ borderTop: '1px solid #3e3e42', fontSize: '11px', color: '#858585', background: '#1e1e1e' }}
                >
                    <span style={{ color: '#4ec9b0', marginRight: '4px' }}>⬤</span>
                    Context: {context.openFiles.map(f => f.split('/').pop()).join(', ')}
                </div>
            )}

            {/* ── Input Area ───────────────────────────────────────────── */}
            <div
                className="flex-shrink-0 px-3 pb-3 pt-2"
                style={{ borderTop: '1px solid #3e3e42', background: '#252526' }}
            >
                <div
                    className="flex gap-2 items-end"
                    style={{
                        background: '#3c3c3c',
                        border: '1px solid #3e3e42',
                        borderRadius: '4px',
                        padding: '6px 8px',
                        transition: 'border-color 0.15s',
                    }}
                >
                    <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask Freeweight to edit a file, debug code, run commands..."
                        disabled={isLoading}
                        rows={1}
                        style={{
                            flex: 1,
                            background: 'transparent',
                            border: 'none',
                            outline: 'none',
                            color: '#cccccc',
                            fontSize: '13px',
                            fontFamily: 'Inter, -apple-system, sans-serif',
                            resize: 'none',
                            lineHeight: '1.5',
                            maxHeight: '120px',
                            overflowY: 'auto',
                        }}
                    />
                    <button
                        onClick={handleSend}
                        disabled={isLoading || !input.trim()}
                        className="vsc-btn vsc-btn-primary flex-shrink-0"
                        style={{ padding: '4px 10px', alignSelf: 'flex-end', fontSize: '12px' }}
                        title="Send (Enter)"
                    >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="22" y1="2" x2="11" y2="13" />
                            <polygon points="22 2 15 22 11 13 2 9 22 2" />
                        </svg>
                    </button>
                </div>
                <div style={{ fontSize: '10px', color: '#585858', marginTop: '4px', textAlign: 'center' }}>
                    Freeweight AI · Shift+Enter for newline
                </div>
            </div>
        </div>
    );
}
