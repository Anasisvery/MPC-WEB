import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Megaphone, Calendar, ChevronRight } from "lucide-react";

export default function PublicAnnouncements() {
  const { announcements } = useApp();
  const [selectedNewsId, setSelectedNewsId] = useState<string | null>(null);

  const selectedNews = announcements.find(a => a.id === selectedNewsId);
  const publishedNews = announcements
    .filter(a => a.published)
    .sort((a, b) => new Date(b.published_date).getTime() - new Date(a.published_date).getTime());

  return (
    <div className="space-y-6 pb-16">
      
      {/* 1. SELECTION OR NEWS DETAILS SHEET */}
      {selectedNews ? (
        <div className="space-y-6 max-w-3xl mx-auto">
          <button 
            onClick={() => setSelectedNewsId(null)}
            className="px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-xs font-semibold uppercase tracking-wider font-mono text-gray-400 hover:text-white hover:bg-gray-800 transition"
          >
            ← Back to Announcements
          </button>

          <article className="bg-[#0A0D14] border border-gray-800 rounded-xl p-6 sm:p-8 space-y-6 shadow-xl">
            {selectedNews.image_url && (
              <img 
                src={selectedNews.image_url} 
                alt={selectedNews.title} 
                className="w-full h-auto aspect-video object-cover rounded-xl border border-gray-800"
                referrerPolicy="no-referrer"
              />
            )}

            <div className="space-y-2">
              <div className="flex items-center gap-1 text-[11px] font-mono text-gray-500 font-bold uppercase tracking-wider">
                <Calendar className="h-3.5 w-3.5" />
                <span>Published: {new Date(selectedNews.published_date).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display leading-tight">{selectedNews.title}</h1>
            </div>

            <div className="border-t border-gray-800/60 pt-6">
              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line font-medium">{selectedNews.body}</p>
            </div>
          </article>
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white font-display font-semibold">Club Announcements</h2>
            <p className="text-xs text-gray-500 mt-1">Official news releases, notices, and schedule update briefings.</p>
          </div>

          {/* List of articles */}
          {publishedNews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {publishedNews.map(news => (
                <div 
                  key={news.id} 
                  onClick={() => setSelectedNewsId(news.id)}
                  className="group cursor-pointer bg-[#0A0D14] border border-gray-800 hover:border-gray-700 rounded-xl overflow-hidden transition flex flex-col justify-between"
                >
                  <div className="p-6 space-y-3 flex-1">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#C5A85C] uppercase tracking-wider font-semibold">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{new Date(news.published_date).toLocaleDateString()}</span>
                    </div>

                    <h3 className="text-sm font-bold text-white group-hover:text-[#C5A85C] transition font-display line-clamp-2">{news.title}</h3>
                    <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed">{news.body}</p>
                  </div>

                  {news.image_url && (
                    <div className="aspect-video w-full bg-gray-950 border-t border-gray-800/60 overflow-hidden">
                      <img 
                        src={news.image_url} 
                        alt={news.title} 
                        className="h-full w-full object-cover group-hover:scale-102 transition duration-200"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}

                  <div className="px-6 py-4 bg-gray-950/40 border-t border-gray-800/60 flex items-center justify-between text-xs font-mono font-bold text-gray-400">
                    <span>Read Article</span>
                    <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-[#0A0D14] rounded-xl border border-gray-800 flex flex-col items-center justify-center">
              <Megaphone className="h-12 w-12 text-gray-700 mb-2" />
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider font-mono">No Announcements Published Yet</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
