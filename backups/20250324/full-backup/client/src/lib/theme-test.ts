import { detectThemes } from './content-analysis';

// Test cases for each story
const testCases = [
  {
    title: "Nostalgia",
    content: "Nostalgia is disgusting. It is a slimy, writhing worm in your brain...",
    expectedTheme: "PARASITIC"
  },
  {
    title: "Cave",
    content: "In the depths of the cave a fallen god casts an imposing figure...",
    expectedTheme: "LOVECRAFTIAN"
  },
  {
    title: "Therapist",
    content: "You've come in again today for your session...",
    expectedTheme: "PSYCHOLOGICAL"
  },
  {
    title: "Machine",
    content: "Driven by my obsession to transcend human limitations...",
    expectedTheme: "TECHNOLOGICAL"
  },
  {
    title: "Bleach",
    content: "Do you want to end it all? Drink bleach then!...",
    expectedTheme: "SUICIDAL"
  },
  {
    title: "Doll",
    content: "She appeared the day you left... possessed by a spirit...",
    expectedTheme: "POSSESSION"
  },
  {
    title: "Cookbook",
    content: "I'm starting a cookbook. I'm working on my first recipe...",
    expectedTheme: "CANNIBALISM"
  }
];

// Run tests
testCases.forEach(test => {
  const detectedTheme = detectThemes(test.content)[0];
  console.log(`Story: ${test.title}`);
  console.log(`Expected: ${test.expectedTheme}`);
  console.log(`Detected: ${detectedTheme}`);
  console.log(`Match: ${detectedTheme === test.expectedTheme ? 'YES' : 'NO'}`);
  console.log('---');
});
