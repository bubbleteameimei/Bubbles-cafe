import React from 'react';
import SimplifiedErrorPage from '@/components/errors/SimplifiedErrorPage';

export default function NotFound404() {
  return (
    <SimplifiedErrorPage
      code="404"
      title="Page not found"
      message="You shouldn't be here"
    />
  );
}