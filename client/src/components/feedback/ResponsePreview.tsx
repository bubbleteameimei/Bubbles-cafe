import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { RefreshCw, Check, ThumbsUp, Clipboard, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { apiRequest } from '@/lib/queryClient';

export interface ResponseSuggestion {
  suggestion: string;
  confidence: number;
  category: string;
  tags?: string[];
  template?: string;
  isAutomated: boolean;
}

interface ResponsePreviewProps {
  feedbackId: number;
  initialSuggestion: ResponseSuggestion;
  alternativeSuggestions?: ResponseSuggestion[];
  onSelect?: (suggestion: ResponseSuggestion) => void;
}

export function ResponsePreview({
  feedbackId,
  initialSuggestion,
  alternativeSuggestions = [],
  onSelect
}: ResponsePreviewProps) {
  const [selectedSuggestion, setSelectedSuggestion] = useState<ResponseSuggestion>(initialSuggestion);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [suggestions, setSuggestions] = useState<ResponseSuggestion[]>([
    initialSuggestion,
    ...(alternativeSuggestions || [])
  ]);
  
  // Function to refresh AI suggestions
  const refreshSuggestions = async () => {
    setIsRefreshing(true);
    try {
      const response = await apiRequest<{
        responseSuggestion: ResponseSuggestion;
        alternativeSuggestions: ResponseSuggestion[];
      }>(`/api/feedback/${feedbackId}/suggestions`, {
        method: 'GET'
      });
      
      if (response && response.responseSuggestion) {
        setSuggestions([
          response.responseSuggestion,
          ...(response.alternativeSuggestions || [])
        ]);
        setSelectedSuggestion(response.responseSuggestion);
        toast.success('AI suggestions refreshed');
      }
    } catch (error) {
      console.error('Failed to refresh suggestions:', error);
      toast.error('Failed to refresh suggestions');
    } finally {
      setIsRefreshing(false);
    }
  };
  
  // Handle selecting a suggestion
  const handleSelectSuggestion = (suggestion: ResponseSuggestion) => {
    setSelectedSuggestion(suggestion);
    if (onSelect) {
      onSelect(suggestion);
    }
  };
  
  // Copy suggestion to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(selectedSuggestion.suggestion)
      .then(() => toast.success('Response copied to clipboard'))
      .catch(() => toast.error('Failed to copy to clipboard'));
  };
  
  return (
    <Card className="p-4 bg-card border border-border">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">AI Response Suggestions</h3>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshSuggestions}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-1" />
            )}
            Refresh
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={copyToClipboard}
          >
            <Clipboard className="h-4 w-4 mr-1" />
            Copy
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="preview" className="w-full">
        <TabsList className="mb-2 w-full">
          <TabsTrigger value="preview" className="flex-1">Preview</TabsTrigger>
          <TabsTrigger value="alternatives" className="flex-1">Alternatives</TabsTrigger>
        </TabsList>
        
        <TabsContent value="preview" className="mt-0">
          <div className="bg-muted p-4 rounded-md">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <span className="text-sm font-medium">Confidence:</span>
                <div className="ml-2 h-2 w-20 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary" 
                    style={{ width: `${selectedSuggestion.confidence * 100}%` }}
                  />
                </div>
                <span className="ml-2 text-xs text-muted-foreground">
                  {Math.round(selectedSuggestion.confidence * 100)}%
                </span>
              </div>
              
              <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                {selectedSuggestion.category}
              </span>
            </div>
            
            <div className="whitespace-pre-wrap text-sm">
              {selectedSuggestion.suggestion}
            </div>
            
            {selectedSuggestion.tags && selectedSuggestion.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {selectedSuggestion.tags.map((tag, i) => (
                  <span 
                    key={i} 
                    className="px-2 py-0.5 text-xs rounded-full bg-secondary text-secondary-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          
          <div className="mt-2 flex justify-end gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => onSelect && onSelect(selectedSuggestion)}
            >
              <Check className="h-4 w-4 mr-1" />
              Use This Response
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="alternatives" className="mt-0 space-y-4">
          {suggestions.length > 1 ? (
            suggestions.slice(1).map((suggestion, index) => (
              <div 
                key={index} 
                className="bg-muted p-3 rounded-md cursor-pointer hover:bg-muted/80 transition-colors"
                onClick={() => handleSelectSuggestion(suggestion)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <span className="text-xs font-medium">Confidence:</span>
                    <div className="ml-1 h-1.5 w-16 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary" 
                        style={{ width: `${suggestion.confidence * 100}%` }}
                      />
                    </div>
                    <span className="ml-1 text-xs text-muted-foreground">
                      {Math.round(suggestion.confidence * 100)}%
                    </span>
                  </div>
                  
                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
                    {suggestion.category}
                  </span>
                </div>
                
                <div className="text-xs line-clamp-3 whitespace-pre-wrap">
                  {suggestion.suggestion}
                </div>
                
                <div className="mt-2 flex justify-end gap-1">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-7 px-2" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectSuggestion(suggestion);
                    }}
                  >
                    <ThumbsUp className="h-3 w-3" />
                    <span className="sr-only">Select</span>
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              No alternative suggestions available
            </div>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  );
}