'use client';

import { useState } from 'react';
import { FileNode } from '@/types';

interface FileExplorerProps {
    fileSystem: FileNode[];
    onFileSelect: (path: string) => void;
    selectedFile: string | null;
    onCreateFile?: (fileName: string) => void;
    onDeleteFile?: (path: string) => void;
}

export default function FileExplorer({
    fileSystem,
    onFileSelect,
    selectedFile,
    onCreateFile,
    onDeleteFile
}: FileExplorerProps) {
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['/project']));
    const [showCreateInput, setShowCreateInput] = useState(false);
    const [newFileName, setNewFileName] = useState('');

    const toggleFolder = (path: string) => {
        setExpandedFolders((prev) => {
            const next = new Set(prev);
            if (next.has(path)) {
                next.delete(path);
            } else {
                next.add(path);
            }
            return next;
        });
    };

    const handleCreateFile = () => {
        if (newFileName.trim() && onCreateFile) {
            onCreateFile(newFileName.trim());
            setNewFileName('');
            setShowCreateInput(false);
        }
    };

    const handleDeleteFile = (path: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (onDeleteFile && confirm(`Delete ${path.split('/').pop()}?`)) {
            onDeleteFile(path);
        }
    };

    const renderNode = (node: FileNode, depth: number = 0) => {
        const isExpanded = expandedFolders.has(node.path);
        const isSelected = selectedFile === node.path;

        if (node.type === 'folder') {
            return (
                <div key={node.id}>
                    <div
                        className={`file-tree-item folder ${isExpanded ? 'open' : ''} ${isSelected ? 'active' : ''}`}
                        style={{ paddingLeft: `${depth * 16 + 8}px` }}
                        onClick={() => toggleFolder(node.path)}
                    >
                        <span className="terminal-glow">{node.name}</span>
                    </div>
                    {isExpanded && node.children && (
                        <div>
                            {node.children.map((child) => renderNode(child, depth + 1))}
                        </div>
                    )}
                </div>
            );
        }

        return (
            <div
                key={node.id}
                className={`file-tree-item file ${isSelected ? 'active' : ''} group`}
                style={{ paddingLeft: `${depth * 16 + 8}px` }}
                onClick={() => onFileSelect(node.path)}
            >
                <span className="flex-1">{node.name}</span>
                {onDeleteFile && (
                    <button
                        onClick={(e) => handleDeleteFile(node.path, e)}
                        className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-400 text-xs px-1"
                        title="Delete file"
                    >
                        ✕
                    </button>
                )}
            </div>
        );
    };

    return (
        <div className="h-full bg-cyber-black border-r border-cyber-gray overflow-y-auto flex flex-col">
            <div className="p-3 border-b border-cyber-gray flex-shrink-0">
                <div className="flex items-center justify-between">
                    <h2 className="text-cyber-green font-bold terminal-glow text-sm">FILE EXPLORER</h2>
                    {onCreateFile && (
                        <button
                            onClick={() => setShowCreateInput(!showCreateInput)}
                            className="text-cyber-green hover:text-cyber-black hover:bg-cyber-green px-2 py-1 text-xs border border-cyber-green"
                            title="New File"
                        >
                            + NEW
                        </button>
                    )}
                </div>

                {showCreateInput && (
                    <div className="mt-2 flex gap-1">
                        <input
                            type="text"
                            value={newFileName}
                            onChange={(e) => setNewFileName(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleCreateFile()}
                            placeholder="filename.ext"
                            className="flex-1 bg-cyber-darkgray border border-cyber-green text-cyber-green px-2 py-1 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-cyber-green"
                            autoFocus
                        />
                        <button
                            onClick={handleCreateFile}
                            className="cyber-button text-xs px-2 py-1"
                        >
                            ✓
                        </button>
                        <button
                            onClick={() => {
                                setShowCreateInput(false);
                                setNewFileName('');
                            }}
                            className="text-cyber-gray hover:text-cyber-green text-xs px-2 py-1"
                        >
                            ✕
                        </button>
                    </div>
                )}
            </div>
            <div className="py-2 flex-1 overflow-y-auto">
                {fileSystem.map((node) => renderNode(node))}
            </div>
        </div>
    );
}

