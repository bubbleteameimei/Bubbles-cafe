import React from 'react';
import ErrorPage from '@/components/errors/ErrorPage';

export default function TooManyRequests429() {
  return (
    <ErrorPage
      code="429"
      title="TOO MANY REQUESTS"
      message="You're asking for too much!"
    />
  );
}