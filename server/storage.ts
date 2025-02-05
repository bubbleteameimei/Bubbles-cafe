import { 
  type Post, type InsertPost,
  type Comment, type InsertComment,
  type ReadingProgress, type InsertProgress
} from "@shared/schema";

export interface IStorage {
  // Posts
  getPosts(): Promise<Post[]>;
  getPost(slug: string): Promise<Post | undefined>;
  createPost(post: InsertPost): Promise<Post>;
  getSecretPosts(): Promise<Post[]>;
  
  // Comments
  getComments(postId: number): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  
  // Reading Progress
  getProgress(postId: number): Promise<ReadingProgress | undefined>;
  updateProgress(progress: InsertProgress): Promise<ReadingProgress>;
}

export class MemStorage implements IStorage {
  private posts: Map<number, Post>;
  private comments: Map<number, Comment>;
  private progress: Map<number, ReadingProgress>;
  private currentIds: { [key: string]: number };

  constructor() {
    this.posts = new Map();
    this.comments = new Map();
    this.progress = new Map();
    this.currentIds = { post: 1, comment: 1, progress: 1 };
  }

  async getPosts(): Promise<Post[]> {
    return Array.from(this.posts.values()).filter(p => !p.isSecret);
  }

  async getSecretPosts(): Promise<Post[]> {
    return Array.from(this.posts.values()).filter(p => p.isSecret);
  }

  async getPost(slug: string): Promise<Post | undefined> {
    return Array.from(this.posts.values()).find(p => p.slug === slug);
  }

  async createPost(post: InsertPost): Promise<Post> {
    const id = this.currentIds.post++;
    const newPost = { ...post, id };
    this.posts.set(id, newPost);
    return newPost;
  }

  async getComments(postId: number): Promise<Comment[]> {
    return Array.from(this.comments.values()).filter(c => c.postId === postId);
  }

  async createComment(comment: InsertComment): Promise<Comment> {
    const id = this.currentIds.comment++;
    const newComment = { ...comment, id };
    this.comments.set(id, newComment);
    return newComment;
  }

  async getProgress(postId: number): Promise<ReadingProgress | undefined> {
    return Array.from(this.progress.values()).find(p => p.postId === postId);
  }

  async updateProgress(progress: InsertProgress): Promise<ReadingProgress> {
    const id = this.currentIds.progress++;
    const newProgress = { ...progress, id };
    this.progress.set(id, newProgress);
    return newProgress;
  }
}

export const storage = new MemStorage();
