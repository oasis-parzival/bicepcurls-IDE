// File System Types
export interface FileNode {
    id: string;
    name: string;
    type: 'file' | 'folder';
    path: string;
    content?: string;
    children?: FileNode[];
    language?: string;
}

// Agent Types
export interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: number;
}

export interface AgentContext {
    currentFile: string | null;
    openFiles: string[];
    fileTree: FileNode[];
    workingDirectory: string;
}

export interface AgentResponse {
    content: string;
    commands?: string[];
}

// Terminal Types
export interface TerminalOutput {
    id: string;
    type: 'input' | 'output' | 'error';
    content: string;
    timestamp: number;
}

// Editor Types
export interface EditorTab {
    id: string;
    path: string;
    name: string;
    content: string;
    language: string;
    isDirty: boolean;
}
