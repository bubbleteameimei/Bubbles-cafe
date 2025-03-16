import React from 'react';
import ErrorPage from '@/components/errors/ErrorPage';

export default function Forbidden403() {
  return (
    <ErrorPage
      code="403"
      title="FORBIDDEN"
      message="It's locked for a reason. Leave!"
    />
  );
}