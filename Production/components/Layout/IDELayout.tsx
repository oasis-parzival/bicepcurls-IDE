'use client';

import { useState, useEffect } from 'react';
import FileExplorer from '@/components/FileExplorer';
import SearchPanel from '@/components/SearchPanel';
import CodeEditor from '@/components/CodeEditor';
import AgentChat from '@/components/AgentChat';
import Terminal from '@/components/Terminal';
import { FileSystemManager } from '@/lib/fileSystem';
import { EditorTab, AgentContext } from '@/types';

// ── SVG Icon helpers ──────────────────────────────────────────────────────────
const IconFiles = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z" />
        <polyline points="13 2 13 9 20 9" />
    </svg>
);
const IconSearch = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);
const IconGit = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="18" cy="18" r="3" />
        <circle cx="6" cy="6" r="3" />
        <path d="M13 6h3a2 2 0 012 2v7" />
        <line x1="6" y1="9" x2="6" y2="21" />
    </svg>
);
const IconRun = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
);
const IconExtensions = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
    </svg>
);
const IconSettings = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
);
const IconBranch = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="6" y1="3" x2="6" y2="15" />
        <circle cx="18" cy="6" r="3" />
        <circle cx="6" cy="18" r="3" />
        <path d="M18 9a9 9 0 01-9 9" />
    </svg>
);
const IconError = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
);

// ─────────────────────────────────────────────────────────────────────────────

