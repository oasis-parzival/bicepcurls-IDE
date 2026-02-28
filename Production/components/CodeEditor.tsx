'use client';

import { useRef } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { EditorTab } from '@/types';

interface CodeEditorProps {
    tabs: EditorTab[];
    activeTab: string | null;
    onTabChange: (tabId: string) => void;
    onTabClose: (tabId: string) => void;
    onContentChange: (tabId: string, content: string) => void;
}

// ── File-type icon color (mirrors FileExplorer) ───────────────────────────────
function getFileColor(name: string): string {
    const ext = name.split('.').pop()?.toLowerCase() ?? '';
    const map: Record<string, string> = {
        html: '#e34c26', css: '#264de4', js: '#f0db4f', jsx: '#61dafb',
        ts: '#3178c6', tsx: '#3178c6', json: '#f5a623', md: '#519aba',
        py: '#3572a5', java: '#b07219', cpp: '#f34b7d', go: '#00add8',
        rs: '#dea584', rb: '#cc342d', sh: '#89e051',
    };
    return map[ext] ?? '#858585';
}

function TabFileIcon({ name }: { name: string }) {
    return (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
            stroke={getFileColor(name)} strokeWidth="1.8" style={{ flexShrink: 0 }}>
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14 2 14 8 20 8" />
        </svg>
    );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function CodeEditor({ tabs, activeTab, onTabChange, onTabClose, onContentChange }: CodeEditorProps) {
    const editorRef = useRef<any>(null);

    const handleEditorDidMount: OnMount = (editor, monaco) => {
        editorRef.current = editor;

        // VSCode Dark+ faithful recreation
        monaco.editor.defineTheme('vscode-dark-plus', {
            base: 'vs-dark',
            inherit: true,
            rules: [
                { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
                { token: 'keyword', foreground: '569cd6' },
                { token: 'keyword.control', foreground: 'c586c0' },
                { token: 'string', foreground: 'ce9178' },
                { token: 'string.html', foreground: 'ce9178' },
                { token: 'number', foreground: 'b5cea8' },
                { token: 'delimiter', foreground: 'd4d4d4' },
                { token: 'type', foreground: '4ec9b0' },
                { token: 'class', foreground: '4ec9b0' },
                { token: 'function', foreground: 'dcdcaa' },
                { token: 'variable', foreground: '9cdcfe' },
                { token: 'variable.predefined', foreground: '4fc1ff' },
                { token: 'constant', foreground: '4fc1ff' },
                { token: 'entity.name.tag', foreground: '4ec9b0' },
                { token: 'attribute.name', foreground: '9cdcfe' },
                { token: 'attribute.value', foreground: 'ce9178' },
                { token: 'tag', foreground: '569cd6' },
                { token: 'metatag', foreground: 'c586c0' },
                { token: 'operator', foreground: 'd4d4d4' },
                { token: 'regexp', foreground: 'd16969' },
            ],
            colors: {
                'editor.background': '#1e1e1e',
                'editor.foreground': '#d4d4d4',
                'editor.lineHighlightBackground': '#2d2d2d',
                'editorLineNumber.foreground': '#858585',
                'editorLineNumber.activeForeground': '#c6c6c6',
                'editorCursor.foreground': '#aeafad',
                'editor.selectionBackground': '#264f78',
                'editor.inactiveSelectionBackground': '#3a3d41',
                'editor.wordHighlightBackground': '#575757b8',
                'editorBracketMatch.background': '#0064001a',
                'editorBracketMatch.border': '#888888',
                'editorWidget.background': '#252526',
                'editorSuggestWidget.background': '#252526',
                'editorSuggestWidget.border': '#454545',
                'editorSuggestWidget.selectedBackground': '#094771',
                'input.background': '#3c3c3c',
                'input.border': '#3c3c3c',
                'scrollbarSlider.background': '#42424260',
                'scrollbarSlider.hoverBackground': '#686868b3',
                'scrollbarSlider.activeBackground': '#bfbfbf66',
                'editorGutter.background': '#1e1e1e',
                'editorIndentGuide.background': '#404040',
                'editorIndentGuide.activeBackground': '#707070',
            },
        });

        monaco.editor.setTheme('vscode-dark-plus');
    };

    const activeTabData = tabs.find((tab) => tab.id === activeTab);

    return (
        <div className="h-full flex flex-col" style={{ background: '#1e1e1e' }}>

            {/* ── Tab Bar ─────────────────────────────────────────────── */}
            <div
                className="flex overflow-x-auto flex-shrink-0"
                style={{ background: '#2d2d2d', borderBottom: '1px solid #252526', minHeight: '35px' }}
            >
                {tabs.length === 0 ? (
                    <div
                        className="flex items-center px-4"
                        style={{ color: '#858585', fontSize: '13px' }}
                    >
                        No files open
                    </div>
                ) : (
                    tabs.map((tab) => (
                        <div
                            key={tab.id}
                            className={`editor-tab ${tab.id === activeTab ? 'active' : ''} ${tab.isDirty ? 'dirty' : ''}`}
                            onClick={() => onTabChange(tab.id)}
                            title={tab.path}
                        >
                            <TabFileIcon name={tab.name} />

                            <span className="truncate flex-1" style={{ maxWidth: '120px', fontSize: '13px' }}>
                                {tab.name}
                            </span>

                            {/* Dirty or close button */}
                            <button
                                className="tab-close-btn"
                                onClick={(e) => { e.stopPropagation(); onTabClose(tab.id); }}
                                title="Close"
                            >
                                {tab.isDirty ? (
                                    <span style={{ fontSize: '10px', color: '#cccccc', lineHeight: 1 }}>●</span>
                                ) : (
                                    <span style={{ fontSize: '16px', lineHeight: 1 }}>×</span>
                                )}
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* ── Breadcrumb ──────────────────────────────────────────── */}
            {activeTabData && (
                <div
                    className="flex items-center flex-shrink-0 px-3"
                    style={{
                        height: '22px',
                        background: '#1e1e1e',
                        borderBottom: '1px solid #3e3e42',
                        fontSize: '12px',
                        color: '#858585',
                        gap: '4px',
                    }}
                >
                    <span>project</span>
                    <span className="breadcrumb-sep">›</span>
                    <span style={{ color: '#cccccc' }}>{activeTabData.name}</span>
                </div>
            )}

            {/* ── Monaco Editor ────────────────────────────────────────── */}
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
                            fontFamily: '"JetBrains Mono", Consolas, "Courier New", monospace',
                            fontSize: 13,
                            fontLigatures: true,
                            lineHeight: 22,
                            minimap: { enabled: false },
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                            tabSize: 2,
                            wordWrap: 'on',
                            renderWhitespace: 'selection',
                            smoothScrolling: true,
                            cursorBlinking: 'smooth',
                            cursorSmoothCaretAnimation: 'on',
                            bracketPairColorization: { enabled: true },
                            guides: {
                                bracketPairs: true,
                                indentation: true,
                            },
                            padding: { top: 12, bottom: 12 },
                            scrollbar: {
                                verticalScrollbarSize: 6,
                                horizontalScrollbarSize: 6,
                            },
                            overviewRulerLanes: 0,
                        }}
                    />
                ) : (
                    /* ── Empty welcome state ── */
                    <div
                        className="h-full flex flex-col items-center justify-center"
                        style={{ background: '#1e1e1e', color: '#858585', userSelect: 'none' }}
                    >
                        <div style={{ marginBottom: '24px', opacity: 0.3 }}>
                            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8">
                                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                                <line x1="16" y1="13" x2="8" y2="13" />
                                <line x1="16" y1="17" x2="8" y2="17" />
                                <polyline points="10 9 9 9 8 9" />
                            </svg>
                        </div>
                        <div style={{ fontSize: '24px', fontWeight: 300, marginBottom: '8px', color: '#cccccc', opacity: 0.6 }}>
                            BicepCurls IDE
                        </div>
                        <div style={{ fontSize: '13px', opacity: 0.5, marginBottom: '24px' }}>
                            Select a file from the Explorer to start editing
                        </div>
                        <div style={{ fontSize: '12px', opacity: 0.4, lineHeight: 2, textAlign: 'center' }}>
                            <div>💪 Freeweight AI is ready to assist</div>
                            <div>Open a file · Chat with AI · Run your code</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
