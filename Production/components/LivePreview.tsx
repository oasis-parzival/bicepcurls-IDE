'use client';

import { useState, useEffect } from 'react';

interface LivePreviewProps {
    htmlContent: string;
}

export default function LivePreview({ htmlContent }: LivePreviewProps) {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [previewDoc, setPreviewDoc] = useState('');

    useEffect(() => {
        // Ensure we have valid HTML content
        if (htmlContent && htmlContent.trim()) {
            setPreviewDoc(htmlContent);
        } else {
            setPreviewDoc(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body {
                font-family: 'Fira Code', monospace;
                background: #0a0a0a;
                color: #00ff41;
                padding: 20px;
                text-align: center;
              }
            </style>
          </head>
          <body>
            <h1>No Preview Available</h1>
            <p>Open an HTML file to see the preview</p>
          </body>
        </html>
      `);
        }
    }, [htmlContent]);

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    return (
        <>
            {/* Normal Preview */}
            {!isFullscreen && (
                <div className="h-full flex flex-col bg-cyber-black border-l border-cyber-gray">
                    {/* Header */}
                    <div className="p-3 border-b border-cyber-gray flex items-center justify-between">
                        <h2 className="text-cyber-green font-bold terminal-glow text-sm">LIVE PREVIEW</h2>
                        <button
                            onClick={toggleFullscreen}
                            className="text-xs cyber-button py-1 px-2"
                        >
                            FULLSCREEN
                        </button>
                    </div>

                    {/* Preview Frame */}
                    <div className="flex-1 bg-white">
                        <iframe
                            srcDoc={previewDoc}
                            className="w-full h-full border-none"
                            sandbox="allow-scripts"
                            title="Live Preview"
                        />
                    </div>
                </div>
            )}

            {/* Fullscreen Immersive Mode */}
            {isFullscreen && (
                <div className="fixed inset-0 z-50 bg-cyber-black">
                    {/* Floating Exit Button */}
                    <button
                        onClick={toggleFullscreen}
                        className="fixed top-4 right-4 z-50 cyber-button shadow-lg"
                    >
                        ✕ EXIT FULLSCREEN
                    </button>

                    {/* Preview Frame */}
                    <iframe
                        srcDoc={previewDoc}
                        className="w-full h-full border-none bg-white"
                        sandbox="allow-scripts allow-same-origin"
                        title="Live Preview Fullscreen"
                    />
                </div>
            )}
        </>
    );
}