export default function IDELayout() {
    const [fileSystemManager] = useState(() => new FileSystemManager());
    const [fileSystem, setFileSystem] = useState(fileSystemManager.getFileSystem());
    const [selectedFile, setSelectedFile] = useState<string | null>(null);
    const [tabs, setTabs] = useState<EditorTab[]>([]);
    const [activeTab, setActiveTab] = useState<string | null>(null);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [mobileView, setMobileView] = useState<'editor' | 'chat'>('editor');
    const [showTerminal, setShowTerminal] = useState(true);
    const [isFullscreenPreview, setIsFullscreenPreview] = useState(false);
    const [activeActivity, setActiveActivity] = useState<'explorer' | 'search'>('explorer');

    // Initialize file system on client-side mount to prevent hydration errors
    useEffect(() => {
        const initialFS = fileSystemManager.initialize();
        setFileSystem(initialFS);
    }, [fileSystemManager]);

    // ── Fullscreen mode ──────────────────────────────────────────────────────
    const [isFullscreen, setIsFullscreen] = useState(false);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => { });
        } else {
            document.exitFullscreen().catch(() => { });
        }
    };

    // Sync state with actual fullscreen changes (e.g. user presses Escape)
    useEffect(() => {
        const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', onFsChange);
        return () => document.removeEventListener('fullscreenchange', onFsChange);
    }, []);

    // F11 keyboard shortcut
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'F11') {
                e.preventDefault();
                toggleFullscreen();
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, []);

    const handleFileSelect = (path: string) => {
        setSelectedFile(path);
        setShowMobileMenu(false);

        const existingTab = tabs.find((tab) => tab.path === path);
        if (existingTab) {
            setActiveTab(existingTab.id);
            return;
        }

        const content = fileSystemManager.readFile(path);
        if (content !== null) {
            const node = fileSystemManager.findNode(path);
            if (node && node.type === 'file') {
                const newTab: EditorTab = {
                    id: `tab-${Date.now()}`,
                    path,
                    name: node.name,
                    content,
                    language: node.language || 'plaintext',
                    isDirty: false,
                };
                setTabs((prev) => [...prev, newTab]);
                setActiveTab(newTab.id);
            }
        }
    };

    const handleTabClose = (tabId: string) => {
        setTabs((prev) => {
            const filtered = prev.filter((tab) => tab.id !== tabId);
            if (activeTab === tabId && filtered.length > 0) {
                setActiveTab(filtered[filtered.length - 1].id);
            } else if (filtered.length === 0) {
                setActiveTab(null);
            }
            return filtered;
        });
    };

    const handleContentChange = (tabId: string, content: string) => {
        setTabs((prev) =>
            prev.map((tab) => {
                if (tab.id === tabId) {
                    fileSystemManager.writeFile(tab.path, content);
                    return { ...tab, content, isDirty: true };
                }
                return tab;
            })
        );
    };

    const handleCommandExecute = (command: string) => {
        if ((window as any).terminalAddOutput) {
            (window as any).terminalAddOutput(`$ ${command}`, 'input');
            (window as any).terminalAddOutput(`Executing: ${command}`, 'output');
        }
    };

    const handleRun = () => {
        let htmlContent = fileSystemManager.readFile('/project/index.html');
        let htmlFileName = 'index.html';

        if (!htmlContent) {
            const htmlTab = tabs.find((tab) => tab.language === 'html');
            if (htmlTab) {
                htmlContent = htmlTab.content;
                htmlFileName = htmlTab.name;
            }
        }

        if (!htmlContent) {
            alert('No HTML file found! Please create or open an HTML file first.');
            return;
        }

        const cssContent = fileSystemManager.readFile('/project/style.css') || '';
        const jsContent = fileSystemManager.readFile('/project/script.js') || '';

        let bundledHTML = htmlContent;

        if (cssContent) {
            const styleTag = `<style>\n${cssContent}\n</style>`;
            bundledHTML = bundledHTML.replace(/<link[^>]*href=['"]style\.css['"][^>]*>/gi, '');
            if (bundledHTML.includes('</head>')) {
                bundledHTML = bundledHTML.replace('</head>', `  ${styleTag}\n</head>`);
            } else {
                bundledHTML = `<head>\n  ${styleTag}\n</head>\n${bundledHTML}`;
            }
        }

        if (jsContent) {
            const scriptTag = `<script>\n${jsContent}\n</script>`;
            bundledHTML = bundledHTML.replace(/<script[^>]*src=['"]script\.js['"][^>]*><\/script>/gi, '');
            if (bundledHTML.includes('</body>')) {
                bundledHTML = bundledHTML.replace('</body>', `  ${scriptTag}\n</body>`);
            } else {
                bundledHTML = `${bundledHTML}\n${scriptTag}`;
            }
        }

        const newWindow = window.open('', '_blank');
        if (newWindow) {
            newWindow.document.write(bundledHTML);
            newWindow.document.close();
            if ((window as any).terminalAddOutput) {
                (window as any).terminalAddOutput(`$ run ${htmlFileName}`, 'input');
                (window as any).terminalAddOutput(`✓ Opened ${htmlFileName} in new tab with bundled CSS and JS`, 'output');
            }
        } else {
            alert('Please allow popups for this site to use the Run feature!');
        }
    };

    const handleFullscreenPreview = () => {
        const htmlTab = tabs.find((tab) => tab.name === 'index.html');
        if (!htmlTab) {
            alert('Please open index.html first to use fullscreen preview!');
            return;
        }

        const cssContent = fileSystemManager.readFile('/project/style.css') || '';
        const jsContent = fileSystemManager.readFile('/project/script.js') || '';

        let bundledHTML = htmlTab.content;

        if (cssContent) {
            const styleTag = `<style>\n${cssContent}\n</style>`;
            bundledHTML = bundledHTML.replace(/<link[^>]*href=['"]style\.css['"][^>]*>/gi, '');
            if (bundledHTML.includes('</head>')) {
                bundledHTML = bundledHTML.replace('</head>', `  ${styleTag}\n</head>`);
            } else {
                bundledHTML = `<head>\n  ${styleTag}\n</head>\n${bundledHTML}`;
            }
        }

        if (jsContent) {
            const scriptTag = `<script>\n${jsContent}\n</script>`;
            bundledHTML = bundledHTML.replace(/<script[^>]*src=['"]script\.js['"][^>]*><\/script>/gi, '');
            if (bundledHTML.includes('</body>')) {
                bundledHTML = bundledHTML.replace('</body>', `  ${scriptTag}\n</body>`);
            } else {
                bundledHTML = `${bundledHTML}\n${scriptTag}`;
            }
        }

        (window as any).fullscreenPreviewHTML = bundledHTML;
        setIsFullscreenPreview(true);
    };

    const handleCreateFile = (fileName: string) => {
        const newFile = fileSystemManager.createFile('/project', fileName, '');
        if (newFile) {
            setFileSystem(fileSystemManager.getFileSystem());
            handleFileSelect(newFile.path);
            if ((window as any).terminalAddOutput) {
                (window as any).terminalAddOutput(`$ touch ${fileName}`, 'input');
                (window as any).terminalAddOutput(`✓ Created ${fileName}`, 'output');
            }
        } else {
            alert('Failed to create file. File may already exist.');
        }
    };

    const handleDeleteFile = (filePath: string) => {
        const fileName = filePath.split('/').pop();
        const success = fileSystemManager.deleteNode(filePath);
        if (success) {
            const tabToClose = tabs.find((tab) => tab.path === filePath);
            if (tabToClose) handleTabClose(tabToClose.id);
            setFileSystem(fileSystemManager.getFileSystem());
            if ((window as any).terminalAddOutput) {
                (window as any).terminalAddOutput(`$ rm ${fileName}`, 'input');
                (window as any).terminalAddOutput(`✓ Deleted ${fileName}`, 'output');
            }
        } else {
            alert('Failed to delete file.');
        }
    };

    const agentContext: AgentContext = {
        currentFile: selectedFile,
        openFiles: tabs.map((tab) => tab.path),
        fileTree: fileSystem,
        workingDirectory: '/project',
    };

    // ── Agent-driven file writes ──────────────────────────────────────────────────
    const handleApplyFileChange = (path: string, content: string) => {
        // Try to overwrite existing file
        let success = fileSystemManager.writeFile(path, content);

        if (!success) {
            // File does not exist yet — create it inside /project
            const parts = path.split('/');
            const fileName = parts[parts.length - 1];
            const parentPath = parts.slice(0, -1).join('/') || '/project';
            const newFile = fileSystemManager.createFile(parentPath, fileName, content);
            success = !!newFile;
        }

        if (success) {
            // Live-update the editor tab if the file is currently open
            setTabs((prev) =>
                prev.map((tab) =>
                    tab.path === path
                        ? { ...tab, content, isDirty: false }
                        : tab
                )
            );
            // Refresh the sidebar file tree
            setFileSystem(fileSystemManager.getFileSystem());
            // Show confirmation in terminal
            if ((window as any).terminalAddOutput) {
                (window as any).terminalAddOutput(`$ write ${path.split('/').pop()}`, 'input');
                (window as any).terminalAddOutput(`✔ Freeweight applied changes to ${path.split('/').pop()}`, 'output');
            }
        }
    };

    // Derive current language for status bar
    const activeTabData = tabs.find(t => t.id === activeTab);
    const currentLang = activeTabData?.language ?? 'plaintext';

    return (
        <div className="h-screen flex flex-col overflow-hidden" style={{ background: '#1e1e1e', color: '#cccccc' }}>

            {/* ── Title Bar ─────────────────────────────────────────────── */}
            <div
                id="ide-header"
                className="flex items-center justify-between flex-shrink-0 px-3"
                style={{ height: '38px', background: '#3c3c3c', borderBottom: '1px solid #252526', fontSize: '13px' }}
            >
                {/* Left: App identity */}
                <div className="flex items-center gap-2">
                    <span style={{ fontSize: '16px' }}>💪</span>
                    <span style={{ color: '#cccccc', fontWeight: 500 }}>BicepCurls IDE</span>
                    <span style={{ color: '#858585', fontSize: '12px' }} className="hidden md:inline">
                        — The Agentic Web IDE
                    </span>
                </div>

                {/* Right: Desktop action buttons */}
                <div className="hidden md:flex items-center gap-1.5">
                    <button onClick={handleFullscreenPreview} className="vsc-btn" title="Fullscreen Preview">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                        </svg>
                        Preview
                    </button>
                    <button onClick={handleRun} className="vsc-btn vsc-btn-primary" title="Run HTML in new tab">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                            <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                        Run
                    </button>
                    <button
                        onClick={() => setShowTerminal(!showTerminal)}
                        className="vsc-btn"
                        title={showTerminal ? 'Hide Terminal' : 'Show Terminal'}
                    >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="4 17 10 11 4 5" />
                            <line x1="12" y1="19" x2="20" y2="19" />
                        </svg>
                        Terminal
                    </button>

                    {/* Fullscreen toggle */}
                    <button
                        onClick={toggleFullscreen}
                        className="vsc-btn"
                        title={isFullscreen ? 'Exit Fullscreen (F11)' : 'Enter Fullscreen (F11)'}
                    >
                        {isFullscreen ? (
                            /* Exit fullscreen icon */
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M8 3v3a2 2 0 01-2 2H3" />
                                <path d="M21 8h-3a2 2 0 01-2-2V3" />
                                <path d="M3 16h3a2 2 0 012 2v3" />
                                <path d="M16 21v-3a2 2 0 012-2h3" />
                            </svg>
                        ) : (
                            /* Enter fullscreen icon */
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M8 3H5a2 2 0 00-2 2v3" />
                                <path d="M21 8V5a2 2 0 00-2-2h-3" />
                                <path d="M3 16v3a2 2 0 002 2h3" />
                                <path d="M16 21h3a2 2 0 002-2v-3" />
                            </svg>
                        )}
                        {isFullscreen ? 'Exit FS' : 'Fullscreen'}
                    </button>
                </div>

                {/* Mobile controls */}
                <div className="md:hidden flex items-center gap-1">
                    <button onClick={handleRun} className="vsc-btn vsc-btn-primary text-xs py-1 px-2">▶</button>
                    <button
                        className={`vsc-btn text-xs py-1 px-2 ${mobileView === 'editor' ? 'vsc-btn-primary' : ''}`}
                        onClick={() => setMobileView('editor')}
                    >Code</button>
                    <button
                        className={`vsc-btn text-xs py-1 px-2 ${mobileView === 'chat' ? 'vsc-btn-primary' : ''}`}
                        onClick={() => setMobileView('chat')}
                    >AI</button>
                    <button
                        className="vsc-btn text-xs py-1 px-2"
                        onClick={() => setShowMobileMenu(!showMobileMenu)}
                    >☰</button>
                </div>
            </div>

            {/* ── Main Workspace ─────────────────────────────────────────── */}
            <div className="flex-1 flex overflow-hidden">

                {/* Activity Bar */}
                <div
                    className="flex-shrink-0 flex-col items-center py-1 hidden md:flex"
                    style={{ width: '48px', background: '#333333', borderRight: '1px solid #252526' }}
                >
                    {/* Top icons */}
                    <div className="flex flex-col items-center">
                        <button
                            className={`activity-icon ${activeActivity === 'explorer' ? 'active' : ''}`}
                            title="Explorer"
                            onClick={() => setActiveActivity('explorer')}
                        >
                            <IconFiles />
                        </button>
                        <button
                            className={`activity-icon ${activeActivity === 'search' ? 'active' : ''}`}
                            title="Search (Ctrl+Shift+F)"
                            onClick={() => setActiveActivity(activeActivity === 'search' ? 'explorer' : 'search')}
                        >
                            <IconSearch />
                        </button>
                        <button className="activity-icon" title="Source Control">
                            <IconGit />
                        </button>
                        <button className="activity-icon" title="Run & Debug">
                            <IconRun />
                        </button>
                        <button className="activity-icon" title="Extensions">
                            <IconExtensions />
                        </button>
                    </div>

                    {/* Bottom: Settings */}
                    <div className="mt-auto">
                        <button className="activity-icon" title="Settings">
                            <IconSettings />
                        </button>
                    </div>
                </div>

                {/* ── Sidebar (File Explorer / Search) ────────────────── */}
                <div
                    className={`flex-shrink-0 ${showMobileMenu ? 'block absolute z-40 h-full' : 'hidden'} md:block`}
                    style={{ width: '240px', background: '#252526', borderRight: '1px solid #3e3e42' }}
                >
                    {activeActivity === 'search' ? (
                        <SearchPanel
                            fileSystemManager={fileSystemManager}
                            onFileSelect={handleFileSelect}
                        />
                    ) : (
                        <FileExplorer
                            fileSystem={fileSystem}
                            onFileSelect={handleFileSelect}
                            selectedFile={selectedFile}
                            onCreateFile={handleCreateFile}
                            onDeleteFile={handleDeleteFile}
                        />
                    )}
                </div>

                {/* ── Editor + Terminal ───────────────────────────────── */}
                <div className={`flex-1 flex flex-col overflow-hidden ${mobileView !== 'editor' ? 'hidden md:flex' : 'flex'}`}>
                    {/* Code Editor */}
                    <div className="flex-1 overflow-hidden">
                        <CodeEditor
                            tabs={tabs}
                            activeTab={activeTab}
                            onTabChange={setActiveTab}
                            onTabClose={handleTabClose}
                            onContentChange={handleContentChange}
                        />
                    </div>

                    {/* Terminal Panel — desktop only, toggleable */}
                    {showTerminal && (
                        <div
                            id="ide-terminal"
                            className="flex-shrink-0 hidden lg:flex flex-col"
                            style={{ height: '200px', borderTop: '1px solid #3e3e42' }}
                        >
                            <Terminal onCommandExecute={handleCommandExecute} />
                        </div>
                    )}
                </div>

                {/* ── AI Chat Panel (Freeweight / Copilot-style) ──────── */}
                <div
                    className={`flex-shrink-0 ${mobileView === 'chat' ? 'flex md:flex' : 'hidden md:flex'} flex-col overflow-hidden`}
                    style={{ width: '340px', background: '#252526', borderLeft: '1px solid #3e3e42' }}
                >
                    <AgentChat
                        context={agentContext}
                        onCommandExecute={handleCommandExecute}
                        fileSystemManager={fileSystemManager}
                        onApplyFileChange={handleApplyFileChange}
                    />
                </div>
            </div>

            {/* ── Status Bar ─────────────────────────────────────────────── */}
            <div
                className="flex items-center justify-between flex-shrink-0"
                style={{ height: '22px', background: '#007acc', color: '#ffffff', fontSize: '12px' }}
            >
                {/* Left group */}
                <div className="flex items-center h-full">
                    <div className="status-item gap-1.5">
                        <IconBranch />
                        <span>main</span>
                    </div>
                    <div className="status-item" style={{ gap: '6px' }}>
                        <IconError />
                        <span>0</span>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                        <span>0</span>
                    </div>
                </div>

                {/* Right group */}
                <div className="flex items-center h-full">
                    {activeTabData && (
                        <>
                            <div className="status-item">
                                {activeTabData.path.replace('/project/', '')}
                            </div>
                            <div className="status-item" style={{ textTransform: 'capitalize' }}>
                                {currentLang}
                            </div>
                        </>
                    )}
                    <div className="status-item">UTF-8</div>
                    <div className="status-item">LF</div>
                    <div className="status-item">
                        <span>💪 Freeweight</span>
                    </div>
                </div>
            </div>

            {/* ── Fullscreen Preview Overlay ─────────────────────────────── */}
            {isFullscreenPreview && (
                <div
                    className="fixed inset-0 z-50"
                    style={{ background: '#1e1e1e' }}
                >
                    <button
                        onClick={() => setIsFullscreenPreview(false)}
                        className="fixed top-3 right-3 z-50 vsc-btn"
                        style={{ background: '#3c3c3c' }}
                    >
                        ✕ Exit Preview
                    </button>
                    <iframe
                        srcDoc={(window as any).fullscreenPreviewHTML || ''}
                        className="w-full h-full border-none bg-white"
                        sandbox="allow-scripts allow-same-origin"
                        title="Fullscreen Preview"
                    />
                </div>
            )}
        </div>
    );
}
