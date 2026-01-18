'use client';

import { useState, useEffect } from 'react';
import FileExplorer from '@/components/FileExplorer';
import CodeEditor from '@/components/CodeEditor';
import AgentChat from '@/components/AgentChat';
import Terminal from '@/components/Terminal';
import { FileSystemManager } from '@/lib/fileSystem';
import { EditorTab, AgentContext } from '@/types';

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

    // Initialize file system on client-side mount to prevent hydration errors
    useEffect(() => {
        const initialFS = fileSystemManager.initialize();
        setFileSystem(initialFS);
    }, [fileSystemManager]);

    const handleFileSelect = (path: string) => {
        setSelectedFile(path);
        setShowMobileMenu(false); // Close mobile menu after selection

        // Check if file is already open
        const existingTab = tabs.find((tab) => tab.path === path);
        if (existingTab) {
            setActiveTab(existingTab.id);
            return;
        }

        // Open new tab
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
                    // Save to file system
                    fileSystemManager.writeFile(tab.path, content);
                    return { ...tab, content, isDirty: true };
                }
                return tab;
            })
        );
    };

    const handleCommandExecute = (command: string) => {
        // Add command to terminal via global function
        if ((window as any).terminalAddOutput) {
            (window as any).terminalAddOutput(`$ ${command}`, 'input');
            (window as any).terminalAddOutput(`Executing: ${command}`, 'output');
        }
    };

    const handleRun = () => {
        // Find HTML file (prioritize index.html, then any .html file)
        let htmlContent = fileSystemManager.readFile('/project/index.html');
        let htmlFileName = 'index.html';

        if (!htmlContent) {
            // Try to find any HTML file in open tabs
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

        // Get CSS and JS content
        const cssContent = fileSystemManager.readFile('/project/style.css') || '';
        const jsContent = fileSystemManager.readFile('/project/script.js') || '';

        // Bundle everything together
        let bundledHTML = htmlContent;

        // Replace external CSS link with inline styles
        if (cssContent) {
            const styleTag = `<style>\n${cssContent}\n</style>`;

            // Remove existing link to style.css
            bundledHTML = bundledHTML.replace(/<link[^>]*href=["']style\.css["'][^>]*>/gi, '');

            // Inject inline styles
            if (bundledHTML.includes('</head>')) {
                bundledHTML = bundledHTML.replace('</head>', `  ${styleTag}\n</head>`);
            } else if (bundledHTML.includes('<head>')) {
                bundledHTML = bundledHTML.replace('<head>', `<head>\n  ${styleTag}`);
            } else {
                bundledHTML = `<head>\n  ${styleTag}\n</head>\n${bundledHTML}`;
            }
        }

        // Replace external JS script with inline script
        if (jsContent) {
            const scriptTag = `<script>\n${jsContent}\n</script>`;

            // Remove existing script tag for script.js
            bundledHTML = bundledHTML.replace(/<script[^>]*src=["']script\.js["'][^>]*><\/script>/gi, '');

            // Inject inline script
            if (bundledHTML.includes('</body>')) {
                bundledHTML = bundledHTML.replace('</body>', `  ${scriptTag}\n</body>`);
            } else {
                bundledHTML = `${bundledHTML}\n${scriptTag}`;
            }
        }

        // Open in new tab
        const newWindow = window.open('', '_blank');
        if (newWindow) {
            newWindow.document.write(bundledHTML);
            newWindow.document.close();

            // Add to terminal
            if ((window as any).terminalAddOutput) {
                (window as any).terminalAddOutput(`$ run ${htmlFileName}`, 'input');
                (window as any).terminalAddOutput(`✓ Opened ${htmlFileName} in new tab with bundled CSS and JS`, 'output');
            }
        } else {
            alert('Please allow popups for this site to use the Run feature!');
        }
    };

    const handleFullscreenPreview = () => {
        // Get current HTML content from tabs
        const htmlTab = tabs.find((tab) => tab.name === 'index.html');
        if (!htmlTab) {
            alert('Please open index.html first to use fullscreen preview!');
            return;
        }

        // Get CSS and JS content
        const cssContent = fileSystemManager.readFile('/project/style.css') || '';
        const jsContent = fileSystemManager.readFile('/project/script.js') || '';

        // Bundle everything
        let bundledHTML = htmlTab.content;

        // Inject CSS
        if (cssContent) {
            const styleTag = `<style>\n${cssContent}\n</style>`;
            bundledHTML = bundledHTML.replace(/<link[^>]*href=["']style\.css["'][^>]*>/gi, '');
            if (bundledHTML.includes('</head>')) {
                bundledHTML = bundledHTML.replace('</head>', `  ${styleTag}\n</head>`);
            } else if (bundledHTML.includes('<head>')) {
                bundledHTML = bundledHTML.replace('<head>', `<head>\n  ${styleTag}`);
            } else {
                bundledHTML = `<head>\n  ${styleTag}\n</head>\n${bundledHTML}`;
            }
        }

        // Inject JS
        if (jsContent) {
            const scriptTag = `<script>\n${jsContent}\n</script>`;
            bundledHTML = bundledHTML.replace(/<script[^>]*src=["']script\.js["'][^>]*><\/script>/gi, '');
            if (bundledHTML.includes('</body>')) {
                bundledHTML = bundledHTML.replace('</body>', `  ${scriptTag}\n</body>`);
            } else {
                bundledHTML = `${bundledHTML}\n${scriptTag}`;
            }
        }

        // Store bundled HTML and show fullscreen
        (window as any).fullscreenPreviewHTML = bundledHTML;
        setIsFullscreenPreview(true);
    };



    const handleCreateFile = (fileName: string) => {
        // Create file in /project directory
        const newFile = fileSystemManager.createFile('/project', fileName, '');

        if (newFile) {
            // Refresh file system display
            setFileSystem(fileSystemManager.getFileSystem());

            // Open the new file in editor
            handleFileSelect(newFile.path);

            // Add to terminal
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

        // Delete file from file system
        const success = fileSystemManager.deleteNode(filePath);

        if (success) {
            // Close tab if it's open
            const tabToClose = tabs.find((tab) => tab.path === filePath);
            if (tabToClose) {
                handleTabClose(tabToClose.id);
            }

            // Refresh file system display
            setFileSystem(fileSystemManager.getFileSystem());

            // Add to terminal
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

    return (
        <div className="h-screen flex flex-col bg-cyber-black text-cyber-green overflow-hidden">
            {/* Scanline effect overlay */}
            <div className="scanline-effect pointer-events-none" />

            {/* Top Bar */}
            <div id="ide-header" className="h-12 bg-cyber-darkgray border-b border-cyber-green flex items-center px-4 justify-between flex-shrink-0 z-10">
                <div className="flex items-center gap-3">
                    <span className="text-2xl">💪</span>
                    <h1 className="text-xl font-bold terminal-glow">BicepCurls</h1>
                    <span className="text-xs text-cyber-gray hidden md:inline">// The Agentic Web IDE</span>
                </div>

                {/* Desktop Controls */}
                <div className="hidden md:flex items-center gap-2">

                    <button
                        onClick={handleFullscreenPreview}
                        className="cyber-button items-center gap-2 text-xs px-3 py-1"
                        title="Fullscreen Preview"
                    >
                        <span>👁</span>
                        <span>PREVIEW</span>
                    </button>
                    <button
                        onClick={handleRun}
                        className="cyber-button items-center gap-2 text-sm"
                        title="Run HTML file in new tab"
                    >
                        <span>▶</span>
                        <span>RUN</span>
                    </button>
                    <button
                        onClick={() => setShowTerminal(!showTerminal)}
                        className="cyber-button items-center gap-2 text-xs px-3 py-1"
                        title={showTerminal ? 'Hide Terminal' : 'Show Terminal'}
                    >
                        <span>{showTerminal ? '▼' : '▲'}</span>
                        <span>TERMINAL</span>
                    </button>
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    className="md:hidden cyber-button text-xs py-1 px-2"
                    onClick={() => setShowMobileMenu(!showMobileMenu)}
                >
                    MENU
                </button>

                {/* Mobile View Switcher */}
                <div className="md:hidden flex gap-1">
                    <button
                        onClick={handleRun}
                        className="text-xs py-1 px-2 cyber-button"
                        title="Run"
                    >
                        ▶
                    </button>
                    <button
                        className={`text-xs py-1 px-2 ${mobileView === 'editor' ? 'cyber-button' : 'text-cyber-gray'}`}
                        onClick={() => setMobileView('editor')}
                    >
                        CODE
                    </button>
                    <button
                        className={`text-xs py-1 px-2 ${mobileView === 'chat' ? 'cyber-button' : 'text-cyber-gray'}`}
                        onClick={() => setMobileView('chat')}
                    >
                        AI
                    </button>
                </div>
            </div>

            {/* Main Layout - Fixed height, no scrolling on main container */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Sidebar - File Explorer */}
                <div className={`w-64 flex-shrink-0 ${showMobileMenu ? 'block absolute z-40 h-full' : 'hidden'} md:block`}>
                    <FileExplorer
                        fileSystem={fileSystem}
                        onFileSelect={handleFileSelect}
                        selectedFile={selectedFile}
                        onCreateFile={handleCreateFile}
                        onDeleteFile={handleDeleteFile}
                    />
                </div>

                {/* Center - Code Editor + Terminal */}
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

                    {/* Terminal - Desktop only, toggleable */}
                    {showTerminal && (
                        <div id="ide-terminal" className="h-48 flex-shrink-0 hidden lg:block">
                            <Terminal onCommandExecute={handleCommandExecute} />
                        </div>
                    )}
                </div>

                {/* Right Sidebar - FULL HEIGHT FREEWEIGHT CHAT */}
                <div className={`w-96 flex-shrink-0 ${mobileView === 'chat' ? 'flex md:flex' : 'hidden md:flex'} flex-col overflow-hidden`}>
                    <AgentChat
                        context={agentContext}
                        onCommandExecute={handleCommandExecute}
                        fileSystemManager={fileSystemManager}
                    />
                </div>
            </div>

            {/* Fullscreen Preview Overlay */}
            {isFullscreenPreview && (
                <div className="fixed inset-0 z-50 bg-cyber-black">
                    {/* Exit Button */}
                    <button
                        onClick={() => setIsFullscreenPreview(false)}
                        className="fixed top-4 right-4 z-50 cyber-button shadow-lg"
                    >
                        ✕ EXIT FULLSCREEN
                    </button>

                    {/* Preview Frame */}
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
