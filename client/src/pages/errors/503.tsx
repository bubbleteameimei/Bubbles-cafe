import React from 'react';
import SimplifiedErrorPage from '@/components/errors/SimplifiedErrorPage';

export default function ServiceUnavailable503() {
  return (
    <SimplifiedErrorPage
      code="503"
      title="Service Unavailable"
      message="The system is.. busy with something else"
    />
  );
}