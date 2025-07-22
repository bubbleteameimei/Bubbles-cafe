import React, { useState, useEffect } from 'react';

interface Post {
  id: number;
  title: string;
  excerpt: string | null;
  slug: string;
  readingTime?: number;
  authorName?: string;
  views?: number;
  likes?: number;
}

export default function TestRecommendationsPage() {
  const [directRecommendations, setDirectRecommendations] = useState<Post[] | null>(null);
  const [postRecommendations, setPostRecommendations] = useState<Post[] | null>(null);
  const [loading, setLoading] = useState({ direct: false, posts: false });
  const [error, setError] = useState<{ direct: string | null, posts: string | null }>({ direct: null, posts: null });
  const [postId, setPostId] = useState<number>(12); // Default to post ID 12

  // Fetch direct recommendations
  const fetchDirectRecommendations = async () => {
    setLoading(prev => ({ ...prev, direct: true }));
    setError(prev => ({ ...prev, direct: null }));
    
    try {
      const response = await fetch('/api/recommendations/direct');
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Direct recommendations:', data);
      setDirectRecommendations(data);
    } catch (err) {
      console.error('Error fetching direct recommendations:', err);
      setError(prev => ({ ...prev, direct: err instanceof Error ? err.message : String(err) }));
    } finally {
      setLoading(prev => ({ ...prev, direct: false }));
    }
  };

  // Fetch posts recommendations based on a post ID
  const fetchPostRecommendations = async () => {
    if (!postId) return;
    
    setLoading(prev => ({ ...prev, posts: true }));
    setError(prev => ({ ...prev, posts: null }));
    
    try {
      const response = await fetch(`/api/posts/recommendations?postId=${postId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Post recommendations:', data);
      setPostRecommendations(data);
    } catch (err) {
      console.error('Error fetching post recommendations:', err);
      setError(prev => ({ ...prev, posts: err instanceof Error ? err.message : String(err) }));
    } finally {
      setLoading(prev => ({ ...prev, posts: false }));
    }
  };

  // Fetch initial data
  useEffect(() => {
    fetchDirectRecommendations();
    fetchPostRecommendations();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Recommendations API Test</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Direct Recommendations */}
        <div className="border p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Direct Recommendations</h2>
          <button 
            onClick={fetchDirectRecommendations}
            className="px-4 py-2 bg-blue-500 text-white rounded mb-4"
            disabled={loading.direct}
          >
            {loading.direct ? 'Loading...' : 'Refresh'}
          </button>
          
          {error.direct && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              Error: {error.direct}
            </div>
          )}
          
          {directRecommendations ? (
            <ul className="space-y-4">
              {directRecommendations.map(post => (
                <li key={post.id} className="border-b pb-3">
                  <h3 className="font-medium">{post.title}</h3>
                  <p className="text-sm text-gray-600">{post.excerpt}</p>
                  <div className="flex text-xs text-gray-500 mt-2">
                    <span className="mr-3">ID: {post.id}</span>
                    {post.readingTime && <span className="mr-3">{post.readingTime} min read</span>}
                    {post.views && <span className="mr-3">{post.views} views</span>}
                  </div>
                </li>
              ))}
            </ul>
          ) : !loading.direct && !error.direct ? (
            <p>No recommendations available</p>
          ) : null}
        </div>
        
        {/* Post Recommendations */}
        <div className="border p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Posts Recommendations</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Post ID:</label>
            <div className="flex">
              <input
                type="number"
                value={postId}
                onChange={(e) => setPostId(Number(e.target.value))}
                className="border rounded px-3 py-2 w-24 mr-2"
                min="1"
              />
              <button 
                onClick={fetchPostRecommendations}
                className="px-4 py-2 bg-blue-500 text-white rounded"
                disabled={loading.posts}
              >
                {loading.posts ? 'Loading...' : 'Fetch'}
              </button>
            </div>
          </div>
          
          {error.posts && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              Error: {error.posts}
            </div>
          )}
          
          {postRecommendations ? (
            <ul className="space-y-4">
              {postRecommendations.map(post => (
                <li key={post.id} className="border-b pb-3">
                  <h3 className="font-medium">{post.title}</h3>
                  <p className="text-sm text-gray-600">{post.excerpt}</p>
                  <div className="flex text-xs text-gray-500 mt-2">
                    <span className="mr-3">ID: {post.id}</span>
                    {post.readingTime && <span className="mr-3">{post.readingTime} min read</span>}
                    {post.views && <span className="mr-3">{post.views} views</span>}
                  </div>
                </li>
              ))}
            </ul>
          ) : !loading.posts && !error.posts ? (
            <p>No recommendations available</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}