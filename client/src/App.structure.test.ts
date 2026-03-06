import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('App.tsx structure', () => {
  it('keeps routes defined in a single Switch (plus error switch)', () => {
    const file = path.join(process.cwd(), 'client', 'src', 'App.tsx');
    const src = fs.readFileSync(file, 'utf8');

    const switchCount = (src.match(/<Switch>/g) || []).length;
    expect(switchCount).toBe(2);

    const appRoutesUsageCount = (src.match(/<AppRoutes\s*\/>/g) || []).length;
    expect(appRoutesUsageCount).toBe(2);
  });
});
