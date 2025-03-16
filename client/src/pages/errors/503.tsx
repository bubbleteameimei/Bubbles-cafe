import React from 'react';
import ErrorPage from '@/components/errors/ErrorPage';

export default function ServiceUnavailable503() {
  return (
    <ErrorPage
      code="503"
      title="SERVICE UNAVAILABLE"
      message="The system is.. busy with something else"
    />
  );
}