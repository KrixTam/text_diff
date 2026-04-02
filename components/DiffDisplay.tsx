
import React, { useMemo } from 'react';
import { Change, diffWordsWithSpace } from 'diff';
import { ViewMode } from '../types';

interface DiffDisplayProps {
  diffs: Change[];
  viewMode: ViewMode;
  file1Name: string;
  file2Name: string;
}

/**
 * 渲染带有单词级高亮的行
 */
const WordHighlightedLine: React.FC<{ 
  line: string; 
  otherLine?: string; 
  type: 'added' | 'removed' | 'unchanged' 
}> = ({ line, otherLine, type }) => {
  if (type === 'unchanged' || !otherLine) {
    return <>{line || ' '}</>;
  }

  // 计算单词级差异
  // diffWordsWithSpace(oldStr, newStr)
  const diff = useMemo(() => {
    return diffWordsWithSpace(
      type === 'added' ? otherLine : line, 
      type === 'added' ? line : otherLine
    );
  }, [line, otherLine, type]);

  return (
    <>
      {diff.map((part, i) => {
        if (type === 'added') {
          if (part.added) {
            return (
              <span key={i} className="bg-emerald-200/80 rounded px-0.5 font-bold">
                {part.value}
              </span>
            );
          }
          if (part.removed) return null;
          return <span key={i}>{part.value}</span>;
        } else {
          if (part.removed) {
            return (
              <span key={i} className="bg-red-200/80 rounded px-0.5 font-bold">
                {part.value}
              </span>
            );
          }
          if (part.added) return null;
          return <span key={i}>{part.value}</span>;
        }
      })}
    </>
  );
};

