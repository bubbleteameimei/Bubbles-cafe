import { describe, test, expect } from 'vitest';
import { sanitizeHTML } from '../wordpress';

describe('WordPress Content Sanitizer', () => {
  test('removes latest posts blocks with all variations', () => {
    const input = `
      <!-- wp:query {"queryId":1,"query":{"posts":true}} -->
      <div class="wp-block-query">
        <!-- wp:post-template -->
        <div class="wp-block-post-template">
          <h2>Recent Posts</h2>
          <ul class="latest-posts">
            <li>Post 1</li>
            <li>Post 2</li>
          </ul>
        </div>
        <!-- /wp:post-template -->
      </div>
      <!-- /wp:query -->
      <p>Story text here.</p>
    `;

    const sanitized = sanitizeHTML(input);
    expect(sanitized).not.toContain('Recent Posts');
    expect(sanitized).not.toContain('Post 1');
    expect(sanitized).toContain('Story text here');
  });

  test('removes social links blocks with all variations', () => {
    const input = `
      <!-- wp:social-links -->
      <ul class="wp-block-social-links">
        <li class="wp-social-link"><a href="https://twitter.com">Twitter</a></li>
        <li class="wp-social-link"><a href="https://facebook.com">Facebook</a></li>
      </ul>
      <!-- /wp:social-links -->
      <div class="social-share-buttons">
        <button>Share on Twitter</button>
        <button>Share on Facebook</button>
      </div>
      <nav class="social-navigation">
        <ul>
          <li><a href="/twitter">Follow us</a></li>
        </ul>
      </nav>
      <p>Main story content here.</p>
    `;

    const sanitized = sanitizeHTML(input);
    expect(sanitized).not.toContain('Twitter');
    expect(sanitized).not.toContain('Facebook');
    expect(sanitized).not.toContain('Share');
    expect(sanitized).not.toContain('Follow');
    expect(sanitized).toContain('Main story content here');
  });

  test('removes theme-specific social and post blocks', () => {
    const input = `
      <div class="sharedaddy">
        <h3>Share this:</h3>
        <div class="sd-social-icon">Share buttons here</div>
      </div>
      <div class="jp-relatedposts">
        <h3>Related posts</h3>
        <div class="jp-relatedposts-items">Post list here</div>
      </div>
      <div class="post-grid-view">
        <h3>More stories</h3>
        <div class="post-list">Post grid here</div>
      </div>
      <p>Actual story content.</p>
    `;

    const sanitized = sanitizeHTML(input);
    expect(sanitized).not.toContain('Share this');
    expect(sanitized).not.toContain('Related posts');
    expect(sanitized).not.toContain('More stories');
    expect(sanitized).toContain('Actual story content');
  });

  test('keeps essential story formatting intact', () => {
    const input = `
      <h1>Story Title</h1>
      <p>First paragraph with <strong>bold</strong> and <em>italic</em> text.</p>
      <!-- wp:social-links -->
      <ul class="social-links">Social stuff</ul>
      <!-- /wp:social-links -->
      <p>Second paragraph with a <a href="#">link</a> that should be removed.</p>
      <div class="latest-posts">Recent posts here</div>
      <blockquote>This quote should remain.</blockquote>
    `;

    const sanitized = sanitizeHTML(input);
    expect(sanitized).toContain('Story Title');
    expect(sanitized).toContain('<strong>bold</strong>');
    expect(sanitized).toContain('<em>italic</em>');
    expect(sanitized).not.toContain('Social stuff');
    expect(sanitized).not.toContain('<a href="#">');
    expect(sanitized).not.toContain('Recent posts');
    expect(sanitized).toContain('This quote should remain');
  });
});