"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/LoadingState";

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: number; email: string; name: string } | null>(null);
  const [hasToneProfile, setHasToneProfile] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkSession() {
      try {
        const authRes = await fetch("/api/auth/me");
        if (authRes.ok) {
          const authData = await authRes.json();
          setUser(authData.user);

          // Check tone profile status
          const toneRes = await fetch("/api/tone/status");
          if (toneRes.ok) {
            const toneData = await toneRes.json();
            setHasToneProfile(!!toneData.trainedAt);
          }
        }
      } catch {
        // Not logged in or error
      } finally {
        setLoading(false);
      }
    }
    checkSession();
  }, []);

  const handlePrimaryCTA = () => {
    if (!user) {
      router.push("/login");
    } else if (!hasToneProfile) {
      router.push("/train");
    } else {
      router.push("/generate");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingState />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <CardTitle>AI 블로그 작성 도우미</CardTitle>
          <CardDescription>
            당신의 말투를 학습해 맛집, 테크, 일상 등 다양한 주제의 블로그 글을 자동으로 생성하는 개인용 웹앱
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handlePrimaryCTA} size="lg" className="w-full">
            {!user ? "시작하기" : !hasToneProfile ? "말투 학습하기" : "블로그 생성하기"}
          </Button>

          {user && (
            <div className="flex gap-3">
              <Link href="/train" className="flex-1">
                <Button variant="secondary" size="default" className="w-full">
                  말투 학습
                </Button>
              </Link>
              <Link href="/history" className="flex-1">
                <Button variant="secondary" size="default" className="w-full">
                  작성 기록
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {!user && (
        <p className="text-xs text-[var(--text-muted)]">
          이미 계정이 있으신가요?{" "}
          <Link href="/login" className="text-[var(--accent)]">
            로그인
          </Link>
        </p>
      )}
    </div>
  );
}
