import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Initial items for reading list demonstration
interface ReadingItem {
  id: string;
  title: string;
  author: string;
  description: string;
}

// Function to reorder the list
const reorder = (list: ReadingItem[], startIndex: number, endIndex: number): ReadingItem[] => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

// Item Component
const ReadingListItem = ({ item, index }: { item: ReadingItem; index: number }) => (
  <Draggable draggableId={item.id} index={index}>
    {(provided, snapshot) => (
      <Card
        className={`mb-3 ${snapshot.isDragging ? 'border-primary shadow-lg' : ''}`}
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
      >
        <CardHeader className="p-3 pb-0">
          <CardTitle className="text-base">{item.title}</CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-1">
          <p className="text-sm text-muted-foreground">by {item.author}</p>
          <p className="text-sm mt-1">{item.description}</p>
        </CardContent>
      </Card>
    )}
  </Draggable>
);

// Main component
export const ReadingList = () => {
  // Sample items for demonstration
  const [items, setItems] = useState<ReadingItem[]>([
    {
      id: 'item-1',
      title: 'The Shadow Over Innsmouth',
      author: 'H.P. Lovecraft',
      description: 'A first-person narrative of a young man\'s discovery of a strange town and its macabre inhabitants.'
    },
    {
      id: 'item-2',
      title: 'The Shining',
      author: 'Stephen King',
      description: 'A novelist and recovering alcoholic accepts a caretaker job at a remote hotel, where he confronts supernatural forces.'
    },
    {
      id: 'item-3',
      title: 'House of Leaves',
      author: 'Mark Z. Danielewski',
      description: 'A complex exploration of a house that\'s bigger on the inside than the outside.'
    },
    {
      id: 'item-4',
      title: 'Bird Box',
      author: 'Josh Malerman',
      description: 'In a post-apocalyptic world, a woman must navigate with her children while blindfolded to avoid mysterious entities.'
    },
  ]);

  const onDragEnd = (result: DropResult) => {
    // Dropped outside the list
    if (!result.destination) {
      return;
    }

    // Reorder the items
    const reorderedItems = reorder(
      items,
      result.source.index,
      result.destination.index
    );

    setItems(reorderedItems);
  };

  // Function to add a new item
  const addRandomItem = () => {
    const randomBooks = [
      {
        title: 'Dracula',
        author: 'Bram Stoker',
        description: 'The classic vampire tale told through letters and journal entries.'
      },
      {
        title: 'Frankenstein',
        author: 'Mary Shelley',
        description: 'A scientist creates a sentient creature in an unorthodox experiment.'
      },
      {
        title: 'The Haunting of Hill House',
        author: 'Shirley Jackson',
        description: 'Four seekers arrive at a notoriously unfriendly Hill House.'
      }
    ];
    
    const randomBook = randomBooks[Math.floor(Math.random() * randomBooks.length)];
    
    setItems([
      ...items,
      {
        id: `item-${items.length + 1}`,
        ...randomBook
      }
    ]);
  };

  return (
    <div className="space-y-4 max-w-xl mx-auto p-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Reading Queue</h2>
        <Button onClick={addRandomItem}>Add Book</Button>
      </div>
      
      <p className="text-muted-foreground">Drag and drop to reorder your reading list.</p>
      
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="reading-list">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-2"
            >
              {items.map((item, index) => (
                <ReadingListItem key={item.id} item={item} index={index} />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default ReadingList;