import { detectThemes, calculateIntensity, THEME_CATEGORIES } from './content-analysis';

// Test content samples
const testContents = {
  psychological: `
    The mind plays tricks in the darkness. Reality seems to bend and shift,
    leaving me questioning my own sanity. The therapist's office feels different today,
    shadows moving when they shouldn't.
  `,
  bodyHorror: `
    My skin began to transform, flesh rippling and twisting into new shapes.
    The mutation spread rapidly, bones cracking as they reformed beneath mutating tissue.
    Every moment brought new horrors as my body betrayed me.
  `,
  lovecraftian: `
    Ancient ruins stretched impossibly high into the void above, their cyclopean
    architecture defying euclidean geometry. The eldritch knowledge contained within
    those forbidden tomes threatened to shatter my fragile grasp on reality.
  `
};

// Test theme detection

Object.entries(testContents).forEach(([type, content]) => {
  const themes = detectThemes(content);
  
});

// Test intensity calculation

Object.entries(testContents).forEach(([type, content]) => {
  const intensity = calculateIntensity(content);
  
});
