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

// ── File-type icon helper ─────────────────────────────────────────────────────
interface FileIconInfo { color: string; label: string; }

function getFileIconInfo(name: string): FileIconInfo {
    const ext = name.split('.').pop()?.toLowerCase() ?? '';
    const map: Record<string, FileIconInfo> = {
        html: { color: '#e34c26', label: 'HTML' },
        css: { color: '#264de4', label: 'CSS' },
        js: { color: '#f0db4f', label: 'JS' },
        jsx: { color: '#61dafb', label: 'JSX' },
        ts: { color: '#3178c6', label: 'TS' },
        tsx: { color: '#3178c6', label: 'TSX' },
        json: { color: '#f5a623', label: 'JSON' },
        md: { color: '#519aba', label: 'MD' },
        py: { color: '#3572a5', label: 'PY' },
        java: { color: '#b07219', label: 'JAVA' },
        cpp: { color: '#f34b7d', label: 'C++' },
        c: { color: '#555555', label: 'C' },
        go: { color: '#00add8', label: 'GO' },
        rs: { color: '#dea584', label: 'RS' },
        php: { color: '#777bb4', label: 'PHP' },
        rb: { color: '#cc342d', label: 'RB' },
        sh: { color: '#89e051', label: 'SH' },
    };
    return map[ext] ?? { color: '#858585', label: '' };
}

// ── File icon SVG  ────────────────────────────────────────────────────────────
function FileIcon({ name }: { name: string }) {
    const { color } = getFileIconInfo(name);
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" style={{ flexShrink: 0 }}>
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14 2 14 8 20 8" />
        </svg>
    );
}

// ── Folder icons (open / closed) ──────────────────────────────────────────────
function FolderIcon({ open }: { open: boolean }) {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill={open ? '#dcb67a' : '#c09553'} stroke="none" style={{ flexShrink: 0 }}>
            {open
                ? <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
                : <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
            }
        </svg>
    );
}

// ── Chevron ───────────────────────────────────────────────────────────────────
function Chevron({ open }: { open: boolean }) {
    return (
        <svg
            width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
            style={{ flexShrink: 0, color: '#858585', transform: open ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.12s' }}
        >
            <polyline points="9 18 15 12 9 6" />
        </svg>
    );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function FileExplorer({
    fileSystem,
    onFileSelect,
    selectedFile,
    onCreateFile,
    onDeleteFile,
}: FileExplorerProps) {
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['/project']));
    const [showCreateInput, setShowCreateInput] = useState(false);
    const [newFileName, setNewFileName] = useState('');

    const toggleFolder = (path: string) => {
        setExpandedFolders((prev) => {
            const next = new Set(prev);
            if (next.has(path)) { next.delete(path); } else { next.add(path); }
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
                        className={`file-tree-item folder ${isSelected ? 'active' : ''}`}
                        style={{ paddingLeft: `${depth * 12 + 8}px`, gap: '4px' }}
                        onClick={() => toggleFolder(node.path)}
                    >
                        <Chevron open={isExpanded} />
                        <FolderIcon open={isExpanded} />
                        <span style={{ fontSize: '13px', color: '#cccccc' }}>{node.name}</span>
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
                style={{ paddingLeft: `${depth * 12 + 8 + 16}px`, gap: '5px' }}
                onClick={() => onFileSelect(node.path)}
            >
                <FileIcon name={node.name} />
                <span className="flex-1 truncate" style={{ fontSize: '13px' }}>{node.name}</span>
                {onDeleteFile && (
                    <button
                        onClick={(e) => handleDeleteFile(node.path, e)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity px-1 rounded"
                        style={{ color: '#858585', fontSize: '14px', lineHeight: 1, flexShrink: 0 }}
                        title="Delete file"
                    >
                        ×
                    </button>
                )}
            </div>
        );
    };

    return (
        <div
            className="h-full flex flex-col overflow-hidden"
            style={{ background: '#252526' }}
        >
            {/* Section header */}
            <div className="sidebar-section-title">
                <span>Explorer</span>
                {onCreateFile && (
                    <button
                        onClick={() => setShowCreateInput(!showCreateInput)}
                        className="vsc-btn vsc-btn-icon"
                        title="New File"
                        style={{ border: 'none', background: 'transparent', color: '#cccccc', padding: '2px 4px' }}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="12" y1="18" x2="12" y2="12" />
                            <line x1="9" y1="15" x2="15" y2="15" />
                        </svg>
                    </button>
                )}
            </div>

            {/* PROJECT section label */}
            <div
                className="flex items-center gap-1 px-2 py-0.5 flex-shrink-0"
                style={{ fontSize: '11px', color: '#cccccc', userSelect: 'none', background: '#252526' }}
            >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: '#858585', transform: 'rotate(90deg)' }}>
                    <polyline points="9 18 15 12 9 6" />
                </svg>
                <span style={{ fontWeight: 600, fontSize: '11px', letterSpacing: '0.8px', textTransform: 'uppercase' }}>project</span>
            </div>

            {/* New file input */}
            {showCreateInput && (
                <div className="flex gap-1 px-2 py-1 flex-shrink-0" style={{ borderBottom: '1px solid #3e3e42' }}>
                    <input
                        type="text"
                        value={newFileName}
                        onChange={(e) => setNewFileName(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleCreateFile();
                            if (e.key === 'Escape') { setShowCreateInput(false); setNewFileName(''); }
                        }}
                        placeholder="filename.ext"
                        className="vsc-input"
                        style={{ fontSize: '12px', padding: '3px 6px' }}
                        autoFocus
                    />
                    <button onClick={handleCreateFile} className="vsc-btn" style={{ fontSize: '12px', padding: '3px 8px' }}>✓</button>
                    <button
                        onClick={() => { setShowCreateInput(false); setNewFileName(''); }}
                        className="vsc-btn"
                        style={{ fontSize: '12px', padding: '3px 6px', color: '#858585' }}
                    >✕</button>
                </div>
            )}

            {/* File tree */}
            <div className="flex-1 overflow-y-auto py-1">
                {fileSystem.map((node) => renderNode(node))}
            </div>
        </div>
    );
}
