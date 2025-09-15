import { useState } from 'react';
import { getExcerpt, getReadingTime } from '@/lib/content-analysis';

// Sample content in different formats to test our improvements
const SAMPLE_CONTENTS = [
  {
    type: 'String content with HTML',
    content: `<h1>The Haunting</h1><p>It was the dead of night when I first heard the scratching at my window. The wind howled outside, a mournful sound that sent shivers down my spine. I tried to convince myself it was just a tree branch, but deep down I knew better.</p><p>The scratching continued, growing more insistent. <em>Scratch, scratch, scratch.</em> It seemed to have a rhythm now, like someone—or something—was trying to get my attention.</p><p>When I finally gathered the courage to pull back the curtain, what I saw made my blood run cold...</p>`
  },
  {
    type: 'WordPress object format',
    content: {
      rendered: `<h1>Beneath the Surface</h1><p>The lake had always been a part of our town's identity. People swam in it during summer, ice skated across it in winter. Nobody questioned why the water was so dark you couldn't see more than a few inches below the surface.</p><p>Nobody asked about the odd ripples that appeared on windless days.</p><p>And nobody talked about the people who went missing each year, their bodies never recovered despite extensive searches.</p><p>It wasn't until I found the old town records that I realized the truth—our lake wasn't a natural formation at all. It was the result of flooding an ancient burial ground, and something down there was very, very angry.</p>`,
      protected: false
    }
  },
  {
    type: 'Plain text',
    content: "The corridor stretched before me, impossibly long in the dim light. Each step I took echoed against the worn marble floor, announcing my presence to whatever might be listening. The portraits on the walls seemed to follow my movement, their eyes shifting subtly beneath layers of dust and time.\n\nSomething was wrong with this place. The air felt thick, heavy with a sense of anticipation that made it difficult to breathe. I checked my phone again—still no signal. I was completely alone.\n\nOr at least, I thought I was until I heard the soft laughter of a child coming from somewhere ahead."
  }
];

export default function ContentTest() {
  const [selectedContentIndex, setSelectedContentIndex] = useState(0);
  const selectedContent = SAMPLE_CONTENTS[selectedContentIndex];
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Content Analysis Test</h1>
      
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Select Content Format:</label>
        <select 
          className="w-full p-2 border rounded"
          value={selectedContentIndex}
          onChange={(e) => setSelectedContentIndex(parseInt(e.target.value))}
        >
          {SAMPLE_CONTENTS.map((item, index) => (
            <option key={index} value={index}>{item.type}</option>
          ))}
        </select>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded p-4">
          <h2 className="text-xl font-bold mb-2">Original Content</h2>
          <pre className="whitespace-pre-wrap bg-gray-100 p-3 rounded text-sm overflow-auto max-h-[300px]">
            {JSON.stringify(selectedContent.content, null, 2)}
          </pre>
        </div>
        
        <div className="space-y-6">
          <div className="border rounded p-4">
            <h2 className="text-xl font-bold mb-2">Reading Time</h2>
            <div className="bg-gray-100 p-3 rounded">
              {getReadingTime(selectedContent.content)}
            </div>
          </div>
          
          <div className="border rounded p-4">
            <h2 className="text-xl font-bold mb-2">Generated Excerpt</h2>
            <div className="bg-gray-100 p-3 rounded">
              {getExcerpt(selectedContent.content)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}