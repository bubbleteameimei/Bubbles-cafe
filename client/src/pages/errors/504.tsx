import React from 'react';
import ErrorPage from '@/components/errors/ErrorPage';

export default function GatewayTimeout504() {
  return (
    <ErrorPage
      code="504"
      title="GATEWAY TIMEOUT"
      message="It was working fine.. until you arrived"
    />
  );
}