import React, { useState, useCallback } from 'react';
import { Link } from 'wouter';
import jwtDecode from 'jwt-decode';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { TypeAnimation } from 'react-type-animation';
import Modal from 'react-modal';
import { useSpeechSynthesis, useSpeechRecognition } from 'react-speech-kit';
import clsx from 'clsx';
import { CommentModerationSystem } from '@/components/comments/CommentModerationSystem';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Initialize Modal appElement
if (typeof window !== 'undefined') {
  Modal.setAppElement('#root');
}

// Sample JWT token
const SAMPLE_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

// Sample data for charts
const chartData = {
  labels: ['January', 'February', 'March', 'April', 'May', 'June'],
  datasets: [
    {
      label: 'User Engagement',
      data: [12, 19, 3, 5, 2, 3],
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1,
    },
    {
      label: 'Monthly Revenue',
      data: [7, 11, 5, 8, 3, 7],
      backgroundColor: 'rgba(153, 102, 255, 0.2)',
      borderColor: 'rgba(153, 102, 255, 1)',
      borderWidth: 1,
    },
  ],
};

// Sample data for drag and drop
const initialItems = [
  { id: 'item-1', content: 'Item 1 - Research' },
  { id: 'item-2', content: 'Item 2 - Planning' },
  { id: 'item-3', content: 'Item 3 - Design' },
  { id: 'item-4', content: 'Item 4 - Development' },
  { id: 'item-5', content: 'Item 5 - Testing' },
  { id: 'item-6', content: 'Item 6 - Deployment' },
];

