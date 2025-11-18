import React, { useState } from 'react';
import { Linkedin, Twitter, Instagram, Wand2, Sparkles, Loader2, ImagePlus, Send } from 'lucide-react';
import { Tone, PlatformResult, SocialContentResponse } from './types';
import { generateSocialContent, generateImageForPlatform } from './services/geminiService';
import PlatformCard from './components/PlatformCard';

const App: React.FC = () => {
  const [idea, setIdea] = useState('');
  const [tone, setTone] = useState<Tone>(Tone.PROFESSIONAL);
  const [isGenerating, setIsGenerating] = useState(false);

  // State for results
  const [results, setResults] = useState<{
    linkedin: PlatformResult;
    twitter: PlatformResult;
    instagram: PlatformResult;
  }>({
    linkedin: { platform: 'linkedin', content: null, imageUrl: null, isLoadingText: false, isLoadingImage: false },
    twitter: { platform: 'twitter', content: null, imageUrl: null, isLoadingText: false, isLoadingImage: false },
    instagram: { platform: 'instagram', content: null, imageUrl: null, isLoadingText: false, isLoadingImage: false },
  });

  const handleGenerate = async () => {
    if (!idea.trim()) return;

    setIsGenerating(true);
    
    // Reset and start loading text
    setResults(prev => ({
      linkedin: { ...prev.linkedin, content: null, imageUrl: null, isLoadingText: true, isLoadingImage: false, error: undefined },
      twitter: { ...prev.twitter, content: null, imageUrl: null, isLoadingText: true, isLoadingImage: false, error: undefined },
      instagram: { ...prev.instagram, content: null, imageUrl: null, isLoadingText: true, isLoadingImage: false, error: undefined },
    }));

    try {
      // 1. Generate Text Content
      const contentResponse: SocialContentResponse = await generateSocialContent(idea, tone);

      // Update text results and start image loading
      setResults(prev => ({
        linkedin: { 
          ...prev.linkedin, 
          content: formatPost(contentResponse.linkedin.post, contentResponse.linkedin.hashtags), 
          isLoadingText: false, 
          isLoadingImage: true,
          imagePrompt: contentResponse.linkedin.imagePrompt 
        },
        twitter: { 
          ...prev.twitter, 
          content: formatPost(contentResponse.twitter.post, contentResponse.twitter.hashtags), 
          isLoadingText: false, 
          isLoadingImage: true,
          imagePrompt: contentResponse.twitter.imagePrompt 
        },
        instagram: { 
          ...prev.instagram, 
          content: formatPost(contentResponse.instagram.post, contentResponse.instagram.hashtags), 
          isLoadingText: false, 
          isLoadingImage: true,
          imagePrompt: contentResponse.instagram.imagePrompt 
        },
      }));

      // 2. Generate Images in Parallel
      // We trigger these side-effects without awaiting them all at once so UI updates independently
      triggerImageGeneration('linkedin', contentResponse.linkedin.imagePrompt);
      triggerImageGeneration('twitter', contentResponse.twitter.imagePrompt);
      triggerImageGeneration('instagram', contentResponse.instagram.imagePrompt);

    } catch (error) {
      console.error("Main generation error:", error);
      setIsGenerating(false);
      setResults(prev => ({
        linkedin: { ...prev.linkedin, isLoadingText: false, isLoadingImage: false, error: "Failed to generate content" },
        twitter: { ...prev.twitter, isLoadingText: false, isLoadingImage: false, error: "Failed to generate content" },
        instagram: { ...prev.instagram, isLoadingText: false, isLoadingImage: false, error: "Failed to generate content" },
      }));
    } finally {
      // Note: isGenerating tracks the *initiation* process. 
      // Individual card loading states handle the rest.
      setIsGenerating(false);
    }
  };

  const formatPost = (post: string, hashtags?: string[]) => {
    if (!hashtags || hashtags.length === 0) return post;
    return `${post}\n\n${hashtags.join(' ')}`;
  };

  const triggerImageGeneration = async (platform: 'linkedin' | 'twitter' | 'instagram', prompt: string) => {
    try {
      const imageUrl = await generateImageForPlatform(prompt, platform);
      setResults(prev => ({
        ...prev,
        [platform]: { ...prev[platform], imageUrl, isLoadingImage: false }
      }));
    } catch (error) {
      console.error(`Failed image gen for ${platform}`, error);
      setResults(prev => ({
        ...prev,
        [platform]: { ...prev[platform], isLoadingImage: false, error: "Image generation failed" }
      }));
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 pb-24">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-3 py-8">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-500/10 rounded-2xl mb-2 ring-1 ring-indigo-500/20">
            <Sparkles className="text-indigo-400 w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            SocialSync AI
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Turn one idea into optimized posts and unique visuals for every platform instantly.
          </p>
        </div>

        {/* Input Section - Sticky on Desktop/Tablet? Maybe just top placed. */}
        <div className="max-w-3xl mx-auto bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-800 p-6 md:p-8 shadow-2xl shadow-indigo-500/5">
          <div className="space-y-6">
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300 uppercase tracking-wider ml-1">
                Your Idea
              </label>
              <textarea
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder="e.g., A revolutionary eco-friendly coffee cup that plants a tree when you recycle it..."
                className="w-full h-32 bg-slate-950 border border-slate-700 rounded-xl p-4 text-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder-slate-600 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300 uppercase tracking-wider ml-1">
                  Select Tone
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.values(Tone).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTone(t)}
                      className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 border ${
                        tone === t
                          ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20'
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750 hover:border-slate-600'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleGenerate}
                  disabled={!idea.trim() || isGenerating}
                  className="w-full h-[120px] md:h-auto py-4 bg-gradient-to-br from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-slate-800 disabled:to-slate-800 disabled:cursor-not-allowed rounded-xl font-bold text-lg shadow-xl shadow-indigo-900/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="animate-spin" size={24} />
                      <span>Drafting...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 size={24} />
                      <span>Generate Content</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 pt-8">
          <PlatformCard
            platformName="LinkedIn"
            icon={<Linkedin size={24} />}
            color="bg-blue-600"
            result={results.linkedin}
          />
          <PlatformCard
            platformName="Twitter / X"
            icon={<Twitter size={24} />}
            color="bg-sky-500"
            result={results.twitter}
          />
          <PlatformCard
            platformName="Instagram"
            icon={<Instagram size={24} />}
            color="bg-pink-600"
            result={results.instagram}
          />
        </div>

      </div>
    </div>
  );
};

export default App;