const DiffDisplay: React.FC<DiffDisplayProps> = ({ diffs, viewMode, file1Name, file2Name }) => {
  // 1. 预处理差异，尝试配对删除和新增的行以实现行内对比 (用于混合视图)
  const processedDiffs = useMemo(() => {
    const result: Array<{
      type: 'added' | 'removed' | 'unchanged';
      value: string;
      otherValue?: string; // 配对的行内容
    }> = [];

    for (let i = 0; i < diffs.length; i++) {
      const current = diffs[i];
      const next = diffs[i + 1];

      if (current.removed && next && next.added) {
        // 发现配对的删除和新增
        const removedLines = current.value.split('\n');
        if (removedLines[removedLines.length - 1] === '') removedLines.pop();
        
        const addedLines = next.value.split('\n');
        if (addedLines[addedLines.length - 1] === '') addedLines.pop();

        const commonCount = Math.min(removedLines.length, addedLines.length);

        // 配对部分
        for (let j = 0; j < commonCount; j++) {
          result.push({ type: 'removed', value: removedLines[j], otherValue: addedLines[j] });
        }
        for (let j = 0; j < commonCount; j++) {
          result.push({ type: 'added', value: addedLines[j], otherValue: removedLines[j] });
        }

        // 剩余部分
        if (removedLines.length > addedLines.length) {
          for (let j = commonCount; j < removedLines.length; j++) {
            result.push({ type: 'removed', value: removedLines[j] });
          }
        } else if (addedLines.length > removedLines.length) {
          for (let j = commonCount; j < addedLines.length; j++) {
            result.push({ type: 'added', value: addedLines[j] });
          }
        }

        i++; // 跳过 next
      } else {
        const lines = current.value.split('\n');
        if (lines[lines.length - 1] === '') lines.pop();
        
        lines.forEach(line => {
          result.push({
            type: current.added ? 'added' : current.removed ? 'removed' : 'unchanged',
            value: line
          });
        });
      }
    }
    return result;
  }, [diffs]);

  // 2. 分栏视图逻辑 (必须在条件返回之前调用，以遵循 React Hook 规则)
  const { left: alignedLeft, right: alignedRight } = useMemo(() => {
    const left: React.ReactNode[] = [];
    const right: React.ReactNode[] = [];

    for (let i = 0; i < diffs.length; i++) {
      const current = diffs[i];
      const next = diffs[i + 1];

      if (current.removed && next && next.added) {
        const removedLines = current.value.split('\n');
        if (removedLines[removedLines.length - 1] === '') removedLines.pop();
        const addedLines = next.value.split('\n');
        if (addedLines[addedLines.length - 1] === '') addedLines.pop();

        const commonCount = Math.min(removedLines.length, addedLines.length);
        
        for (let j = 0; j < commonCount; j++) {
          left.push(
            <div key={`left-${i}-${j}`} className="bg-red-50 text-red-900 px-4 py-0.5 border-b border-red-100/50 whitespace-pre-wrap break-all min-h-[1.5rem]">
              <WordHighlightedLine line={removedLines[j]} otherLine={addedLines[j]} type="removed" />
            </div>
          );
          right.push(
            <div key={`right-${i}-${j}`} className="bg-emerald-50 text-emerald-900 px-4 py-0.5 border-b border-emerald-100/50 whitespace-pre-wrap break-all min-h-[1.5rem]">
              <WordHighlightedLine line={addedLines[j]} otherLine={removedLines[j]} type="added" />
            </div>
          );
        }

        if (removedLines.length > addedLines.length) {
          for (let j = commonCount; j < removedLines.length; j++) {
            left.push(
              <div key={`left-rem-${i}-${j}`} className="bg-red-50 text-red-900 px-4 py-0.5 border-b border-red-100/50 whitespace-pre-wrap break-all min-h-[1.5rem]">
                {removedLines[j]}
              </div>
            );
            right.push(<div key={`right-pad-${i}-${j}`} className="bg-gray-50/30 px-4 py-0.5 border-b border-gray-100 min-h-[1.5rem]" />);
          }
        } else if (addedLines.length > removedLines.length) {
          for (let j = commonCount; j < addedLines.length; j++) {
            left.push(<div key={`left-pad-${i}-${j}`} className="bg-gray-50/30 px-4 py-0.5 border-b border-gray-100 min-h-[1.5rem]" />);
            right.push(
              <div key={`right-add-${i}-${j}`} className="bg-emerald-50 text-emerald-900 px-4 py-0.5 border-b border-emerald-100/50 whitespace-pre-wrap break-all min-h-[1.5rem]">
                {addedLines[j]}
              </div>
            );
          }
        }
        i++;
      } else {
        const lines = current.value.split('\n');
        if (lines[lines.length - 1] === '') lines.pop();

        lines.forEach((line, j) => {
          if (current.added) {
            left.push(<div key={`left-pad-${i}-${j}`} className="bg-gray-50/30 px-4 py-0.5 border-b border-gray-100 min-h-[1.5rem]" />);
            right.push(
              <div key={`right-add-${i}-${j}`} className="bg-emerald-50 text-emerald-900 px-4 py-0.5 border-b border-emerald-100/50 whitespace-pre-wrap break-all min-h-[1.5rem]">
                {line}
              </div>
            );
          } else if (current.removed) {
            left.push(
              <div key={`left-rem-${i}-${j}`} className="bg-red-50 text-red-900 px-4 py-0.5 border-b border-red-100/50 whitespace-pre-wrap break-all min-h-[1.5rem]">
                {line}
              </div>
            );
            right.push(<div key={`right-pad-${i}-${j}`} className="bg-gray-50/30 px-4 py-0.5 border-b border-gray-100 min-h-[1.5rem]" />);
          } else {
            const lineEl = (
              <div key={`unchanged-${i}-${j}`} className="text-gray-700 px-4 py-0.5 border-b border-gray-100 whitespace-pre-wrap break-all min-h-[1.5rem]">
                {line || ' '}
              </div>
            );
            left.push(lineEl);
            right.push(lineEl);
          }
        });
      }
    }
    return { left, right };
  }, [diffs]);

  // 3. 渲染逻辑
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
            {processedDiffs.map((item, i) => (
              <tr 
                key={i} 
                className={`
                  border-b border-gray-50 last:border-0
                  ${item.type === 'added' ? 'bg-emerald-50 text-emerald-900' : ''}
                  ${item.type === 'removed' ? 'bg-red-50 text-red-900' : ''}
                  ${item.type === 'unchanged' ? 'text-gray-700' : ''}
                `}
              >
                <td className={`w-12 py-1 px-3 text-right font-mono select-none border-r border-gray-100 ${item.type === 'added' ? 'text-emerald-400' : item.type === 'removed' ? 'text-red-400' : 'text-gray-300'}`}>
                  {item.type === 'added' ? '+' : item.type === 'removed' ? '-' : ''}
                </td>
                <td className="py-1 px-4 whitespace-pre-wrap break-all">
                  <WordHighlightedLine line={item.value} otherLine={item.otherValue} type={item.type} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 divide-x divide-gray-200 mono text-sm leading-relaxed">
      <div className="flex flex-col">
        <div className="sticky top-0 bg-gray-50 border-b border-gray-200 px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider flex justify-between">
          <span className="truncate pr-2">{file1Name}</span>
          <span className="text-red-500 shrink-0">原始版本</span>
        </div>
        <div className="flex-1 overflow-x-auto">
          {alignedLeft}
        </div>
      </div>
      <div className="flex flex-col">
        <div className="sticky top-0 bg-gray-50 border-b border-gray-200 px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider flex justify-between">
          <span className="truncate pr-2">{file2Name}</span>
          <span className="text-emerald-600 shrink-0">修改版本</span>
        </div>
        <div className="flex-1 overflow-x-auto">
          {alignedRight}
        </div>
      </div>
    </div>
  );
};


export default DiffDisplay;