export default function RecommendedLibrariesDemo() {
  // State for draggable items
  const [items, setItems] = useState(initialItems);
  
  // State for modals
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState<string | null>(null);
  
  // Speech synthesis
  const { speak, cancel, voices } = useSpeechSynthesis();
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  
  // Speech recognition
  const { listen, listening, stop, transcript } = useSpeechRecognition({
    onResult: (result) => {
      console.log('Speech recognition result:', result);
    },
  });
  
  // Initialize voice when available
  React.useEffect(() => {
    if (voices.length > 0) {
      setSelectedVoice(voices[0]);
    }
  }, [voices]);
  
  // Handle drag end
  const onDragEnd = useCallback((result: any) => {
    if (!result.destination) return;
    
    const newItems = Array.from(items);
    const [reorderedItem] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, reorderedItem);
    
    setItems(newItems);
  }, [items]);
  
  // Decode JWT
  const decodedToken = jwtDecode<{ sub: string; name: string; iat: number }>(SAMPLE_JWT);
  
  // Open modal with section
  const openModal = useCallback((section: string) => {
    setCurrentSection(section);
    setModalIsOpen(true);
  }, []);
  
  // Handle speech
  const handleSpeak = useCallback((text: string) => {
    if (selectedVoice) {
      speak({ 
        text, 
        voice: selectedVoice,
        rate: 1.0,
        pitch: 1.0
      });
    }
  }, [selectedVoice, speak]);
  
  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">Recommended Libraries Demo</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Navigation Section */}
        <div className="col-span-1 md:col-span-2 bg-card p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Demo Sections</h2>
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => openModal('jwt')}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              JWT Decode
            </button>
            <button 
              onClick={() => openModal('dnd')}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Drag and Drop
            </button>
            <button 
              onClick={() => openModal('charts')}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Chart.js
            </button>
            <button 
              onClick={() => openModal('speech')}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Speech Recognition
            </button>
            <button 
              onClick={() => openModal('animation')}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Type Animation
            </button>
            <Link 
              href="/comment-moderation-demo"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Comment Moderation System
            </Link>
          </div>
        </div>
        
        {/* JWT Decode Section */}
        <div className="bg-card p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">JWT Decode Demo</h2>
          <div className="mb-4">
            <h3 className="text-md font-medium mb-2">Sample JWT Token:</h3>
            <div className="bg-muted p-3 rounded text-sm font-mono break-all">
              {SAMPLE_JWT}
            </div>
          </div>
          <div>
            <h3 className="text-md font-medium mb-2">Decoded Token:</h3>
            <div className="bg-muted p-3 rounded">
              <pre className="text-sm overflow-x-auto whitespace-pre-wrap">
                {JSON.stringify(decodedToken, null, 2)}
              </pre>
            </div>
          </div>
        </div>
        
        {/* Chart.js Demo */}
        <div className="bg-card p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Chart.js Demo</h2>
          <div className="space-y-8">
            <div>
              <h3 className="text-md font-medium mb-2">Line Chart:</h3>
              <div className="bg-white p-3 rounded h-64">
                <Line 
                  data={chartData} 
                  options={{ 
                    responsive: true, 
                    maintainAspectRatio: false,
                    plugins: {
                      title: {
                        display: true,
                        text: 'Monthly Performance'
                      }
                    }
                  }} 
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Additional chart types */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="bg-card p-6 rounded-lg shadow-sm">
          <h3 className="text-md font-medium mb-2">Bar Chart:</h3>
          <div className="bg-white p-3 rounded h-64">
            <Bar 
              data={chartData} 
              options={{ 
                responsive: true, 
                maintainAspectRatio: false,
                plugins: {
                  title: {
                    display: true,
                    text: 'Monthly Comparison'
                  }
                }
              }} 
            />
          </div>
        </div>
        
        <div className="bg-card p-6 rounded-lg shadow-sm">
          <h3 className="text-md font-medium mb-2">Pie Chart:</h3>
          <div className="bg-white p-3 rounded h-64">
            <Pie 
              data={{
                labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
                datasets: [
                  {
                    label: 'Dataset 1',
                    data: [12, 19, 3, 5, 2, 3],
                    backgroundColor: [
                      'rgba(255, 99, 132, 0.5)',
                      'rgba(54, 162, 235, 0.5)',
                      'rgba(255, 206, 86, 0.5)',
                      'rgba(75, 192, 192, 0.5)',
                      'rgba(153, 102, 255, 0.5)',
                      'rgba(255, 159, 64, 0.5)',
                    ],
                    borderWidth: 1,
                  },
                ],
              }} 
              options={{ 
                responsive: true, 
                maintainAspectRatio: false,
                plugins: {
                  title: {
                    display: true,
                    text: 'Distribution'
                  }
                }
              }} 
            />
          </div>
        </div>
      </div>
      
      {/* Text animation & Speech Demo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="bg-card p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Type Animation Demo</h2>
          <div className="bg-muted p-6 rounded-md min-h-[150px] flex items-center justify-center">
            <TypeAnimation
              sequence={[
                'Welcome to our interactive storytelling platform!',
                2000,
                'Create engaging narratives with AI assistance.',
                2000,
                'Share your stories with our community.',
                2000,
                'Customize your reading experience.',
                2000,
              ]}
              wrapper="h3"
              speed={50}
              className="text-xl font-medium text-center"
              repeat={Infinity}
            />
          </div>
        </div>
        
        <div className="bg-card p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Speech Recognition Demo</h2>
          <div className="space-y-4">
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium">Text to Speech:</label>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleSpeak('Welcome to our interactive storytelling platform! This is a demonstration of the speech synthesis capabilities.')}
                  className="px-3 py-1 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                >
                  Speak Sample Text
                </button>
                <button
                  onClick={() => cancel()}
                  className="px-3 py-1 bg-muted text-muted-foreground rounded-md hover:bg-muted/80"
                >
                  Stop
                </button>
                <select 
                  className="px-3 py-1 bg-muted text-muted-foreground rounded-md border hover:bg-muted/80"
                  value={selectedVoice ? voices.indexOf(selectedVoice) : 0}
                  onChange={(e) => setSelectedVoice(voices[parseInt(e.target.value)])}
                >
                  {voices.map((voice, index) => (
                    <option key={index} value={index}>
                      {voice.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium">Speech Recognition:</label>
              <div className="flex space-x-2">
                <button
                  onClick={() => listen({ interimResults: true })}
                  className={clsx("px-3 py-1 rounded-md", {
                    "bg-primary text-primary-foreground hover:bg-primary/90": !listening,
                    "bg-destructive text-destructive-foreground hover:bg-destructive/90": listening
                  })}
                >
                  {listening ? 'Listening...' : 'Start Listening'}
                </button>
                <button
                  onClick={() => stop()}
                  className="px-3 py-1 bg-muted text-muted-foreground rounded-md hover:bg-muted/80"
                  disabled={!listening}
                >
                  Stop
                </button>
              </div>
            </div>
            
            <div className="mt-4">
              <label className="text-sm font-medium">Transcript:</label>
              <div className="p-4 border rounded-md min-h-[100px] mt-2">
                {transcript || 'Speak to see transcription here...'}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Drag and Drop Demo */}
      <div className="mb-12">
        <div className="bg-card p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Drag and Drop Demo</h2>
          <p className="mb-4 text-muted-foreground">Drag and drop items to reorder the project workflow:</p>
          
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="tasks">
              {(provided) => (
                <ul
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-2"
                >
                  {items.map((item, index) => (
                    <Draggable key={item.id} draggableId={item.id} index={index}>
                      {(provided, snapshot) => (
                        <li
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={clsx(
                            "p-4 rounded-md border",
                            snapshot.isDragging
                              ? "bg-primary/10 shadow-lg"
                              : "bg-card"
                          )}
                        >
                          {item.content}
                        </li>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </ul>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      </div>

      {/* Comment Moderation Preview */}
      <div className="mb-12">
        <div className="bg-card p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Comment Moderation System Preview</h2>
          <p className="mb-4 text-muted-foreground">
            Our comment moderation system uses advanced profanity filtering with both 
            <code className="px-1 font-mono">bad-words</code> and <code className="px-1 font-mono">leo-profanity</code> libraries.
          </p>
          <div className="mt-6">
            <Link 
              href="/comment-moderation-demo"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              View Full Comment Moderation Demo
            </Link>
          </div>
        </div>
      </div>
      
      {/* Library List Section */}
      <div className="bg-card p-6 rounded-lg shadow-sm mb-12">
        <h2 className="text-xl font-semibold mb-6">Installed Libraries</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="border rounded-lg p-4 bg-background">
            <h3 className="text-lg font-medium">jwt-decode</h3>
            <p className="text-sm text-muted-foreground">Decodes JWTs token for user authentication</p>
          </div>
          <div className="border rounded-lg p-4 bg-background">
            <h3 className="text-lg font-medium">react-beautiful-dnd</h3>
            <p className="text-sm text-muted-foreground">Beautiful drag and drop for lists</p>
          </div>
          <div className="border rounded-lg p-4 bg-background">
            <h3 className="text-lg font-medium">chart.js & react-chartjs-2</h3>
            <p className="text-sm text-muted-foreground">Data visualization components</p>
          </div>
          <div className="border rounded-lg p-4 bg-background">
            <h3 className="text-lg font-medium">bad-words & leo-profanity</h3>
            <p className="text-sm text-muted-foreground">Profanity filtering for comment moderation</p>
          </div>
          <div className="border rounded-lg p-4 bg-background">
            <h3 className="text-lg font-medium">immer</h3>
            <p className="text-sm text-muted-foreground">Simplified immutable state management</p>
          </div>
          <div className="border rounded-lg p-4 bg-background">
            <h3 className="text-lg font-medium">react-type-animation</h3>
            <p className="text-sm text-muted-foreground">Text typing animation effects</p>
          </div>
          <div className="border rounded-lg p-4 bg-background">
            <h3 className="text-lg font-medium">react-modal</h3>
            <p className="text-sm text-muted-foreground">Accessible modal dialogs</p>
          </div>
          <div className="border rounded-lg p-4 bg-background">
            <h3 className="text-lg font-medium">react-speech-kit</h3>
            <p className="text-sm text-muted-foreground">Speech synthesis and recognition</p>
          </div>
          <div className="border rounded-lg p-4 bg-background">
            <h3 className="text-lg font-medium">clsx</h3>
            <p className="text-sm text-muted-foreground">Utility for constructing className strings</p>
          </div>
        </div>
      </div>
      
      {/* Modal Component */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background p-6 rounded-lg border shadow-lg w-full max-w-2xl"
        overlayClassName="fixed inset-0 bg-black/50"
      >
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">
              {currentSection === 'jwt' && 'JWT Decode Details'}
              {currentSection === 'dnd' && 'Drag and Drop Details'}
              {currentSection === 'charts' && 'Chart.js Details'}
              {currentSection === 'speech' && 'Speech Recognition Details'}
              {currentSection === 'animation' && 'Type Animation Details'}
            </h2>
            <button 
              onClick={() => setModalIsOpen(false)}
              className="p-2 rounded-full hover:bg-muted"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
          
          {/* JWT Content */}
          {currentSection === 'jwt' && (
            <div className="space-y-4">
              <p>JWT (JSON Web Token) is a compact, URL-safe means of representing claims between two parties. The jwt-decode library allows you to decode these tokens to access the information they contain.</p>
              <div className="bg-muted p-4 rounded">
                <h3 className="text-md font-medium mb-2">Usage Example:</h3>
                <pre className="text-sm overflow-x-auto">
                  {`
import jwtDecode from 'jwt-decode';

// Decode a token
const decodedToken = jwtDecode(token);
console.log(decodedToken);

// Decode with specific type
interface MyToken {
  name: string;
  role: string;
  exp: number;
}
const myDecodedToken = jwtDecode<MyToken>(token);
console.log(myDecodedToken.name);
                  `}
                </pre>
              </div>
              <p>Note that jwt-decode only decodes tokens, it doesn't verify signatures.</p>
            </div>
          )}
          
          {/* Drag and Drop Content */}
          {currentSection === 'dnd' && (
            <div className="space-y-4">
              <p>React Beautiful DnD provides beautiful and accessible drag and drop for lists. It's particularly useful for building sortable interfaces like kanban boards, task lists, and more.</p>
              <div className="bg-muted p-4 rounded">
                <h3 className="text-md font-medium mb-2">Usage Example:</h3>
                <pre className="text-sm overflow-x-auto">
                  {`
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

// Inside your component
const onDragEnd = (result) => {
  if (!result.destination) return;
  
  const items = Array.from(yourItems);
  const [reorderedItem] = items.splice(result.source.index, 1);
  items.splice(result.destination.index, 0, reorderedItem);
  
  setYourItems(items);
};

// Render
<DragDropContext onDragEnd={onDragEnd}>
  <Droppable droppableId="droppable">
    {(provided) => (
      <div {...provided.droppableProps} ref={provided.innerRef}>
        {items.map((item, index) => (
          <Draggable key={item.id} draggableId={item.id} index={index}>
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
              >
                {item.content}
              </div>
            )}
          </Draggable>
        ))}
        {provided.placeholder}
      </div>
    )}
  </Droppable>
</DragDropContext>
                  `}
                </pre>
              </div>
              <p className="text-amber-600 dark:text-amber-400">Note: react-beautiful-dnd has been marked as deprecated by its maintainers. Consider using @dnd-kit/core for new projects.</p>
            </div>
          )}
          
          {/* Chart.js Content */}
          {currentSection === 'charts' && (
            <div className="space-y-4">
              <p>Chart.js is a flexible JavaScript charting library for designers and developers. With react-chartjs-2, you can easily integrate Chart.js into your React applications.</p>
              <div className="bg-muted p-4 rounded">
                <h3 className="text-md font-medium mb-2">Usage Example:</h3>
                <pre className="text-sm overflow-x-auto">
                  {`
import { Line, Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Create data object
const data = {
  labels: ['January', 'February', 'March', 'April', 'May', 'June'],
  datasets: [
    {
      label: 'Dataset 1',
      data: [12, 19, 3, 5, 2, 3],
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1,
    },
  ],
};

// Render
<Line data={data} options={options} />
<Bar data={data} options={options} />
<Pie data={data} options={options} />
                  `}
                </pre>
              </div>
            </div>
          )}
          
          {/* Speech Recognition Content */}
          {currentSection === 'speech' && (
            <div className="space-y-4">
              <p>React Speech Kit provides React hooks for browser speech recognition and speech synthesis (text-to-speech).</p>
              <div className="bg-muted p-4 rounded">
                <h3 className="text-md font-medium mb-2">Usage Example:</h3>
                <pre className="text-sm overflow-x-auto">
                  {`
import { useSpeechSynthesis, useSpeechRecognition } from 'react-speech-kit';

// For speech synthesis (text-to-speech)
const { speak, cancel, speaking, voices } = useSpeechSynthesis();

// Use it like this
speak({ text: 'Hello world', voice: voices[0] });

// For speech recognition
const { listen, listening, stop, transcript } = useSpeechRecognition({
  onResult: (result) => {
    console.log(result);
  },
});

// Start listening
listen({ interimResults: true });
                  `}
                </pre>
              </div>
              <p>Note: Speech recognition may require permission from the user and is not supported in all browsers.</p>
            </div>
          )}
          
          {/* Type Animation Content */}
          {currentSection === 'animation' && (
            <div className="space-y-4">
              <p>React Type Animation provides an easy way to add typing animation effects to your React applications.</p>
              <div className="bg-muted p-4 rounded">
                <h3 className="text-md font-medium mb-2">Usage Example:</h3>
                <pre className="text-sm overflow-x-auto">
                  {`
import { TypeAnimation } from 'react-type-animation';

// Basic usage
<TypeAnimation
  sequence={[
    'Hello World!', // Type this text
    1000,           // Wait 1 second
    'Welcome to our site!', // Type this text
    2000,           // Wait 2 seconds
    () => console.log('Done typing!'), // Execute a callback
  ]}
  wrapper="p"
  cursor={true}
  repeat={Infinity}
  style={{ fontSize: '2em' }}
/>

// Advanced features
<TypeAnimation
  sequence={[
    'First sentence',
    1000,
    'First sentence and then second sentence',
    2000,
    'Only first sentence',
    1000,
  ]}
  speed={50}
  deletionSpeed={65}
  wrapper="p"
  cursor={true}
  repeat={Infinity}
/>
                  `}
                </pre>
              </div>
            </div>
          )}
          
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setModalIsOpen(false)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}