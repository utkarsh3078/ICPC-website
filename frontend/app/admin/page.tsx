"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/lib/axios";
import { ArrowLeft, Plus, Calendar, Trophy, CheckSquare } from "lucide-react";

export default function AdminDashboardPage() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => !!state.token);
  const hasHydrated = useAuthStore((state) => state._hasHydrated);
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"contests" | "sessions" | "tasks">("contests");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Data states
  const [contestsList, setContestsList] = useState<{ id: string; title: string }[]>([]);

  // Form states
  const [contestTitle, setContestTitle] = useState("");
  const [sessionTitle, setSessionTitle] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [taskPoints, setTaskPoints] = useState(0);

  // Add Problem states
  const [selectedContestId, setSelectedContestId] = useState("");
  const [problemName, setProblemName] = useState("");
  const [problemLink, setProblemLink] = useState("");

  useEffect(() => {
    if (hasHydrated) {
      if (!isAuthenticated) {
        router.push("/login");
      } else if (user?.role !== "ADMIN") {
        router.push("/dashboard");
      } else {
        fetchContests();
      }
    }
  }, [isAuthenticated, hasHydrated, user, router]);

  const fetchContests = async () => {
    try {
      const res = await api.get("/contests");
      setContestsList(res.data.data);
    } catch (error) {
      console.error("Error fetching contests", error);
    }
  };

  if (!hasHydrated || !user || user.role !== "ADMIN") {
    return null;
  }

  const handleCreateContest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      await api.post("/contests", { title: contestTitle });
      setMessage("Contest created successfully!");
      setContestTitle("");
      fetchContests(); // Refresh list
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Error creating contest");
    } finally {
      setLoading(false);
    }
  };

  const handleAddProblem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContestId) {
      setMessage("Please select a contest");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      await api.post(`/contests/${selectedContestId}/problems`, {
        name: problemName,
        link: problemLink,
      });
      setMessage("Problem added successfully!");
      setProblemName("");
      setProblemLink("");
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Error adding problem");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      await api.post("/sessions", { title: sessionTitle });
      setMessage("Session created successfully!");
      setSessionTitle("");
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Error creating session");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      await api.post("/tasks", { title: taskTitle, description: taskDesc, points: Number(taskPoints) });
      setMessage("Task created successfully!");
      setTaskTitle("");
      setTaskDesc("");
      setTaskPoints(0);
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Error creating task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-bold text-primary">Admin Dashboard</h1>
          </div>
        </div>

        <div className="flex gap-4 border-b border-border pb-4">
          <Button
            variant={activeTab === "contests" ? "default" : "ghost"}
            onClick={() => setActiveTab("contests")}
            className="gap-2"
          >
            <Trophy className="h-4 w-4" /> Contests
          </Button>
          <Button
            variant={activeTab === "sessions" ? "default" : "ghost"}
            onClick={() => setActiveTab("sessions")}
            className="gap-2"
          >
            <Calendar className="h-4 w-4" /> Sessions
          </Button>
          <Button
            variant={activeTab === "tasks" ? "default" : "ghost"}
            onClick={() => setActiveTab("tasks")}
            className="gap-2"
          >
            <CheckSquare className="h-4 w-4" /> Tasks
          </Button>
        </div>

        {message && (
          <div className={`p-4 rounded-md ${message.includes("Error") ? "bg-destructive/20 text-destructive" : "bg-green-500/20 text-green-500"}`}>
            {message}
          </div>
        )}

        {activeTab === "contests" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Create New Contest</CardTitle>
                <CardDescription>Set up a new competitive programming contest.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateContest} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="contest-title">Contest Title</Label>
                    <Input
                      id="contest-title"
                      placeholder="e.g. Weekly Contest #45"
                      value={contestTitle}
                      onChange={(e) => setContestTitle(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Creating..." : "Create Contest"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Add Problem to Contest</CardTitle>
                <CardDescription>Add a problem to an existing contest.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddProblem} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="contest-select">Select Contest</Label>
                    <select
                      id="contest-select"
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={selectedContestId}
                      onChange={(e) => setSelectedContestId(e.target.value)}
                      required
                    >
                      <option value="" disabled>Select a contest</option>
                      {contestsList.map((c) => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="problem-name">Problem Name</Label>
                    <Input
                      id="problem-name"
                      placeholder="e.g. Two Sum"
                      value={problemName}
                      onChange={(e) => setProblemName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="problem-link">Problem Link</Label>
                    <Input
                      id="problem-link"
                      placeholder="e.g. https://leetcode.com/problems/two-sum"
                      value={problemLink}
                      onChange={(e) => setProblemLink(e.target.value)}
                    />
                  </div>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Adding..." : "Add Problem"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "sessions" && (
          <Card>
            <CardHeader>
              <CardTitle>Create New Session</CardTitle>
              <CardDescription>Schedule a new learning session or workshop.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateSession} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="session-title">Session Title</Label>
                  <Input
                    id="session-title"
                    placeholder="e.g. Intro to Dynamic Programming"
                    value={sessionTitle}
                    onChange={(e) => setSessionTitle(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create Session"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {activeTab === "tasks" && (
          <Card>
            <CardHeader>
              <CardTitle>Create New Task</CardTitle>
              <CardDescription>Assign a new task to students.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateTask} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="task-title">Task Title</Label>
                  <Input
                    id="task-title"
                    placeholder="e.g. Solve 5 DP problems"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="task-desc">Description</Label>
                  <Input
                    id="task-desc"
                    placeholder="Details about the task..."
                    value={taskDesc}
                    onChange={(e) => setTaskDesc(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="task-points">Points</Label>
                  <Input
                    id="task-points"
                    type="number"
                    placeholder="100"
                    value={taskPoints}
                    onChange={(e) => setTaskPoints(Number(e.target.value))}
                    required
                  />
                </div>
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create Task"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
