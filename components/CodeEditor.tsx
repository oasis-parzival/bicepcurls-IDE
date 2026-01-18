'use client';

import { useEffect, useRef } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { EditorTab } from '@/types';

interface CodeEditorProps {
    tabs: EditorTab[];
    activeTab: string | null;
    onTabChange: (tabId: string) => void;
    onTabClose: (tabId: string) => void;
    onContentChange: (tabId: string, content: string) => void;
}

export default function CodeEditor({
    tabs,
    activeTab,
    onTabChange,
    onTabClose,
    onContentChange,
}: CodeEditorProps) {
    const editorRef = useRef<any>(null);

    const handleEditorDidMount: OnMount = (editor, monaco) => {
        editorRef.current = editor;

        // Define cyber-hacker theme
        monaco.editor.defineTheme('cyber-hacker', {
            base: 'vs-dark',
            inherit: true,
            rules: [
                { token: 'comment', foreground: '00cc33', fontStyle: 'italic' },
                { token: 'keyword', foreground: '00ff41', fontStyle: 'bold' },
                { token: 'string', foreground: 'ffb000' },
                { token: 'number', foreground: 'ff0040' },
                { token: 'function', foreground: '00ffff' },
            ],
            colors: {
                'editor.background': '#0a0a0a',
                'editor.foreground': '#00ff41',
                'editor.lineHighlightBackground': '#1a1a1a',
                'editorCursor.foreground': '#00ff41',
                'editor.selectionBackground': '#2a2a2a',
                'editorLineNumber.foreground': '#00cc33',
                'editorLineNumber.activeForeground': '#00ff41',
            },
        });

        monaco.editor.setTheme('cyber-hacker');
    };

    const activeTabData = tabs.find((tab) => tab.id === activeTab);

    return (
        <div className="h-full flex flex-col bg-cyber-black">
            {/* Tab Bar */}
            <div className="flex border-b border-cyber-gray bg-cyber-darkgray overflow-x-auto">
                {tabs.length === 0 ? (
                    <div className="px-4 py-2 text-cyber-gray text-sm">No files open</div>
                ) : (
                    tabs.map((tab) => (
                        <div
                            key={tab.id}
                            className={`editor-tab ${tab.id === activeTab ? 'active' : ''} ${tab.isDirty ? 'dirty' : ''}`}
                            onClick={() => onTabChange(tab.id)}
                        >
                            <span>{tab.name}</span>
                            <button
                                className="ml-2 hover:text-cyber-red"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onTabClose(tab.id);
                                }}
                            >
                                ×
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Editor */}
            <div className="flex-1">
                {activeTabData ? (
                    <Editor
                        height="100%"
                        language={activeTabData.language}
                        value={activeTabData.content}
                        onMount={handleEditorDidMount}
                        onChange={(value) => {
                            if (value !== undefined) {
                                onContentChange(activeTabData.id, value);
                            }
                        }}
                        options={{
                            fontFamily: 'Fira Code, monospace',
                            fontSize: 14,
                            fontLigatures: true,
                            minimap: { enabled: false },
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                            tabSize: 2,
                            wordWrap: 'on',
                        }}
                    />
                ) : (
                    <div className="h-full flex items-center justify-center text-cyber-gray">
                        <div className="text-center">
                            <div className="text-6xl mb-4 terminal-glow">💪</div>
                            <div className="text-xl font-bold terminal-glow">BicepCurls IDE</div>
                            <div className="text-sm mt-2">Select a file to start coding</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
