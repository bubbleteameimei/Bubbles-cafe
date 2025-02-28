
import axios from 'axios';

// WordPress API endpoint configuration
const WP_API_BASE = 'https://public-api.wordpress.com/wp/v2/sites/bubbleteameimei.wordpress.com';

export interface WordPressPost {
  id: number;
  date: string;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  excerpt: {
    rendered: string;
  };
  slug: string;
}

export const wordpress = {
  async getPosts(page = 1, perPage = 10) {
    try {
      const response = await axios.get(`${WP_API_BASE}/posts`, {
        params: {
          page,
          per_page: perPage,
          _fields: 'id,date,title,content,excerpt,slug',
        },
      });
      
      // Extract total pages from headers
      const totalPages = parseInt(response.headers['x-wp-totalpages'] || '1', 10);
      const hasMore = page < totalPages;
      
      return {
        posts: response.data,
        hasMore,
        totalPages
      };
    } catch (error) {
      console.error('Error fetching WordPress posts:', error);
      throw error;
    }
  },
  
  async getPost(slug: string) {
    try {
      const response = await axios.get(`${WP_API_BASE}/posts`, {
        params: {
          slug,
          _fields: 'id,date,title,content,excerpt,slug',
        },
      });
      
      if (response.data && response.data.length > 0) {
        return response.data[0];
      }
      return null;
    } catch (error) {
      console.error(`Error fetching WordPress post with slug ${slug}:`, error);
      throw error;
    }
  }
};
