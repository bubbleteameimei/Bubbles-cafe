/**
 * Email Test Page
 * 
 * Admin page for testing email functionality.
 */

import React from 'react';
import { Helmet } from 'react-helmet';
import EmailServiceTest from '@/components/admin/EmailServiceTest';
import AdminLayout from '@/components/layout/admin-layout';

export default function EmailTestPage() {
  return (
    <>
      <Helmet>
        <title>Email Service Test | Bubble's Cafe Admin</title>
      </Helmet>
      
      <AdminLayout title="Email Service Test">
        <EmailServiceTest />
      </AdminLayout>
    </>
  );
}