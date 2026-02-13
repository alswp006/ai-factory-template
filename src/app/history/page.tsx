"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function HistoryPage() {
  const router = useRouter();

  useEffect(() => {
    // Check auth and redirect if needed
    fetch("/api/auth/me")
      .then((r) => {
        if (!r.ok) {
          router.push("/login?redirect=/history");
        }
      })
      .catch(() => {
        router.push("/login?redirect=/history");
      });
  }, [router]);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold">Content History</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          View and manage your generated content
        </p>
      </div>

      <Card className="p-6">
        <CardHeader>
          <CardTitle>No Content Yet</CardTitle>
          <CardDescription>Your generated content will appear here.</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
