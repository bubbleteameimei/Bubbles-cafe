import { useState } from 'react';
import { Share } from 'lucide-react';

export const ShareButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleShare = async () => {
    const shareData = {
      title: document.title,
      text: "Check out this story on our Horror Story Platform!",
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.error("Sharing failed:", error);
        setIsModalOpen(true);
      }
    } else {
      setIsModalOpen(true);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Link copied to clipboard!");
  };

  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      <button onClick={handleShare} className="share-btn" aria-label="Share">
        <Share className="w-6 h-6" />
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Share This Story</h3>
              <button onClick={closeModal} className="text-muted-foreground hover:text-foreground">
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={window.location.href}
                  readOnly
                  className="flex-1 bg-muted p-2 rounded text-sm"
                />
                <button onClick={copyLink} className="bg-primary px-3 py-2 rounded hover:bg-primary/90">
                  📋
                </button>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(window.location.href)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#25D366] text-white p-2 rounded text-center hover:opacity-90"
                >
                  WhatsApp
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#1DA1F2] text-white p-2 rounded text-center hover:opacity-90"
                >
                  Twitter
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#4267B2] text-white p-2 rounded text-center hover:opacity-90"
                >
                  Facebook
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
