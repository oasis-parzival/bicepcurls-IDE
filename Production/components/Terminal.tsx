'use client';

import { useState, useRef, useEffect } from 'react';
import { TerminalOutput } from '@/types';

interface TerminalProps {
    onCommandExecute?: (command: string) => void;
}

export default function Terminal({ onCommandExecute }: TerminalProps) {
    const [outputs, setOutputs] = useState<TerminalOutput[]>([
        {
            id: '1',
            type: 'output',
            content: 'BicepCurls Terminal  v1.0.0',
            timestamp: Date.now(),
        },
        {
            id: '2',
            type: 'output',
            content: 'Type a command, or let Freeweight handle it.',
            timestamp: Date.now(),
        },
    ]);
    const [input, setInput] = useState('');
    const [commandHistory, setCommandHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const outputEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        outputEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => { scrollToBottom(); }, [outputs]);

    const executeCommand = (command: string) => {
        const trimmedCommand = command.trim();
        if (!trimmedCommand) return;

        const inputOutput: TerminalOutput = {
            id: `terminal-in-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: 'input',
            content: `$ ${trimmedCommand}`,
            timestamp: Date.now(),
        };

        setOutputs((prev) => [...prev, inputOutput]);
        setCommandHistory((prev) => [...prev, trimmedCommand]);

        setTimeout(() => {
            let result: TerminalOutput;

            if (trimmedCommand === 'clear') {
                setOutputs([]);
                return;
            } else if (trimmedCommand === 'help') {
                result = {
                    id: `terminal-out-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    type: 'output',
                    content: `Available commands:\n  clear   — Clear terminal output\n  help    — Show this help message\n  echo    — Echo text back\n\nNote: Full execution requires a backend container.\nLet Freeweight handle complex commands!`,
                    timestamp: Date.now(),
                };
            } else if (trimmedCommand.startsWith('echo ')) {
                result = {
                    id: `terminal-out-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    type: 'output',
                    content: trimmedCommand.substring(5),
                    timestamp: Date.now(),
                };
            } else {
                result = {
                    id: `terminal-out-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    type: 'output',
                    content: `Command simulated: ${trimmedCommand}\n(Full execution requires container backend)`,
                    timestamp: Date.now(),
                };
            }

            setOutputs((prev) => [...prev, result]);
        }, 100);

        if (onCommandExecute) {
            onCommandExecute(trimmedCommand);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            executeCommand(input);
            setInput('');
            setHistoryIndex(-1);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (commandHistory.length > 0) {
                const newIndex = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : historyIndex;
                setHistoryIndex(newIndex);
                setInput(commandHistory[commandHistory.length - 1 - newIndex]);
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex > 0) {
                const newIndex = historyIndex - 1;
                setHistoryIndex(newIndex);
                setInput(commandHistory[commandHistory.length - 1 - newIndex]);
            } else {
                setHistoryIndex(-1);
                setInput('');
            }
        }
    };

    // Public API: parent components can inject output via window.terminalAddOutput
    useEffect(() => {
        (window as any).terminalAddOutput = (content: string, type: 'output' | 'error' | 'input' = 'output') => {
            const output: TerminalOutput = {
                id: `terminal-out-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                type,
                content,
                timestamp: Date.now(),
            };
            setOutputs((prev) => [...prev, output]);
        };
    }, []);

    return (
        <div
            className="h-full flex flex-col"
            style={{ background: '#1e1e1e', fontFamily: '"JetBrains Mono", Consolas, monospace' }}
            onClick={() => inputRef.current?.focus()}
        >
            {/* ── Panel Tab Bar ──────────────────────────────────────────── */}
            <div
                className="flex items-center flex-shrink-0"
                style={{ background: '#252526', borderBottom: '1px solid #3e3e42', minHeight: '35px', padding: '0 4px' }}
            >
                <div className="flex flex-1 items-center">
                    <button className="panel-tab active">Terminal</button>
                    <button className="panel-tab" style={{ pointerEvents: 'none', opacity: 0.4 }}>Problems</button>
                    <button className="panel-tab" style={{ pointerEvents: 'none', opacity: 0.4 }}>Output</button>
                    <button className="panel-tab" style={{ pointerEvents: 'none', opacity: 0.4 }}>Debug Console</button>
                </div>

                {/* Right controls */}
                <div className="flex items-center gap-1 pr-1">
                    {/* New terminal */}
                    <button
                        className="vsc-btn vsc-btn-icon"
                        title="New Terminal"
                        style={{ border: 'none', background: 'transparent', color: '#cccccc', width: '24px', height: '24px' }}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                    </button>
                    {/* Clear */}
                    <button
                        onClick={() => setOutputs([])}
                        className="vsc-btn vsc-btn-icon"
                        title="Clear Terminal"
                        style={{ border: 'none', background: 'transparent', color: '#858585', width: '24px', height: '24px' }}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                            <path d="M10 11v6" /><path d="M14 11v6" />
                            <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                        </svg>
                    </button>
                    {/* Close panel */}
                    <button
                        className="vsc-btn vsc-btn-icon"
                        title="Close Panel"
                        style={{ border: 'none', background: 'transparent', color: '#858585', width: '24px', height: '24px', fontSize: '16px' }}
                    >×</button>
                </div>
            </div>

            {/* ── Output Area ─────────────────────────────────────────────── */}
            <div
                className="flex-1 overflow-y-auto px-3 py-2"
                style={{ background: '#1e1e1e' }}
            >
                {outputs.map((output) => (
                    <div key={output.id} className={`terminal-output ${output.type}`}>
                        {output.content}
                    </div>
                ))}
                <div ref={outputEndRef} />
            </div>

            {/* ── Input Row ───────────────────────────────────────────────── */}
            <div
                className="flex items-center flex-shrink-0 px-3"
                style={{ height: '28px', background: '#1e1e1e', borderTop: '1px solid #2d2d2d' }}
            >
                <span style={{ color: '#4ec9b0', fontSize: '12px', marginRight: '6px', fontWeight: 500 }}>$</span>
                <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    style={{
                        flex: 1,
                        background: 'transparent',
                        border: 'none',
                        outline: 'none',
                        color: '#cccccc',
                        fontSize: '12px',
                        fontFamily: '"JetBrains Mono", Consolas, monospace',
                        caretColor: '#aeafad',
                    }}
                    placeholder="Enter command..."
                    autoFocus
                />
            </div>
        </div>
    );
}
