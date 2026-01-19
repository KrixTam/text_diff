
import React, { useRef } from 'react';
import { Upload, FileCheck, X } from 'lucide-react';

interface FileUploaderProps {
  label: string;
  onFileLoaded: (name: string, content: string) => void;
  file: { name: string; content: string } | null;
  color: 'primary' | 'secondary';
}

const FileUploader: React.FC<FileUploaderProps> = ({ label, onFileLoaded, file, color }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        onFileLoaded(selectedFile.name, content);
      };
      reader.readAsText(selectedFile);
    }
  };

  const colorClasses = {
    primary: {
      border: 'border-primary-200',
      bg: 'bg-primary-50',
      text: 'text-primary-600',
      hover: 'hover:border-primary-400',
      iconBg: 'bg-primary-100',
    },
    secondary: {
      border: 'border-primary-300',
      bg: 'bg-primary-50/50',
      text: 'text-primary-700',
      hover: 'hover:border-primary-500',
      iconBg: 'bg-primary-200',
    }
  };

  const style = colorClasses[color];

  return (
    <div className="space-y-3">
      <label className="text-sm font-bold text-gray-500 uppercase tracking-widest pl-1">{label}</label>
      <div 
        onClick={() => inputRef.current?.click()}
        className={`
          relative h-48 flex flex-col items-center justify-center border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300
          ${file ? `${style.bg} ${style.border}` : `border-gray-200 hover:bg-white hover:border-primary-300 group shadow-sm hover:shadow-md`}
        `}
      >
        <input 
          type="file" 
          ref={inputRef}
          onChange={handleFileChange}
          accept=".md,.markdown,.txt,.js,.ts,.json,.css,.html,.py,.c,.cpp,.h,.rs,.go,.java,.sh,.yaml,.yml"
          className="hidden" 
        />
        
        {file ? (
          <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
            <div className={`p-4 rounded-full ${style.iconBg} ${style.text} mb-3 shadow-inner`}>
              <FileCheck size={32} />
            </div>
            <p className="font-bold text-gray-800 text-center px-6 overflow-hidden text-ellipsis whitespace-nowrap max-w-full">
              {file.name}
            </p>
            <p className={`text-[10px] font-bold mt-2 uppercase tracking-tighter px-2 py-0.5 rounded ${style.iconBg} ${style.text}`}>
              File Ready
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center text-gray-400 text-center px-4 group-hover:text-primary-400 transition-colors">
            <div className="p-4 rounded-full bg-gray-50 group-hover:bg-primary-50 transition-colors mb-3">
              <Upload size={36} className="opacity-60" />
            </div>
            <p className="font-semibold">点击或拖拽上传文件</p>
            <p className="text-xs mt-1 opacity-70">支持多种文本及代码格式</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUploader;
