import React, { useState, useCallback } from 'react';
import { produce } from 'immer';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  BookmarkIcon, 
  BookmarkPlus, 
  ChevronUp, 
  ChevronDown, 
  Star, 
  StarIcon, 
  Trash2 
} from 'lucide-react';

// Reading list manager with immer for immutable state updates
interface Book {
  id: number;
  title: string;
  author: string;
  genre: string;
  isFavorite: boolean;
  rating: number;
  status: 'unread' | 'reading' | 'completed';
}

export const ReadingListManager = () => {
  // Example initial state
  const [books, setBooks] = useState<Book[]>([
    { 
      id: 1, 
      title: 'The Color Out of Space', 
      author: 'H.P. Lovecraft', 
      genre: 'Horror',
      isFavorite: true, 
      rating: 5,
      status: 'completed'
    },
    { 
      id: 2, 
      title: 'Ring', 
      author: 'Koji Suzuki', 
      genre: 'Horror',
      isFavorite: false, 
      rating: 4,
      status: 'reading'
    },
    { 
      id: 3, 
      title: 'Dracula', 
      author: 'Bram Stoker', 
      genre: 'Gothic',
      isFavorite: false, 
      rating: 0,
      status: 'unread'
    },
  ]);
  
  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    genre: '',
  });
  
  // Toggle favorite status (using immer)
  const toggleFavorite = useCallback((id: number) => {
    setBooks(
      produce(draft => {
        const book = draft.find(b => b.id === id);
        if (book) {
          book.isFavorite = !book.isFavorite;
        }
      })
    );
  }, []);
  
  // Update rating (using immer)
  const updateRating = useCallback((id: number, rating: number) => {
    setBooks(
      produce(draft => {
        const book = draft.find(b => b.id === id);
        if (book) {
          book.rating = rating;
        }
      })
    );
  }, []);
  
  // Update reading status (using immer)
  const updateStatus = useCallback((id: number, status: Book['status']) => {
    setBooks(
      produce(draft => {
        const book = draft.find(b => b.id === id);
        if (book) {
          book.status = status;
        }
      })
    );
  }, []);
  
  // Remove book (using immer)
  const removeBook = useCallback((id: number) => {
    setBooks(
      produce(draft => {
        const index = draft.findIndex(b => b.id === id);
        if (index !== -1) {
          draft.splice(index, 1);
        }
      })
    );
  }, []);
  
  // Add new book (using immer)
  const addBook = useCallback(() => {
    if (newBook.title && newBook.author) {
      setBooks(
        produce(draft => {
          const maxId = draft.reduce((max, book) => Math.max(max, book.id), 0);
          draft.push({
            id: maxId + 1,
            ...newBook,
            isFavorite: false,
            rating: 0,
            status: 'unread' as const
          });
        })
      );
      // Reset form
      setNewBook({ title: '', author: '', genre: '' });
    }
  }, [newBook]);
  
  // Move book up in the list (using immer)
  const moveBookUp = useCallback((index: number) => {
    if (index > 0) {
      setBooks(
        produce(draft => {
          const temp = draft[index];
          draft[index] = draft[index - 1];
          draft[index - 1] = temp;
        })
      );
    }
  }, []);
  
  // Move book down in the list (using immer)
  const moveBookDown = useCallback((index: number) => {
    setBooks(
      produce(draft => {
        if (index < draft.length - 1) {
          const temp = draft[index];
          draft[index] = draft[index + 1];
          draft[index + 1] = temp;
        }
      })
    );
  }, []);
  
  // Batch updates (using immer)
  const markAllUnreadAsReading = useCallback(() => {
    setBooks(
      produce(draft => {
        draft.forEach(book => {
          if (book.status === 'unread') {
            book.status = 'reading';
          }
        });
      })
    );
  }, []);
  
  // Get status badge style
  const getStatusBadge = (status: Book['status']) => {
    switch (status) {
      case 'unread':
        return <Badge variant="outline">Unread</Badge>;
      case 'reading':
        return <Badge className="bg-blue-500">Reading</Badge>;
      case 'completed':
        return <Badge className="bg-green-500">Completed</Badge>;
    }
  };
  
  // Render stars for rating
  const renderRatingStars = (book: Book) => {
    return Array(5).fill(0).map((_, index) => (
      <button
        key={index}
        type="button"
        onClick={() => updateRating(book.id, index + 1)}
        className="text-gray-300 hover:text-yellow-400"
      >
        {index < book.rating ? (
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        ) : (
          <Star className="h-4 w-4" />
        )}
      </button>
    ));
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Reading List Manager</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Add new book form */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={newBook.title}
              onChange={(e) => setNewBook({...newBook, title: e.target.value})}
              placeholder="Book title"
            />
          </div>
          <div>
            <Label htmlFor="author">Author</Label>
            <Input
              id="author"
              value={newBook.author}
              onChange={(e) => setNewBook({...newBook, author: e.target.value})}
              placeholder="Author name"
            />
          </div>
          <div>
            <Label htmlFor="genre">Genre</Label>
            <Input
              id="genre"
              value={newBook.genre}
              onChange={(e) => setNewBook({...newBook, genre: e.target.value})}
              placeholder="Book genre"
            />
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button 
            onClick={addBook} 
            disabled={!newBook.title || !newBook.author}
            className="flex gap-2"
          >
            <BookmarkPlus size={16} />
            Add Book
          </Button>
        </div>
        
        {/* Books table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[30px]"></TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Genre</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {books.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  No books added yet. Add your first book above.
                </TableCell>
              </TableRow>
            ) : (
              books.map((book, index) => (
                <TableRow key={book.id}>
                  <TableCell>
                    <div className="flex flex-col space-y-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => moveBookUp(index)}
                        disabled={index === 0}
                        className="h-6 w-6"
                      >
                        <ChevronUp size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => moveBookDown(index)}
                        disabled={index === books.length - 1}
                        className="h-6 w-6"
                      >
                        <ChevronDown size={16} />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {book.title}
                      {book.isFavorite && (
                        <StarIcon className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{book.author}</TableCell>
                  <TableCell>{book.genre}</TableCell>
                  <TableCell>
                    <select
                      value={book.status}
                      onChange={(e) => updateStatus(book.id, e.target.value as Book['status'])}
                      className="border rounded px-2 py-1 text-sm"
                    >
                      <option value="unread">Unread</option>
                      <option value="reading">Reading</option>
                      <option value="completed">Completed</option>
                    </select>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {renderRatingStars(book)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleFavorite(book.id)}
                        className="h-8 w-8"
                      >
                        <BookmarkIcon 
                          className={`h-4 w-4 ${book.isFavorite ? 'fill-primary text-primary' : ''}`} 
                        />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeBook(book.id)}
                        className="h-8 w-8 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          {books.length} books in your reading list
        </div>
        <Button variant="outline" onClick={markAllUnreadAsReading}>
          Mark All Unread as Reading
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ReadingListManager;