import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/hooks/use-toast';

export default function ConnectedAccountsPage() {
  const { checkAuth } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = React.useState<boolean>(true);

  React.useEffect(() => {
    const loadAccounts = async () => {
      try {
        await checkAuth();
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        toast({ title: 'Connection failed', description: msg, variant: 'destructive' });
      }
    };

    loadAccounts();
  }, [checkAuth, toast]);

  if (loading) {
    return <Spinner />;
  }

  return (
    <div>
      <h1>Connected Accounts</h1>
      <p>Manage your connected accounts here.</p>
      {/* Add other account management UI here */}
    </div>
  );
}