import React from 'react';
import SimplifiedErrorPage from '@/components/errors/SimplifiedErrorPage';

export default function Forbidden403() {
  return (
    <SimplifiedErrorPage
      code="403"
      title="Forbidden"
      message="It's locked for a reason. Leave!"
    />
  );
}