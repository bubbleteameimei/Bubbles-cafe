import React from 'react';
import SimplifiedErrorPage from '@/components/errors/SimplifiedErrorPage';

export default function TooManyRequests429() {
  return (
    <SimplifiedErrorPage
      code="429"
      title="Too Many Requests"
      message="You're asking for too much"
    />
  );
}