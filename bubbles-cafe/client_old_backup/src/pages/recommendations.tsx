import { useState } from 'react';
import { PersonalizedRecommendations } from '@/components/PersonalizedRecommendations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

export default function RecommendationsPage() {
  const [theme, setTheme] = useState('');
  const [preferredThemes, setPreferredThemes] = useState<string[]>([]);
  const [limit, setLimit] = useState(5);

  const addTheme = () => {
    if (theme && !preferredThemes.includes(theme)) {
      setPreferredThemes([...preferredThemes, theme]);
      setTheme('');
    }
  };

  const removeTheme = (themeToRemove: string) => {
    setPreferredThemes(preferredThemes.filter(t => t !== themeToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addTheme();
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold mb-2">Personalized Horror Recommendations</h1>
      <p className="text-muted-foreground mb-8">
        Discover stories tailored to your interests and reading history.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Customize Your Feed</CardTitle>
              <CardDescription>
                Add themes you're interested in to get more relevant horror stories.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter a theme (e.g., 'paranormal')"
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                  <Button onClick={addTheme}>Add</Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {preferredThemes.map((t) => (
                    <Badge key={t} variant="secondary" className="flex items-center gap-1">
                      {t}
                      <button onClick={() => removeTheme(t)} className="ml-1">
                        <X size={14} />
                      </button>
                    </Badge>
                  ))}
                </div>

                <div className="space-y-2">
                  <label htmlFor="limit" className="text-sm font-medium">
                    Number of stories to show:
                  </label>
                  <Input
                    id="limit"
                    type="number"
                    min={1}
                    max={12}
                    value={limit}
                    onChange={(e) => setLimit(parseInt(e.target.value) || 5)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <PersonalizedRecommendations
            limit={limit}
            preferredThemes={preferredThemes}
          />
        </div>
      </div>

      <div className="rounded-lg bg-card p-6 border">
        <h2 className="text-2xl font-semibold mb-4">How Personalization Works</h2>
        <div className="space-y-4">
          <p>
            Our enhanced recommendation engine delivers personalized horror stories based on multiple factors:
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li>
              <strong>Reading History:</strong> We analyze stories you've read to understand your preferences
            </li>
            <li>
              <strong>Likes & Bookmarks:</strong> Stories you've liked or saved help us learn your taste
            </li>
            <li>
              <strong>Theme Preferences:</strong> Add specific themes you enjoy (like "paranormal" or "psychological")
            </li>
            <li>
              <strong>Collaborative Filtering:</strong> Recommendations based on similar readers' preferences
            </li>
          </ul>
          <p className="text-muted-foreground">
            The more you interact with stories, the better your recommendations will become. Our system continuously
            learns and adapts to provide the most relevant and engaging horror content.
          </p>
        </div>
      </div>
    </div>
  );
}