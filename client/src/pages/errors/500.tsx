import React from 'react';
import SimplifiedErrorPage from '@/components/errors/SimplifiedErrorPage';

export default function InternalServerError500() {
  return (
    <SimplifiedErrorPage
      code="500"
      title="Internal Server Error"
      message="What did you do? Something has gone wrong."
    />
  );
}