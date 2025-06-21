import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";
import "github-markdown-css/github-markdown.css";

// 自定义代码块渲染组件
const CodeBlock = ({ node, inline, className, children, ...props }: any) => {
  const match = /language-(\w+)/.exec(className || "");
  return !inline && match ? (
    <SyntaxHighlighter
      children={String(children).replace(/\n$/, "")}
      style={tomorrow}
      language={match[1]}
      PreTag="div"
      {...props}
    />
  ) : (
    <pre className="markdown-body">{String(children)}</pre>
  );
};

const MarkdownRenderer = ({ content }: any) => {
  return (
    <div className="markdown-container">
      <ReactMarkdown
        children={content}
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          code: CodeBlock,
          ul: ({ node, ...props }) => (
            <ul style={{ 
              paddingLeft: '24px',  // 增加列表整体缩进
              listStylePosition: 'outside', // 确保圆点与文字对齐
              marginLeft: '18px' 
            }} {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol style={{ 
              paddingLeft: '24px',  // 有序列表同样增加缩进
              marginLeft: '18px' 
            }} {...props} />
          )
        }}
      />
    </div>
  );
};

export default MarkdownRenderer;
