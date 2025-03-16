import React from 'react';
import ErrorPage from '@/components/errors/ErrorPage';

export default function NotFound404() {
  return (
    <ErrorPage
      code="404"
      title="PAGE NOT FOUND"
      message="You shouldn't be here!"
    />
  );
}