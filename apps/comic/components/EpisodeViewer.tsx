'use client';

import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface EpisodeViewerProps {
  content: string;
  episodeTitle: string;
}

export default function EpisodeViewer({ content, episodeTitle }: EpisodeViewerProps) {
  const [headings, setHeadings] = useState<{ id: string; text: string; level: number }[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [showToc, setShowToc] = useState(false);

  useEffect(() => {
    // 見出しを抽出
    const extractHeadings = () => {
      const headingElements = document.querySelectorAll('.markdown-content h1, .markdown-content h2, .markdown-content h3');
      const headingData: { id: string; text: string; level: number }[] = [];

      headingElements.forEach((heading, index) => {
        const id = `heading-${index}`;
        heading.id = id;
        headingData.push({
          id,
          text: heading.textContent || '',
          level: parseInt(heading.tagName.substring(1)),
        });
      });

      setHeadings(headingData);
    };

    // DOM更新後に実行
    setTimeout(extractHeadings, 100);
  }, [content]);

  useEffect(() => {
    // Intersection Observer で現在表示中の見出しを追跡
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -80% 0px',
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveId(entry.target.id);
        }
      });
    }, observerOptions);

    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [headings]);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -100;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
      setShowToc(false);
    }
  };

  return (
    <div className="relative">
      {/* 目次トグルボタン（モバイル） */}
      {headings.length > 0 && (
        <button
          onClick={() => setShowToc(!showToc)}
          className="lg:hidden fixed bottom-6 right-6 bg-primary-600 text-white p-4 rounded-full shadow-lg hover:bg-primary-700 z-40"
          aria-label="目次を開く"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      )}

      {/* 目次サイドバー */}
      {headings.length > 0 && (
        <>
          {/* モバイル用オーバーレイ */}
          {showToc && (
            <div
              className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setShowToc(false)}
            />
          )}

          {/* 目次 */}
          <nav
            className={`
              fixed top-24 right-6 w-64 bg-white rounded-lg shadow-xl p-6 z-50
              lg:block
              ${showToc ? 'block' : 'hidden'}
              max-h-[70vh] overflow-y-auto
            `}
          >
            <h3 className="text-sm font-bold text-gray-900 mb-4">目次</h3>
            <ul className="space-y-2">
              {headings.map((heading) => (
                <li key={heading.id}>
                  <button
                    onClick={() => scrollToHeading(heading.id)}
                    className={`
                      block w-full text-left text-sm transition-colors
                      ${heading.level === 1 ? 'font-semibold' : ''}
                      ${heading.level === 2 ? 'pl-3' : ''}
                      ${heading.level === 3 ? 'pl-6' : ''}
                      ${
                        activeId === heading.id
                          ? 'text-primary-600 font-medium'
                          : 'text-gray-600 hover:text-primary-600'
                      }
                    `}
                  >
                    {heading.text}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </>
      )}

      {/* Markdownコンテンツ */}
      <article className="markdown-content prose prose-lg max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            img: ({ node, ...props }) => (
              <img
                {...props}
                className="w-full h-auto rounded-lg shadow-md"
                loading="lazy"
              />
            ),
            a: ({ node, ...props }) => (
              <a {...props} target="_blank" rel="noopener noreferrer" />
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </article>
    </div>
  );
}
