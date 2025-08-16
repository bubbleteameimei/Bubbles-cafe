import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Redirect } from "wouter";
import { useEffect, useState } from "react";

interface SiteSetting { id: number; key: string; value: string; category: string; description?: string | null; updatedAt: string; }

export default function AdminSettingsPage() {
	const { user } = useAuth();
	const [settings, setSettings] = useState<SiteSetting[]>([]);
	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);

	async function loadSettings() {
		try {
			setLoading(true);
			setError(null);
			const res = await fetch("/api/admin/site-settings");
			if (!res.ok) throw new Error("Failed to fetch settings");
			const data = await res.json();
			setSettings(data);
		} catch (e: any) {
			setError(e.message || "Failed to load settings");
		} finally {
			setLoading(false);
		}
	}

	async function saveSetting(key: string, value: string) {
		try {
			setSaving(true);
			setSuccess(null);
			setError(null);
			const res = await fetch("/api/admin/site-settings", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ key, value })
			});
			if (!res.ok) throw new Error("Failed to update setting");
			setSuccess("Saved");
		} catch (e: any) {
			setError(e.message || "Failed to save setting");
		} finally {
			setSaving(false);
		}
	}

	useEffect(() => {
		if (user?.isAdmin) {
			loadSettings();
		}
		 
	}, [user?.isAdmin]);

	return !user?.isAdmin ? (
		<Redirect to="/" />
	) : (
		<div className="container mx-auto px-4 py-8">
			<div className="flex items-center justify-between mb-8">
				<h1 className="text-4xl font-bold">Site Settings</h1>
				<Button variant="outline" onClick={loadSettings} disabled={loading}>Refresh</Button>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Configuration</CardTitle>
				</CardHeader>
				<CardContent>
					{error && <p className="text-destructive mb-4">{error}</p>}
					{success && <p className="text-emerald-500 mb-4">{success}</p>}
					{loading ? (
						<p className="text-muted-foreground">Loading...</p>
					) : settings.length === 0 ? (
						<p className="text-muted-foreground">No settings found.</p>
					) : (
						<div className="space-y-6">
							{settings.map(s => (
								<div key={s.id} className="grid gap-2">
									<Label htmlFor={s.key}>{s.key}</Label>
									<Input id={s.key} defaultValue={s.value} onBlur={(e) => saveSetting(s.key, e.target.value)} disabled={saving} />
									{s.description && <p className="text-xs text-muted-foreground">{s.description}</p>}
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
