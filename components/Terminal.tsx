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
            content: 'BicepCurls Terminal v1.0.0',
            timestamp: Date.now(),
        },
        {
            id: '2',
            type: 'output',
            content: 'Type commands or let Freeweight execute them for you.',
            timestamp: Date.now(),
        },
    ]);
    const [input, setInput] = useState('');
    const [commandHistory, setCommandHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const outputEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        outputEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [outputs]);

    const executeCommand = (command: string) => {
        const trimmedCommand = command.trim();
        if (!trimmedCommand) return;

        // Add input to output
        const inputOutput: TerminalOutput = {
            id: `terminal-in-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: 'input',
            content: `$ ${trimmedCommand}`,
            timestamp: Date.now(),
        };

        setOutputs((prev) => [...prev, inputOutput]);
        setCommandHistory((prev) => [...prev, trimmedCommand]);

        // Simulate command execution
        setTimeout(() => {
            let result: TerminalOutput;

            // Handle basic commands
            if (trimmedCommand === 'clear') {
                setOutputs([]);
                return;
            } else if (trimmedCommand === 'help') {
                result = {
                    id: `terminal-out-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    type: 'output',
                    content: `Available commands:
  clear  - Clear terminal
  help   - Show this help
  
Note: Full command execution requires backend integration.
Let Freeweight handle complex commands!`,
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

    // Public method to add output (can be called from parent)
    useEffect(() => {
        (window as any).terminalAddOutput = (content: string, type: 'output' | 'error' = 'output') => {
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
        <div className="h-full flex flex-col bg-cyber-black border-t border-cyber-gray">
            {/* Header */}
            <div className="px-3 py-2 border-b border-cyber-gray flex items-center justify-between">
                <h2 className="text-cyber-green font-bold text-xs terminal-glow">TERMINAL</h2>
                <button
                    onClick={() => setOutputs([])}
                    className="text-xs text-cyber-gray hover:text-cyber-green transition-colors"
                >
                    CLEAR
                </button>
            </div>

            {/* Output */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1">
                {outputs.map((output) => (
                    <div key={output.id} className={`terminal-output ${output.type}`}>
                        {output.content}
                    </div>
                ))}
                <div ref={outputEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-cyber-gray flex items-center gap-2">
                <span className="text-cyber-green">$</span>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 bg-transparent outline-none text-cyber-green font-mono"
                    placeholder="Enter command..."
                    autoFocus
                />
            </div>
        </div>
    );
}
