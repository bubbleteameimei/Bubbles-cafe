import React from 'react';
import ErrorPage from '@/components/errors/ErrorPage';

export default function InternalServerError500() {
  return (
    <ErrorPage
      code="500"
      title="INTERNAL SERVER ERROR"
      message="What did you do? Something has gone wrong."
    />
  );
}