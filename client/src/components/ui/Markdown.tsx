import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

interface MarkdownProps {
  /** Markdown (GitHub-flavored) string. Raw HTML is also supported for legacy posts. */
  source: string;
  className?: string;
}

/**
 * Renders GitHub-flavored Markdown with the site's editorial typography
 * (`.pwi-prose`, defined in index.css). `rehype-raw` is enabled so older posts
 * authored as raw HTML continue to render correctly alongside Markdown.
 *
 * Content is authored by trusted admins, so raw HTML is intentionally allowed.
 */
export default function Markdown({ source, className }: MarkdownProps) {
  return (
    <div className={`pwi-prose ${className ?? ''}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
        {source || ''}
      </ReactMarkdown>
    </div>
  );
}
