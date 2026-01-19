
import React from 'react';
import { Change } from 'diff';
import { ViewMode } from '../types';

interface DiffDisplayProps {
  diffs: Change[];
  viewMode: ViewMode;
  file1Name: string;
  file2Name: string;
}

const DiffDisplay: React.FC<DiffDisplayProps> = ({ diffs, viewMode, file1Name, file2Name }) => {
  if (viewMode === ViewMode.UNIFIED) {
    return (
      <div className="mono text-sm leading-relaxed overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="w-12 py-2 px-3 text-right text-gray-400 font-normal border-r border-gray-200">#</th>
              <th className="py-2 px-4 text-left text-gray-500 font-semibold">变更内容</th>
            </tr>
          </thead>
          <tbody>
            {diffs.map((change, i) => {
              const lines = change.value.split('\n');
              if (lines[lines.length - 1] === '') lines.pop();

              return lines.map((line, j) => (
                <tr 
                  key={`${i}-${j}`} 
                  className={`
                    border-b border-gray-50 last:border-0
                    ${change.added ? 'bg-emerald-50 text-emerald-900' : ''}
                    ${change.removed ? 'bg-red-50 text-red-900' : ''}
                    ${!change.added && !change.removed ? 'text-gray-700' : ''}
                  `}
                >
                  <td className={`w-12 py-1 px-3 text-right font-mono select-none border-r border-gray-100 ${change.added ? 'text-emerald-400' : change.removed ? 'text-red-400' : 'text-gray-300'}`}>
                    {change.added ? '+' : change.removed ? '-' : ''}
                  </td>
                  <td className="py-1 px-4 whitespace-pre-wrap break-all">
                    {line || ' '}
                  </td>
                </tr>
              ));
            })}
          </tbody>
        </table>
      </div>
    );
  }

  const leftContent: React.ReactNode[] = [];
  const rightContent: React.ReactNode[] = [];

  diffs.forEach((change, i) => {
    const lines = change.value.split('\n');
    if (lines[lines.length - 1] === '') lines.pop();

    if (change.added) {
      lines.forEach((line, j) => {
        rightContent.push(
          <div key={`added-${i}-${j}`} className="bg-emerald-50 text-emerald-900 px-4 py-0.5 border-b border-emerald-100/50 whitespace-pre-wrap break-all min-h-[1.5rem]">
            {line || ' '}
          </div>
        );
      });
    } else if (change.removed) {
      lines.forEach((line, j) => {
        leftContent.push(
          <div key={`removed-${i}-${j}`} className="bg-red-50 text-red-900 px-4 py-0.5 border-b border-red-100/50 whitespace-pre-wrap break-all min-h-[1.5rem]">
            {line || ' '}
          </div>
        );
      });
    } else {
      const maxLength = Math.max(leftContent.length, rightContent.length);
      while (leftContent.length < maxLength) leftContent.push(<div key={`pad-left-${leftContent.length}`} className="bg-gray-50/30 px-4 py-0.5 border-b border-gray-100 min-h-[1.5rem]" />);
      while (rightContent.length < maxLength) rightContent.push(<div key={`pad-right-${rightContent.length}`} className="bg-gray-50/30 px-4 py-0.5 border-b border-gray-100 min-h-[1.5rem]" />);

      lines.forEach((line, j) => {
        const lineEl = (
          <div key={`unchanged-${i}-${j}`} className="text-gray-700 px-4 py-0.5 border-b border-gray-100 whitespace-pre-wrap break-all min-h-[1.5rem]">
            {line || ' '}
          </div>
        );
        leftContent.push(lineEl);
        rightContent.push(lineEl);
      });
    }
  });

  return (
    <div className="grid grid-cols-2 divide-x divide-gray-200 mono text-sm leading-relaxed">
      <div className="flex flex-col">
        <div className="sticky top-0 bg-gray-50 border-b border-gray-200 px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider flex justify-between">
          <span className="truncate pr-2">{file1Name}</span>
          <span className="text-red-500 shrink-0">原始版本</span>
        </div>
        <div className="flex-1 overflow-x-auto">
          {leftContent}
        </div>
      </div>
      <div className="flex flex-col">
        <div className="sticky top-0 bg-gray-50 border-b border-gray-200 px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider flex justify-between">
          <span className="truncate pr-2">{file2Name}</span>
          <span className="text-emerald-600 shrink-0">修改版本</span>
        </div>
        <div className="flex-1 overflow-x-auto">
          {rightContent}
        </div>
      </div>
    </div>
  );
};

export default DiffDisplay;
