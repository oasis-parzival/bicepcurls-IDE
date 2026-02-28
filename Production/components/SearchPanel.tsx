'use client';

import { useState } from 'react';
import { FileNode } from '@/types';

interface SearchResult {
    filePath: string;
    fileName: string;
    lineNumber: number;
    lineContent: string;
    matchStart: number;
}

interface SearchPanelProps {
    fileSystemManager: any;
    onFileSelect: (path: string) => void;
}

// Recursively collect all file nodes from the tree
function getAllFiles(nodes: FileNode[]): FileNode[] {
    const files: FileNode[] = [];
    for (const node of nodes) {
        if (node.type === 'file') {
            files.push(node);
        } else if (node.children) {
            files.push(...getAllFiles(node.children));
        }
    }
    return files;
}

// Highlight matched text inside a line
function HighlightedLine({ line, matchStart, queryLen }: { line: string; matchStart: number; queryLen: number }) {
    const before = line.slice(0, matchStart);
    const match = line.slice(matchStart, matchStart + queryLen);
    const after = line.slice(matchStart + queryLen);

    // Trim long lines so the highlighted part stays visible
    const maxBefore = 30;
    const trimmedBefore = before.length > maxBefore ? '…' + before.slice(-maxBefore) : before;

    return (
        <span style={{ fontFamily: '"JetBrains Mono", Consolas, monospace', fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            <span style={{ color: '#858585' }}>{trimmedBefore}</span>
            <mark style={{ background: '#ffa50033', color: '#ffd080', borderRadius: '2px', padding: '0 1px' }}>
                {match}
            </mark>
            <span style={{ color: '#858585' }}>{after.slice(0, 60)}</span>
        </span>
    );
}

export default function SearchPanel({ fileSystemManager, onFileSelect }: SearchPanelProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [hasSearched, setHasSearched] = useState(false);
    const [matchCase, setMatchCase] = useState(false);
    const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set());

    const runSearch = (q: string, caseSensitive: boolean) => {
        if (!q.trim()) {
            setResults([]);
            setHasSearched(false);
            return;
        }

        const fs = fileSystemManager.getFileSystem();
        const allFiles = getAllFiles(fs);
        const matches: SearchResult[] = [];
        const searchQ = caseSensitive ? q : q.toLowerCase();

        for (const file of allFiles) {
            const content = fileSystemManager.readFile(file.path);
            if (!content) continue;
            const lines = content.split('\n');
            for (let i = 0; i < lines.length; i++) {
                const rawLine = lines[i];
                const testLine = caseSensitive ? rawLine : rawLine.toLowerCase();
                const idx = testLine.indexOf(searchQ);
                if (idx !== -1) {
                    matches.push({
                        filePath: file.path,
                        fileName: file.name,
                        lineNumber: i + 1,
                        lineContent: rawLine,
                        matchStart: idx,
                    });
                }
                if (matches.length >= 500) break;
            }
            if (matches.length >= 500) break;
        }

        setResults(matches);
        setHasSearched(true);
        // Auto-expand all files that have matches
        const paths = new Set(matches.map(m => m.filePath));
        setExpandedFiles(paths);
    };

    const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const q = e.target.value;
        setQuery(q);
        runSearch(q, matchCase);
    };

    const toggleCase = () => {
        const next = !matchCase;
        setMatchCase(next);
        runSearch(query, next);
    };

    const toggleFile = (filePath: string) => {
        setExpandedFiles(prev => {
            const next = new Set(prev);
            if (next.has(filePath)) { next.delete(filePath); } else { next.add(filePath); }
            return next;
        });
    };

    // Group results by file path
    const grouped = results.reduce<Record<string, { fileName: string; matches: SearchResult[] }>>((acc, r) => {
        if (!acc[r.filePath]) acc[r.filePath] = { fileName: r.fileName, matches: [] };
        acc[r.filePath].matches.push(r);
        return acc;
    }, {});

    const totalFiles = Object.keys(grouped).length;
    const totalMatches = results.length;

    return (
        <div className="h-full flex flex-col" style={{ background: '#252526' }}>

            {/* ── Header ───────────────────────────────────────────────── */}
            <div className="sidebar-section-title">Search</div>

            {/* ── Search Input ─────────────────────────────────────────── */}
            <div className="px-3 pb-2 flex-shrink-0" style={{ borderBottom: '1px solid #3e3e42' }}>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input
                        type="text"
                        value={query}
                        onChange={handleQueryChange}
                        placeholder="Search in files..."
                        autoFocus
                        style={{
                            width: '100%',
                            background: '#3c3c3c',
                            border: '1px solid transparent',
                            borderColor: query ? '#007acc' : 'transparent',
                            padding: '5px 30px 5px 8px',
                            color: '#cccccc',
                            fontSize: '13px',
                            outline: 'none',
                            borderRadius: '2px',
                            fontFamily: 'Inter, sans-serif',
                        }}
                        onFocus={e => (e.currentTarget.style.borderColor = '#007acc')}
                        onBlur={e => (e.currentTarget.style.borderColor = query ? '#007acc' : 'transparent')}
                    />
                    {/* Match case toggle */}
                    <button
                        onClick={toggleCase}
                        title={matchCase ? 'Case sensitive (on)' : 'Case sensitive (off)'}
                        style={{
                            position: 'absolute', right: '4px',
                            background: matchCase ? '#094771' : 'transparent',
                            border: matchCase ? '1px solid #007acc' : '1px solid transparent',
                            borderRadius: '3px', padding: '1px 4px',
                            color: matchCase ? '#007acc' : '#858585',
                            fontSize: '11px', fontWeight: 700, cursor: 'pointer',
                            lineHeight: 1.4,
                        }}
                    >
                        Aa
                    </button>
                </div>

                {/* Stats */}
                {hasSearched && (
                    <div style={{ fontSize: '11px', color: '#858585', marginTop: '5px' }}>
                        {totalMatches === 0
                            ? `No results for "${query}"`
                            : `${totalMatches} result${totalMatches !== 1 ? 's' : ''} in ${totalFiles} file${totalFiles !== 1 ? 's' : ''}`}
                        {totalMatches >= 500 && <span style={{ color: '#ffa500' }}> (capped at 500)</span>}
                    </div>
                )}
                {!hasSearched && (
                    <div style={{ fontSize: '11px', color: '#585858', marginTop: '5px' }}>
                        Search across all open project files
                    </div>
                )}
            </div>

            {/* ── Results ──────────────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto">
                {Object.entries(grouped).map(([filePath, { fileName, matches }]) => {
                    const isExpanded = expandedFiles.has(filePath);
                    return (
                        <div key={filePath}>
                            {/* File row */}
                            <div
                                onClick={() => toggleFile(filePath)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '6px',
                                    padding: '4px 8px',
                                    background: '#2d2d2d',
                                    borderTop: '1px solid #3e3e42',
                                    cursor: 'pointer',
                                    userSelect: 'none',
                                }}
                            >
                                {/* Chevron */}
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#858585" strokeWidth="2.5"
                                    style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.12s', flexShrink: 0 }}>
                                    <polyline points="9 18 15 12 9 6" />
                                </svg>
                                {/* File icon */}
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#cccccc" strokeWidth="1.8" style={{ flexShrink: 0 }}>
                                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                                    <polyline points="14 2 14 8 20 8" />
                                </svg>
                                {/* File name */}
                                <span
                                    onClick={e => { e.stopPropagation(); onFileSelect(filePath); }}
                                    style={{ fontSize: '12px', color: '#cccccc', fontWeight: 500, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                                >
                                    {fileName}
                                </span>
                                {/* Match count badge */}
                                <span style={{
                                    fontSize: '10px', color: '#cccccc',
                                    background: '#094771', borderRadius: '8px',
                                    padding: '0 6px', minWidth: '18px', textAlign: 'center', flexShrink: 0,
                                }}>
                                    {matches.length}
                                </span>
                            </div>

                            {/* Match rows */}
                            {isExpanded && matches.map((result, i) => (
                                <div
                                    key={i}
                                    onClick={() => onFileSelect(result.filePath)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '8px',
                                        padding: '3px 8px 3px 24px',
                                        cursor: 'pointer',
                                        transition: 'background 0.05s',
                                    }}
                                    onMouseEnter={e => (e.currentTarget.style.background = '#2a2d2e')}
                                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                >
                                    {/* Line number */}
                                    <span style={{
                                        fontSize: '11px', color: '#858585',
                                        minWidth: '28px', textAlign: 'right',
                                        flexShrink: 0, fontFamily: '"JetBrains Mono", monospace',
                                    }}>
                                        {result.lineNumber}
                                    </span>
                                    {/* Highlighted content */}
                                    <div style={{ overflow: 'hidden', flex: 1 }}>
                                        <HighlightedLine
                                            line={result.lineContent.trim()}
                                            matchStart={result.lineContent.trim().toLowerCase().indexOf(query.toLowerCase())}
                                            queryLen={query.length}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    );
                })}

                {/* Empty prompt */}
                {!hasSearched && (
                    <div style={{ padding: '16px', color: '#585858', fontSize: '12px', textAlign: 'center', marginTop: '16px' }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3e3e42" strokeWidth="1.5" style={{ margin: '0 auto 8px', display: 'block' }}>
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        Enter a search term
                    </div>
                )}
            </div>
        </div>
    );
}
