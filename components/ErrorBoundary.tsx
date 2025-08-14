"use client";

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('错误边界捕获到错误:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="bg-gray-900 p-8 rounded-lg max-w-md">
            <h1 className="text-red-400 text-xl font-bold mb-4">页面出现错误</h1>
            <p className="text-gray-300 mb-4">
              抱歉，页面加载时出现了错误。请刷新页面重试。
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
            >
              刷新页面
            </button>
            {this.state.error && (
              <details className="mt-4">
                <summary className="text-gray-400 cursor-pointer">错误详情</summary>
                <pre className="text-xs text-red-400 mt-2 bg-gray-800 p-2 rounded overflow-auto">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 