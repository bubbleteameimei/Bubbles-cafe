import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Redirect } from "wouter";
import { useEffect, useState } from "react";

interface AdminNotification {
	id: number;
	title: string;
	message: string;
	type: string;
	isRead: boolean;
	priority?: number;
	createdAt: string;
}

export default function AdminNotificationsPage() {
	const { user } = useAuth();
	const [notifications, setNotifications] = useState<AdminNotification[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function fetchNotifications() {
		try {
			setLoading(true);
			setError(null);
			const res = await fetch("/api/admin/notifications");
			if (!res.ok) throw new Error("Failed to fetch notifications");
			const data = await res.json();
			setNotifications(data);
		} catch (e: any) {
			setError(e.message || "Failed to load notifications");
		} finally {
			setLoading(false);
		}
	}

	async function markAsRead(id: number) {
		try {
			await fetch(`/api/admin/notifications/${id}/read`, { method: "POST" });
			setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
		} catch {}
	}

	useEffect(() => {
		// Only fetch when admin to avoid unnecessary requests
		if (user?.isAdmin) {
			fetchNotifications();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user?.isAdmin]);

	return !user?.isAdmin ? (
		<Redirect to="/" />
	) : (
		<div className="container mx-auto px-4 py-8">
			<div className="flex items-center justify-between mb-8">
				<h1 className="text-4xl font-bold">Notifications</h1>
				<Button variant="outline" onClick={fetchNotifications} disabled={loading}>Refresh</Button>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>System Notifications</CardTitle>
				</CardHeader>
				<CardContent>
					{error ? (
						<p className="text-destructive">{error}</p>
					) : loading ? (
						<p className="text-muted-foreground">Loading...</p>
					) : notifications.length === 0 ? (
						<p className="text-muted-foreground">No notifications.</p>
					) : (
						<div className="space-y-4">
							{notifications.map((n) => (
								<div key={n.id} className="flex items-start justify-between gap-4 border p-4 rounded-md">
									<div>
										<p className="text-sm text-muted-foreground">{new Date(n.createdAt).toLocaleString()}</p>
										<h3 className="font-medium">{n.title}</h3>
										<p className="text-sm">{n.message}</p>
									</div>
									<div className="flex items-center gap-2">
										<span className={`text-xs px-2 py-1 rounded ${n.type === 'error' ? 'bg-red-500/10 text-red-500' : n.type === 'warning' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-blue-500/10 text-blue-500'}`}>{n.type}</span>
										{!n.isRead && (
											<Button size="sm" onClick={() => markAsRead(n.id)}>Mark as read</Button>
										)}
									</div>
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
