/**
 * Test Excerpt Generation
 * 
 * This script tests the improved story excerpt functionality directly by processing
 * a few sample story contents and displaying the extracted horror excerpts.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import puppeteer from 'puppeteer';

// Sample horror content for testing
const testContents = [
  {
    title: "Sample 1: HTML Paragraphs",
    content: `
      <p>This is just a normal introduction paragraph. Nothing scary here.</p>
      <p>But then I heard it. A whisper in the darkness. "I see you," it said, and I felt my blood freeze in my veins.</p>
      <p>The rest of the night was uneventful.</p>
    `
  },
  {
    title: "Sample 2: No HTML Tags",
    content: `
      It started like any other day. I woke up, brushed my teeth, and had breakfast.
      
      That's when I noticed the figure standing in my kitchen. It wasn't human. Its limbs bent at impossible angles, and its skin seemed to ripple like water. When it turned to face me, I saw that it had no eyes, just empty sockets that somehow still seemed to stare directly into my soul.
      
      Later I realized it was just a coat rack. Silly me.
    `
  },
  {
    title: "Sample 3: Mixed Format",
    content: `
      <p>I always check under my bed before I go to sleep.</p>
      
      Not because I'm afraid of monsters. I check to make sure they're still there, waiting for me. Sometimes they get impatient and try to leave early.
      
      <p>My therapist says this is just a coping mechanism.</p>
    `
  }
];

async function testExcerptGeneration() {
  console.log("=== Testing Horror Excerpt Generation ===\n");
  
  // Save each test content to a temporary file
  for (let i = 0; i < testContents.length; i++) {
    const filename = `temp_story_${i}.html`;
    fs.writeFileSync(filename, testContents[i].content);
    console.log(`Created test file: ${filename}`);
  }

  // Launch browser to test our extract function
  console.log("\nStarting browser to test extract function...");
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Navigate to stories page
  console.log("\nNavigating to the stories page to see excerpt examples:");
  await page.goto('http://localhost:3001/stories');
  await page.waitForSelector('.story-card');
  
  // Extract the first few story cards
  const storyCards = await page.evaluate(() => {
    const cards = document.querySelectorAll('.story-card');
    return Array.from(cards).slice(0, 3).map(card => {
      const title = card.querySelector('h3')?.textContent || 'No Title';
      const excerpt = card.querySelector('p.story-excerpt')?.textContent || 'No Excerpt';
      return { title, excerpt };
    });
  });
  
  console.log("\n=== Story Card Excerpts from Website ===");
  storyCards.forEach((card, index) => {
    console.log(`\nStory ${index + 1}: ${card.title}`);
    console.log(`Excerpt: "${card.excerpt}"`);
  });
  
  await browser.close();
  
  // Clean up
  for (let i = 0; i < testContents.length; i++) {
    const filename = `temp_story_${i}.html`;
    fs.unlinkSync(filename);
  }
  
  console.log("\n=== Testing Complete ===");
}

testExcerptGeneration().catch(console.error);