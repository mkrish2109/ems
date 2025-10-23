// components/ContentPage.tsx
"use client";

import { useState, useEffect } from "react";
import PageHeader from "@/components/ui/PageHeader";
import { useRouter } from "next/navigation";

interface ContentPageProps {
  title: string;
  type: string;
}

interface ApiResponse {
  content?: string;
  error?: string;
}

export default function ContentPage({ title, type }: ContentPageProps) {
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`/api/content?type=${type}`);
        const data: ApiResponse = await response.json();

        if (response.ok && data.content) {
          setContent(data.content);
        } else {
          setError(data.error || "Failed to load content");
        }
      } catch (err) {
        setError("Network error occurred. Please check your connection.");
        // console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [type]);

  // Function to clean and enhance HTML content
  const processHTMLContent = (html: string): string => {
    if (!html) return "";

    // Remove data-start and data-end attributes for cleaner HTML
    const cleanedHtml = html.replace(/\sdata-(start|end)="[^"]*"/g, "");

    return cleanedHtml;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-full max-w-[390px] max-h-[844px] min-h-[844px] bg-[#008dd2]/10 shadow-lg flex flex-col">
          <PageHeader title={title} />
          <div className="flex-1 flex justify-center items-center">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#008DD2] mb-2"></div>
              <div className="text-[#008DD2]">Loading content...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-full max-w-[390px] max-h-[844px] min-h-[844px] bg-[#008dd2]/10 shadow-lg flex flex-col">
          <PageHeader title={title} />
          <div className="flex-1 flex flex-col items-center justify-center px-6">
            <div className="text-red-500 text-center mb-4">
              <div className="text-lg font-semibold mb-2">Oops!</div>
              {error}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-[#008DD2] text-white rounded-lg font-medium hover:bg-[#007cba] transition-colors cursor-pointer"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className=" min-h-screen bg-white flex items-center justify-center">
      <div className="w-full max-w-[390px] max-h-[844px] min-h-[844px] bg-[#008dd2]/10 shadow-lg flex flex-col">
        <PageHeader title={title} className="text-[19px]" />

        <div className="flex-1 overflow-y-auto">
          <div
            className="
              p-6 bg-white m-4 rounded-lg shadow-sm
              text-[#052C4D] leading-relaxed text-sm
              [&_h1]:text-[#008DD2] [&_h1]:mt-3 [&_h1]:mb-3 [&_h1]:font-bold [&_h1]:text-xl [&_h1]:border-b-2 [&_h1]:border-[#008DD2] [&_h1]:pb-2 [&_h1]:text-center
              [&_h2]:text-[#008DD2] [&_h2]:mt-2 [&_h2]:mb-2 [&_h2]:font-semibold [&_h2]:text-lg [&_h2]:border-l-4 [&_h2]:border-[#008DD2] [&_h2]:pl-3
              [&_h3]:text-[#008DD2] [&_h3]:mt-2 [&_h3]:mb-2 [&_h3]:font-semibold [&_h3]:text-base
              [&_h4]:text-[#008DD2] [&_h4]:mt-2 [&_h4]:mb-2 [&_h4]:font-semibold
              [&_h5]:text-[#008DD2] [&_h5]:mt-2 [&_h5]:mb-2 [&_h5]:font-semibold
              [&_h6]:text-[#008DD2] [&_h6]:mt-2 [&_h6]:mb-2 [&_h6]:font-semibold
              [&_p]:mb-3 [&_p]:text-justify
              [&_ul]:ml-5 [&_ul]:mb-3 [&_ul]:list-disc
              [&_ol]:ml-5 [&_ol]:mb-3 [&_ol]:list-decimal
              [&_li]:mb-1 [&_li]:pl-1
              [&_ul_ul]:mt-1 [&_ol_ol]:mt-1 [&_ul_ol]:mt-1 [&_ol_ul]:mt-1
              [&_ul ul]:mb-1 [&_ol ol]:mb-1 [&_ul ol]:mb-1 [&_ol ul]:mb-1
              [&_strong]:font-semibold [&_strong]:text-[#052C4D]
              [&_em]:italic
              [&_a]:text-[#008DD2] [&_a]:underline [&_a]:font-medium [&_a:hover]:text-[#007cba]
              [&_.decorated-link]:text-[#008DD2] [&_.decorated-link]:underline [&_.decorated-link]:font-medium
              [&_.cursor-pointer]:cursor-pointer
              [&_br]:m-0
            "
            dangerouslySetInnerHTML={{ __html: processHTMLContent(content) }}
          />
        </div>
      </div>
    </div>
  );
}
