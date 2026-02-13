import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default async function GeneratePage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold">Generate Content</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Create blog posts in your unique writing style
        </p>
      </div>

      <Card className="p-6">
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>Content generation feature will be available here.</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
