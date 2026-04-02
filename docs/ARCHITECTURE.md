# 文本对比大师：架构设计说明

本文档详细描述了“文本对比大师”的技术架构、核心逻辑实现以及数据交互流程。

## 1. 总体架构

本项目采用单页应用 (SPA) 架构，完全基于 React 19 构建，利用模块化组件提升代码复用性与维护性。

### 核心技术选型理由：
- jsdiff：行业标准的文本差异计算库，提供稳定的行/词级别对比，天然支持任何以换行符分隔的文本内容
- OpenAI SDK：通过通用 SDK 或兼容 OpenAI 的网关，进行语义分析与差异总结，模型、Key 与 Base URL 均来自环境变量
- html-to-image：通过 SVG 转换技术将 DOM 节点还原为图片

## 2. 目录结构与职责

- `/App.tsx`：根组件。管理全局状态（文件内容、对比结果、视图模式、AI 总结状态），并协调下载任务
- `/services/ai.ts`：AI 服务封装。负责构造通用文本对比的提示词并与 OpenAI SDK 通信
- `/components/`：
    - `FileUploader.tsx`：封装 HTML5 File API，负责文件的读取，已扩展支持多种文本后缀名
    - `DiffDisplay.tsx`：核心渲染组件。渲染 `jsdiff` 计算的 Change 对象
    - `AISummary.tsx`：总结展示组件。解析 AI 返回文本并应用样式
- `/types.ts`：统一维护 TypeScript 接口

## 3. 核心流程实现

### 3.1 差异比对逻辑
应用调用 `diffLines(content1, content2)`。该方法不依赖文件格式，只要是文本字符串即可进行行级比对。

此外，应用支持 **行内差异高亮 (Intra-line highlighting)**：
- 在 `DiffDisplay.tsx` 中使用 `diffWordsWithSpace` 对比配对的删除和新增行。
- 通过 `WordHighlightedLine` 组件将具体的单词级差异以显著的背景色标出，提升对比的精细度。

### 3.2 文件支持范围
通过在 `input[type="file"]` 的 `accept` 属性中定义常用文本和代码后缀，引导用户上传正确的文件，同时在底层通过 `FileReader.readAsText` 统一作为 UTF-8 文本处理。

### 3.3 AI 总结数据流 (可选功能)
虽然前端触发入口（按钮）目前在 `App.tsx` 中可能被隐藏，但逻辑已就绪：
- 在 `/services/ai.ts` 中基于 OpenAI SDK 的 `chat.completions.create`：
- 从环境变量读取 `OPENAI_API_KEY`、`OPENAI_BASE_URL`、`OPENAI_MODEL`
- 注入 `system` 指令确保总结风格清晰、简洁，中文输出
- 将两份文本的前 5000 字符传入 `user` 内容进行分析
- 通过 `temperature: 0.2` 控制输出稳定性与一致性
- `AISummary.tsx` 支持 Markdown 渲染（分割线、表格等），并显示当前使用的模型名称。

---
