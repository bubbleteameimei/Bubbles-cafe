export async function enableAxeInDev() {
  if (import.meta.env.PROD) return;
  try {
    const axe = await import('@axe-core/react');
    const React = await import('react');
    const ReactDOM = await import('react-dom');
    (axe as any).default(React, ReactDOM, 1000);
  } catch {}
}

