"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getSessions,
  registerForSession,
  getSessionStatus,
  Session,
  SessionStatus,
} from "@/lib/sessionService";
import {
  ArrowLeft,
  Calendar,
  Clock,
  ExternalLink,
  Users,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";

const statusConfig: Record<
  SessionStatus,
  { label: string; className: string }
> = {
  upcoming: {
    label: "Upcoming",
    className: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  },
  live: {
    label: "Live Now",
    className: "bg-green-500/20 text-green-400 border-green-500/30 animate-pulse",
  },
  ended: {
    label: "Ended",
    className: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  },
};

function formatDate(dateString: string | null): string {
  if (!dateString) return "Date TBA";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(dateString: string | null): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

interface SessionCardProps {
  session: Session;
  userId: string | undefined;
  onRegister: (sessionId: string) => Promise<void>;
  registering: string | null;
}

function SessionCard({ session, userId, onRegister, registering }: SessionCardProps) {
  const status = getSessionStatus(session);
  const config = statusConfig[status];
  const isRegistered = userId && session.attendees?.includes(userId);
  const isRegistering = registering === session.id;

  const handleJoin = () => {
    window.open(session.meetLink, "_blank", "noopener,noreferrer");
  };

  return (
    <Card
      className={`bg-card border-border flex flex-col ${
        status === "ended" ? "opacity-70" : ""
      }`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg text-card-foreground line-clamp-1">
            {session.title}
          </CardTitle>
          <span
            className={`text-xs px-2 py-1 rounded-full border whitespace-nowrap ${config.className}`}
          >
            {config.label}
          </span>
        </div>
        {session.details && (
          <CardDescription className="text-muted-foreground line-clamp-2 mt-1">
            {session.details}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="flex-1 space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{formatDate(session.date)}</span>
        </div>
        {session.date && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{formatTime(session.date)}</span>
          </div>
        )}
        {session.attendees && session.attendees.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{session.attendees.length} registered</span>
          </div>
        )}
        {status === "ended" && session.summary && (
          <div className="mt-3 p-3 bg-muted/50 rounded-md">
            <p className="text-xs text-muted-foreground font-medium mb-1">
              Summary
            </p>
            <p className="text-sm text-foreground line-clamp-3">
              {session.summary}
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-3">
        {status === "live" && (
          <Button onClick={handleJoin} className="w-full gap-2">
            <ExternalLink className="h-4 w-4" />
            Join Meeting
          </Button>
        )}
        {status === "upcoming" && (
          <>
            {isRegistered ? (
              <Button variant="secondary" className="w-full gap-2" disabled>
                <CheckCircle className="h-4 w-4" />
                Registered
              </Button>
            ) : (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => onRegister(session.id)}
                disabled={isRegistering}
              >
                {isRegistering ? "Registering..." : "Register"}
              </Button>
            )}
          </>
        )}
        {status === "ended" && (
          <p className="text-sm text-muted-foreground w-full text-center">
            This session has ended
          </p>
        )}
      </CardFooter>
    </Card>
  );
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [registering, setRegistering] = useState<string | null>(null);

  const { user, token } = useAuthStore();
  const isAuthenticated = !!token;
  const hasHydrated = useAuthStore((state) => state._hasHydrated);
  const router = useRouter();

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, hasHydrated, router]);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setError(null);
        const data = await getSessions();
        setSessions(data);
      } catch (err: any) {
        console.error("Error fetching sessions:", err);
        setError(err.response?.data?.error || "Failed to load sessions");
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchSessions();
    }
  }, [isAuthenticated]);

  const handleRegister = async (sessionId: string) => {
    if (!isAuthenticated) {
      toast.error("Please log in to register for sessions");
      return;
    }

    setRegistering(sessionId);
    try {
      const updatedSession = await registerForSession(sessionId);
      setSessions((prev) =>
        prev.map((s) => (s.id === sessionId ? updatedSession : s))
      );
      toast.success("Successfully registered for session!");
    } catch (err: any) {
      console.error("Error registering for session:", err);
      toast.error(err.response?.data?.error || "Failed to register");
    } finally {
      setRegistering(null);
    }
  };

  // Separate sessions into upcoming/live and past
  const upcomingSessions = sessions
    .filter((s) => {
      const status = getSessionStatus(s);
      return status === "upcoming" || status === "live";
    })
    .sort((a, b) => {
      // Sort by date, with null dates (TBA) at the end
      if (!a.date) return 1;
      if (!b.date) return -1;
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

  const pastSessions = sessions
    .filter((s) => getSessionStatus(s) === "ended")
    .sort((a, b) => {
      // Sort by date descending (most recent first)
      if (!a.date) return 1;
      if (!b.date) return -1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

  if (!hasHydrated || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
        <div className="animate-pulse text-xl">Loading Sessions...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-primary">
              Sessions
            </h1>
            <p className="text-muted-foreground mt-2">
              Join live sessions or register for upcoming ones.
            </p>
          </div>
          <Link href="/dashboard">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Empty State */}
        {sessions.length === 0 && !error && (
          <Card className="bg-card border-border">
            <CardContent className="py-12 text-center">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No sessions available
              </h3>
              <p className="text-muted-foreground">
                Check back later for upcoming sessions.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Upcoming Sessions */}
        {upcomingSessions.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Upcoming Sessions
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {upcomingSessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  userId={user.id}
                  onRegister={handleRegister}
                  registering={registering}
                />
              ))}
            </div>
          </section>
        )}

        {/* No Upcoming Sessions Message */}
        {upcomingSessions.length === 0 && pastSessions.length > 0 && (
          <div className="text-center py-8 border border-border rounded-lg bg-card">
            <p className="text-muted-foreground">No upcoming sessions</p>
          </div>
        )}

        {/* Divider */}
        {upcomingSessions.length > 0 && pastSessions.length > 0 && (
          <hr className="border-border" />
        )}

        {/* Past Sessions */}
        {pastSessions.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Past Sessions
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {pastSessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  userId={user.id}
                  onRegister={handleRegister}
                  registering={registering}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
