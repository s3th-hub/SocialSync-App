import React from 'react';
import { PlatformResult } from '../types';
import { Copy, RefreshCw, Download, Share2, Hash } from 'lucide-react';

interface PlatformCardProps {
  result: PlatformResult;
  icon: React.ReactNode;
  color: string;
  platformName: string;
}

const PlatformCard: React.FC<PlatformCardProps> = ({ result, icon, color, platformName }) => {
  const handleCopy = () => {
    if (result.content) {
      navigator.clipboard.writeText(result.content);
      // Could add a toast here, but keeping it simple
    }
  };

  const handleDownloadImage = () => {
    if (result.imageUrl) {
      const link = document.createElement('a');
      link.href = result.imageUrl;
      link.download = `${result.platform}-post.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden transition-all duration-300 hover:border-slate-600 hover:shadow-xl hover:shadow-indigo-900/20">
      {/* Header */}
      <div className={`p-4 flex items-center gap-3 border-b border-slate-700/50 ${color} bg-opacity-10`}>
        <div className={`p-2 rounded-lg ${color} text-white`}>
          {icon}
        </div>
        <h3 className="font-bold text-lg text-slate-100">{platformName}</h3>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-5 flex flex-col gap-6">
        {/* Text Section */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Draft</span>
            <button 
              onClick={handleCopy}
              disabled={!result.content || result.isLoadingText}
              className="text-slate-400 hover:text-white disabled:opacity-30 transition-colors p-1"
              title="Copy text"
            >
              <Copy size={16} />
            </button>
          </div>
          
          <div className="min-h-[120px] bg-slate-900/50 rounded-lg p-4 text-slate-300 text-sm leading-relaxed border border-slate-800">
            {result.isLoadingText ? (
              <div className="animate-pulse space-y-2">
                <div className="h-2 bg-slate-700 rounded w-3/4"></div>
                <div className="h-2 bg-slate-700 rounded w-full"></div>
                <div className="h-2 bg-slate-700 rounded w-5/6"></div>
                <div className="h-2 bg-slate-700 rounded w-1/2"></div>
              </div>
            ) : result.content ? (
              <div className="whitespace-pre-wrap">{result.content}</div>
            ) : (
              <span className="text-slate-600 italic">Ready to generate...</span>
            )}
          </div>
        </div>

        {/* Image Section */}
        <div className="space-y-2 flex-1 flex flex-col">
          <div className="flex justify-between items-center">
             <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Visual</span>
             {result.imageUrl && (
               <button 
                 onClick={handleDownloadImage}
                 className="text-slate-400 hover:text-white transition-colors p-1"
                 title="Download image"
               >
                 <Download size={16} />
               </button>
             )}
          </div>

          <div className="relative flex-1 w-full rounded-lg bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center min-h-[200px]">
            {result.isLoadingImage ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-indigo-400">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs font-medium animate-pulse">Creating masterpiece...</span>
              </div>
            ) : result.imageUrl ? (
              <img 
                src={result.imageUrl} 
                alt={`Generated for ${platformName}`} 
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />
            ) : result.isLoadingText ? (
               <div className="text-slate-600 flex flex-col items-center gap-2">
                 <Hash size={24} className="opacity-20" />
                 <span className="text-xs">Waiting for context...</span>
               </div>
            ) : (
              <div className="text-slate-700 flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center">
                  <Share2 size={20} className="opacity-50" />
                </div>
                <span className="text-xs">Image will appear here</span>
              </div>
            )}
          </div>
          
          {/* Aspect Ratio Badge */}
          {result.imageUrl && (
             <div className="text-center">
                <span className="inline-block px-2 py-1 bg-slate-800 rounded text-[10px] text-slate-400 border border-slate-700">
                  Generated with {result.platform === 'instagram' ? '1:1' : '16:9'} aspect ratio
                </span>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlatformCard;