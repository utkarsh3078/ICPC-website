"use client";

import { useEffect, useState, Fragment } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Users,
  Search,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Trophy,
  Medal,
  Phone,
  ExternalLink,
  User,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { getStudentsWithRanks, StudentWithRank } from "@/lib/alumniService";
import { CP_PLATFORMS } from "@/lib/profileService";

export default function AlumniDashboardPage() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => !!state.token);
  const hasHydrated = useAuthStore((state) => state._hasHydrated);
  const router = useRouter();

  const [students, setStudents] = useState<StudentWithRank[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"rank" | "name" | "points">("rank");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    if (hasHydrated && isAuthenticated && user?.role !== "ALUMNI") {
      router.push("/dashboard");
    }
  }, [isAuthenticated, hasHydrated, user, router]);

  useEffect(() => {
    if (hasHydrated && user?.role === "ALUMNI") {
      fetchStudents();
    }
  }, [hasHydrated, user]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const data = await getStudentsWithRanks();
      setStudents(data);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to fetch students"
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (studentId: string) => {
    setExpandedStudentId(expandedStudentId === studentId ? null : studentId);
  };

  const handleSort = (column: "rank" | "name" | "points") => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder(column === "rank" ? "asc" : "desc");
    }
  };

  // Filter and sort students
  const filteredStudents = students
    .filter((student) => {
      const query = searchQuery.toLowerCase();
      return (
        student.name.toLowerCase().includes(query) ||
        student.email.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "rank":
          comparison = a.rank - b.rank;
          break;
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "points":
          comparison = a.totalPoints - b.totalPoints;
          break;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <span className="text-yellow-400 text-lg">🥇</span>;
      case 2:
        return <span className="text-gray-300 text-lg">🥈</span>;
      case 3:
        return <span className="text-amber-600 text-lg">🥉</span>;
      default:
        return <span className="text-gray-500 font-mono">{rank}</span>;
    }
  };

  const getPlatformUrl = (platform: string, handle: string): string => {
    const urls: Record<string, string> = {
      leetcode: `https://leetcode.com/${handle}`,
      codeforces: `https://codeforces.com/profile/${handle}`,
      codechef: `https://www.codechef.com/users/${handle}`,
      atcoder: `https://atcoder.jp/users/${handle}`,
      hackerrank: `https://www.hackerrank.com/${handle}`,
      github: `https://github.com/${handle}`,
    };
    return urls[platform] || "#";
  };

  if (!hasHydrated || (isAuthenticated && user?.role !== "ALUMNI")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Users className="h-6 w-6" />
              Alumni Dashboard
            </h1>
            <p className="text-sm text-gray-400">
              View student rankings and profiles
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/profile")}
              className="gap-2"
            >
              <User className="h-4 w-4" />
              Edit Profile
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchStudents}
              className="gap-2"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <Users className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Total Students</p>
                  <p className="text-2xl font-bold">{students.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-500/20 rounded-lg">
                  <Trophy className="h-6 w-6 text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Top Scorer</p>
                  <p className="text-xl font-bold truncate">
                    {students[0]?.name || "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500/20 rounded-lg">
                  <Medal className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Total Points Earned</p>
                  <p className="text-2xl font-bold">
                    {students.reduce((sum, s) => sum + s.totalPoints, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Students Leaderboard */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-400" />
              Student Leaderboard
            </CardTitle>
            <CardDescription>
              View all students ranked by their total points from verified task submissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-gray-800 border-gray-700 pl-10"
              />
            </div>

            {/* Table */}
            <div className="bg-gray-800/50 rounded-lg border border-gray-700 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-800">
                  <tr>
                    <th
                      className="px-4 py-3 text-left text-sm font-medium text-gray-400 cursor-pointer hover:text-white"
                      onClick={() => handleSort("rank")}
                    >
                      <div className="flex items-center gap-1">
                        Rank
                        {sortBy === "rank" && (
                          sortOrder === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </th>
                    <th
                      className="px-4 py-3 text-left text-sm font-medium text-gray-400 cursor-pointer hover:text-white"
                      onClick={() => handleSort("name")}
                    >
                      <div className="flex items-center gap-1">
                        Name
                        {sortBy === "name" && (
                          sortOrder === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">
                      Branch
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">
                      Year
                    </th>
                    <th
                      className="px-4 py-3 text-left text-sm font-medium text-gray-400 cursor-pointer hover:text-white"
                      onClick={() => handleSort("points")}
                    >
                      <div className="flex items-center gap-1">
                        Points
                        {sortBy === "points" && (
                          sortOrder === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" />
                      </td>
                    </tr>
                  ) : filteredStudents.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-8 text-center text-gray-500"
                      >
                        {searchQuery ? "No students match your search" : "No students found"}
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((student) => (
                      <Fragment key={student.id}>
                        <tr
                          className={`hover:bg-gray-800/50 cursor-pointer ${
                            expandedStudentId === student.id ? "bg-gray-800/30" : ""
                          }`}
                          onClick={() => toggleExpand(student.id)}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center w-8">
                              {getRankIcon(student.rank)}
                            </div>
                          </td>
                          <td className="px-4 py-3 font-medium">{student.name}</td>
                          <td className="px-4 py-3 text-sm text-gray-400">
                            {student.email}
                          </td>
                          <td className="px-4 py-3 text-sm">{student.branch}</td>
                          <td className="px-4 py-3 text-sm">
                            {student.year > 0 ? `${student.year}${getYearSuffix(student.year)} Year` : "N/A"}
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-sm font-medium">
                              {student.totalPoints} pts
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleExpand(student.id);
                              }}
                            >
                              {expandedStudentId === student.id ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                          </td>
                        </tr>
                        {/* Expanded Details Row */}
                        {expandedStudentId === student.id && (
                          <tr className="bg-gray-800/20">
                            <td colSpan={7} className="px-4 py-4">
                              <div className="grid gap-4 md:grid-cols-2">
                                {/* Contact Info */}
                                <div className="space-y-2">
                                  <h4 className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                    <Phone className="h-4 w-4" />
                                    Contact Information
                                  </h4>
                                  <div className="bg-gray-800 rounded-lg p-3 space-y-2">
                                    <div className="flex items-center gap-2">
                                      <span className="text-gray-400 text-sm">Email:</span>
                                      <a
                                        href={`mailto:${student.email}`}
                                        className="text-blue-400 hover:underline text-sm"
                                      >
                                        {student.email}
                                      </a>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-gray-400 text-sm">Phone:</span>
                                      {student.contact ? (
                                        <a
                                          href={`tel:${student.contact}`}
                                          className="text-blue-400 hover:underline text-sm"
                                        >
                                          {student.contact}
                                        </a>
                                      ) : (
                                        <span className="text-gray-500 text-sm">Not provided</span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-gray-400 text-sm">Joined:</span>
                                      <span className="text-sm">
                                        {new Date(student.createdAt).toLocaleDateString()}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* CP Handles */}
                                <div className="space-y-2">
                                  <h4 className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                    <ExternalLink className="h-4 w-4" />
                                    Competitive Programming Handles
                                  </h4>
                                  <div className="bg-gray-800 rounded-lg p-3">
                                    {student.handles && Object.keys(student.handles).length > 0 ? (
                                      <div className="grid gap-2 grid-cols-2">
                                        {CP_PLATFORMS.map((platform) => {
                                          const handle = student.handles?.[platform.key];
                                          if (!handle) return null;
                                          return (
                                            <a
                                              key={platform.key}
                                              href={getPlatformUrl(platform.key, handle)}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="flex items-center gap-2 px-2 py-1.5 bg-gray-700/50 rounded hover:bg-gray-700 transition-colors"
                                            >
                                              <span className="text-xs text-gray-400">
                                                {platform.label}:
                                              </span>
                                              <span className="text-sm text-blue-400 truncate">
                                                {handle}
                                              </span>
                                              <ExternalLink className="h-3 w-3 text-gray-500 flex-shrink-0" />
                                            </a>
                                          );
                                        })}
                                      </div>
                                    ) : (
                                      <p className="text-gray-500 text-sm">No handles provided</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Results count */}
            {!loading && filteredStudents.length > 0 && (
              <p className="mt-3 text-sm text-gray-500">
                Showing {filteredStudents.length} of {students.length} students
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

// Helper function for year suffix
function getYearSuffix(year: number): string {
  if (year === 1) return "st";
  if (year === 2) return "nd";
  if (year === 3) return "rd";
  return "th";
}
