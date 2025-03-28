/**
 * Test Excerpt Extraction
 * 
 * This script tests the excerpt extraction logic with sample HTML content
 * to ensure it properly identifies and extracts engaging horror excerpts.
 */

// Sample HTML content with varied paragraphs
const sampleContent = `
<p>It was a quiet evening, nothing special about it. The kind where you'd expect to watch TV and fall asleep on the couch.</p>

<p>I heard a strange noise coming from the basement. At first I thought it was just the house settling, but then I heard it again. A sort of scratching sound, like long fingernails on concrete.</p>

<p>The blood dripped slowly from the ceiling, forming a sinister pattern on my bedroom floor. Each drop fell with terrible precision, mapping out what appeared to be some kind of ancient symbol.</p>

<p>"You'll never escape what's waiting for you down there," the old man had warned me when I bought the house. "The darkness has been feeding for generations."</p>

<p>The shadows seemed to move independently from their sources, stretching and contracting like they were breathing. I blinked several times, convinced it was just my tired eyes playing tricks.</p>
`;

// Function that extracts the excerpt (simplified version of the actual function)
function extractHorrorExcerpt(content, maxLength = 250) {
  // First, separate out the HTML paragraphs
  const htmlParagraphs = content.match(/<p>(.*?)<\/p>/g) || [];
  
  // Then clean each paragraph
  const paragraphs = htmlParagraphs
    .map(p => p.replace(/<\/?[^>]+(>|$)/g, '')) // Remove HTML tags
    .map(p => p.replace(/&nbsp;/g, ' '))        // Convert &nbsp; to regular spaces
    .map(p => p.replace(/\s+/g, ' ').trim())    // Normalize whitespace
    .filter(p => p.length > 0);
    
  console.log(`Found ${paragraphs.length} paragraphs:`);
  paragraphs.forEach((p, i) => console.log(`P${i+1}: ${p.substring(0, 30)}...`));
  
  if (paragraphs.length === 0) return '';

  // Keywords that might indicate horror/intense content
  const horrorKeywords = [
    'blood', 'scream', 'death', 'dark', 'fear', 'horror', 'terror', 'shadow',
    'nightmare', 'monster', 'demon', 'ghost', 'kill', 'dead', 'evil', 'haunted',
    'sinister', 'terrifying', 'horrific', 'dread', 'chill', 'spine', 'frightening',
    'mysterious', 'eerie', 'strange', 'creepy', 'disturbing', 'macabre'
  ];

  // Score each paragraph based on horror keywords
  const scoredParagraphs = paragraphs.map(paragraph => {
    let score = 0;
    horrorKeywords.forEach(keyword => {
      const regex = new RegExp(keyword, 'gi');
      const matches = (paragraph.match(regex) || []).length;
      score += matches;
    });
    return { text: paragraph, score };
  });

  // Sort by score and get the highest scoring paragraph
  scoredParagraphs.sort((a, b) => b.score - a.score);

  console.log('Scored paragraphs:');
  scoredParagraphs.forEach((p, i) => {
    console.log(`Paragraph ${i+1} - Score: ${p.score}`);
    console.log(`Text: "${p.text.substring(0, 50)}..."`);
  });

  // If no horror content found, use the most interesting paragraph (not just the first)
  if (scoredParagraphs[0].score === 0) {
    console.log('No horror content found, searching for interesting paragraph');
    
    // Choose a paragraph that's not too short and looks interesting
    // Prefer paragraphs with quotations or interesting punctuation
    const interestingParagraphs = paragraphs
      .filter(p => p.length > 50)
      .map(p => {
        let interestScore = 0;
        // Dialogue is interesting
        interestScore += (p.match(/["'].*?["']/g) || []).length * 2;
        // Questions and exclamations are interesting
        interestScore += (p.match(/[?!]/g) || []).length;
        // Action and sensory descriptions are interesting
        const actionWords = ['suddenly', 'quickly', 'felt', 'saw', 'heard', 'smelled', 'touched'];
        actionWords.forEach(word => {
          const regex = new RegExp(`\\b${word}\\b`, 'gi');
          interestScore += (p.match(regex) || []).length;
        });
        return { text: p, score: interestScore };
      })
      .sort((a, b) => b.score - a.score);
    
    console.log('Interesting paragraphs:');
    interestingParagraphs.forEach((p, i) => {
      console.log(`Paragraph ${i+1} - Interest Score: ${p.score}`);
      console.log(`Text: "${p.text.substring(0, 50)}..."`);
    });
    
    // If we found an interesting paragraph, use it; otherwise use the first paragraph
    const selectedText = interestingParagraphs.length > 0 && interestingParagraphs[0].score > 0
      ? interestingParagraphs[0].text
      : paragraphs[0];
      
    console.log(`Selected paragraph (interesting): "${selectedText.substring(0, 50)}..."`);
      
    // Truncate if needed
    if (selectedText.length <= maxLength) {
      return selectedText;
    }
    
    // Find a good breaking point
    const truncated = selectedText.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    
    return lastSpace > 0 
      ? truncated.substring(0, lastSpace) + '...'
      : truncated + '...';
  }

  // Return the most horror-intensive paragraph
  const excerpt = scoredParagraphs[0].text;
  console.log(`Selected paragraph (horror): "${excerpt.substring(0, 50)}..."`);
  
  // Truncate if needed with proper ending
  if (excerpt.length <= maxLength) {
    return excerpt;
  }
  
  // Find a good breaking point at a sentence or word end
  const truncated = excerpt.substring(0, maxLength);
  
  // Check for sentence end
  const sentenceEnd = Math.max(
    truncated.lastIndexOf('. '),
    truncated.lastIndexOf('? '),
    truncated.lastIndexOf('! ')
  );
  
  // If a sentence end is found within the last 40 characters, use it
  if (sentenceEnd > maxLength - 40 && sentenceEnd > 0) {
    return truncated.substring(0, sentenceEnd + 1) + '...';
  }
  
  // Otherwise fall back to breaking at word boundaries
  const lastSpace = truncated.lastIndexOf(' ');
  
  // Return truncated text with ellipsis
  return lastSpace > 0 
    ? truncated.substring(0, lastSpace) + '...'
    : truncated + '...';
}

// Test the function
console.log('\nExtracted excerpt:');
const excerpt = extractHorrorExcerpt(sampleContent);
console.log(`"${excerpt}"`);

// Check if the function would pick the same paragraph when run multiple times
console.log('\nRunning extraction 3 more times to check consistency:');
for (let i = 0; i < 3; i++) {
  const newExcerpt = extractHorrorExcerpt(sampleContent);
  console.log(`Run ${i+1}: "${newExcerpt}"`);
}