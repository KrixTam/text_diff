
import React, { useState, useCallback, useRef } from 'react';
import { FileText, ArrowRightLeft, Sparkles, LayoutPanelLeft, List, Trash2, Info, Plus, Download, Loader2 } from 'lucide-react';
import { diffLines, Change } from 'diff';
import { toPng } from 'html-to-image';
import { ViewMode, DiffPart } from './types';
import FileUploader from './components/FileUploader';
import DiffDisplay from './components/DiffDisplay';
import AISummary from './components/AISummary';
import { summarizeDifferences, getModelName } from './services/ai';

const App: React.FC = () => {
  const [file1, setFile1] = useState<{ name: string; content: string } | null>(null);
  const [file2, setFile2] = useState<{ name: string; content: string } | null>(null);
  const [diffs, setDiffs] = useState<Change[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.SPLIT);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [aiModel, setAiModel] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  
  const resultsRef = useRef<HTMLDivElement>(null);

  const compareFiles = useCallback(() => {
    if (file1 && file2) {
      const result = diffLines(file1.content, file2.content);
      setDiffs(result);
      setAiSummary(null);
      setAiModel(null);
    }
  }, [file1, file2]);

  const handleSummarize = async () => {
    if (!file1 || !file2) return;
    setIsSummarizing(true);
    setAiModel(getModelName());
    const summary = await summarizeDifferences(file1.content, file2.content);
    setAiSummary(summary);
    setIsSummarizing(false);
  };

  const handleDownloadImage = async () => {
    if (!resultsRef.current) return;
    
    setIsDownloading(true);
    try {
      const dataUrl = await toPng(resultsRef.current, {
        backgroundColor: '#f9fafb',
        style: {
          padding: '24px',
          borderRadius: '16px',
        },
        cacheBust: true,
        pixelRatio: 2,
      });
      
      const link = document.createElement('a');
      link.download = `text-diff-${new Date().getTime()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('导出图片失败:', err);
      if (err instanceof Error && err.message.includes('cssRules')) {
        alert('由于浏览器安全限制（CORS），导出图片失败。这通常与外部字体加载有关。请尝试重新刷新页面或稍后再试。');
      } else {
        alert('导出图片失败，请重试');
      }
    } finally {
      setIsDownloading(false);
    }
  };

  const reset = () => {
    setFile1(null);
    setFile2(null);
    setDiffs([]);
    setAiSummary(null);
    setAiModel(null);
  };

  const isCompareDisabled = !file1 || !file2;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-primary-400 p-2 rounded-lg">
            <FileText className="text-white w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">
            文本 <span className="text-primary-600">对比大师</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          {diffs.length > 0 && (
            <div className="flex bg-gray-100 p-1 rounded-lg">
              <button 
                onClick={() => setViewMode(ViewMode.SPLIT)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === ViewMode.SPLIT ? 'bg-white shadow-sm text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <LayoutPanelLeft size={16} /> 分栏视图
              </button>
              <button 
                onClick={() => setViewMode(ViewMode.UNIFIED)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === ViewMode.UNIFIED ? 'bg-white shadow-sm text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <List size={16} /> 混合视图
              </button>
            </div>
          )}

          {file1 || file2 ? (
            <button 
              onClick={reset}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
              title="清空当前文件内容"
            >
              <Trash2 size={18} />
              <span>重置</span>
            </button>
          ) : null}
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 space-y-8">
        {!diffs.length ? (
          <div className="grid md:grid-cols-2 gap-8 py-12">
            <FileUploader 
              label="原始文件 (基础)" 
              onFileLoaded={(name, content) => setFile1({ name, content })}
              file={file1}
              color="primary"
            />
            <FileUploader 
              label="新文件 (修改后)" 
              onFileLoaded={(name, content) => setFile2({ name, content })}
              file={file2}
              color="secondary"
            />
            
            <div className="md:col-span-2 flex flex-col items-center justify-center gap-4 mt-4">
              <button
                disabled={isCompareDisabled}
                onClick={compareFiles}
                className={`
                  flex items-center gap-3 px-10 py-4 rounded-xl text-lg font-bold transition-all shadow-lg
                  ${isCompareDisabled 
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                    : 'bg-primary-500 text-white hover:bg-primary-600 active:scale-95 shadow-primary-200/50'
                  }
                `}
              >
                <ArrowRightLeft size={24} />
                开始对比
              </button>
              {!file1 || !file2 ? (
                <p className="text-gray-500 text-sm flex items-center gap-2">
                  <Info size={14} /> 请上传两个文本文档以开始
                </p>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
               <div>
                 <h2 className="text-2xl font-bold text-gray-900">对比结果</h2>
                 <p className="text-gray-500 text-sm mt-1">
                   对比: <span className="font-semibold text-primary-600">{file1?.name}</span> 
                   <ArrowRightLeft size={12} className="inline mx-2 text-gray-300" /> 
                   <span className="font-semibold text-primary-700">{file2?.name}</span>
                 </p>
               </div>
               
               <div className="flex flex-wrap items-center gap-3">
                 {/* <button
                  disabled={isSummarizing}
                  onClick={handleSummarize}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-50 text-primary-700 hover:bg-primary-100 font-semibold transition-all border border-primary-200 disabled:opacity-50"
                 >
                   <Sparkles size={18} className={isSummarizing ? "animate-pulse" : ""} />
                   {isSummarizing ? "AI 正在分析..." : "AI 智能总结"}
                 </button> */}

                 <button
                  disabled={isDownloading}
                  onClick={handleDownloadImage}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 font-semibold transition-all border border-gray-200 disabled:opacity-50"
                 >
                   {isDownloading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                   {isDownloading ? "正在导出..." : "下载图片"}
                 </button>

                 <button
                  onClick={reset}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 font-semibold transition-all shadow-md shadow-primary-200/50 active:scale-95"
                 >
                   <Plus size={18} />
                   新的比较
                 </button>
               </div>
            </div>

            <div ref={resultsRef} className="space-y-6 bg-transparent">
              {aiSummary && <AISummary summary={aiSummary} model={aiModel ?? getModelName()} />}

              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                <DiffDisplay 
                  diffs={diffs} 
                  viewMode={viewMode}
                  file1Name={file1?.name || "原始文件"}
                  file2Name={file2?.name || "修改后文件"}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 py-6 text-center text-gray-400 text-xs font-medium">
        <p>© 2026 文本对比大师 • 由通用 AI SDK 提供技术支持</p>
      </footer>
    </div>
  );
};

export default App;
