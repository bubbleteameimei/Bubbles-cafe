import React from 'react';
import SimplifiedErrorPage from '@/components/errors/SimplifiedErrorPage';

export default function GatewayTimeout504() {
  return (
    <SimplifiedErrorPage
      code="504"
      title="Gateway Timeout"
      message="It was working fine.. until you arrived"
    />
  );
}