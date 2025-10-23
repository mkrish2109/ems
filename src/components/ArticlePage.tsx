// components/ArticlePage.tsx
import React from 'react';
import { Article } from '../types/content';
import SmartAdBanner from './SmartAdBanner';

interface ArticlePageProps {
  content: Article;
}

export default function ArticlePage({ content }: ArticlePageProps): React.JSX.Element {
  const adClientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || '';

  return (
    <article className="article-container">
      <header>
        <h1>{content.title}</h1>
      </header>
      
      {/* In-content ad after first paragraph */}
      <div dangerouslySetInnerHTML={{ __html: content.firstParagraph }} />
      
      <SmartAdBanner
        adUnit={adClientId}
        adSlot="1234567890"
        format="fluid"
        layout="in-article"
        className="my-4"
        lazyLoad={true}
        fallback={
          <div className="ad-fallback">
            <p>Advertisement</p>
          </div>
        }
      />
      
      <div dangerouslySetInnerHTML={{ __html: content.restOfContent }} />
      
      {/* Sidebar ad */}
      <aside>
        <SmartAdBanner
          adUnit={adClientId}
          adSlot="0987654321"
          format="rectangle"
          className="sticky top-4"
        />
      </aside>
    </article>
  );
}