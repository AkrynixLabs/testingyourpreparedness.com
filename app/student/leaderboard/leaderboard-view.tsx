"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trophy, Medal, Crown, Award } from "lucide-react"
import { cn } from "@/lib/utils"
import type { LeaderboardResult, LeaderboardEntry } from "@/lib/student/leaderboard"

const initials = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) return <Crown className="h-5 w-5 text-yellow-500" />
  if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />
  if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />
  return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>
}

function OwnRankCard({ result, scope }: { result: LeaderboardResult; scope: string }) {
  if (!result.ownRank) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            Complete an exam to appear on the {scope} leaderboard.
          </p>
        </CardContent>
      </Card>
    )
  }
  const { rank, totalStudents, entry } = result.ownRank
  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardContent className="pt-6 flex items-center gap-4">
        <div className="w-10 flex justify-center">
          <RankIcon rank={rank} />
        </div>
        <Avatar className="h-10 w-10">
          <AvatarFallback>{initials(entry.name)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-semibold">Your rank</p>
          <p className="text-sm text-muted-foreground">
            #{rank} of {totalStudents} on the {scope} leaderboard
          </p>
        </div>
        <p className="text-2xl font-bold text-primary">{entry.avgScore}%</p>
      </CardContent>
    </Card>
  )
}

function LeaderboardTable({ result, showSchool }: { result: LeaderboardResult; showSchool: boolean }) {
  if (result.entries.length === 0) {
    return <p className="text-sm text-muted-foreground py-8 text-center">No ranked learners yet.</p>
  }
  const ownId = result.ownRank?.entry.studentId
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[60px]">Rank</TableHead>
          <TableHead>Learner</TableHead>
          {showSchool && <TableHead>School</TableHead>}
          <TableHead className="text-right">Exams</TableHead>
          <TableHead className="text-right">Badges</TableHead>
          <TableHead className="text-right">Score</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {result.entries.map((entry: LeaderboardEntry, i: number) => (
          <TableRow key={entry.studentId} className={cn(entry.studentId === ownId && "bg-primary/5")}>
            <TableCell>
              <div className="flex items-center justify-center">
                <RankIcon rank={i + 1} />
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">{initials(entry.name)}</AvatarFallback>
                </Avatar>
                <span className="font-medium">{entry.name}</span>
                {entry.studentId === ownId && (
                  <Badge variant="secondary" className="text-xs">
                    You
                  </Badge>
                )}
              </div>
            </TableCell>
            {showSchool && (
              <TableCell className="text-muted-foreground">{entry.schoolName ?? "Independent"}</TableCell>
            )}
            <TableCell className="text-right">{entry.examCount}</TableCell>
            <TableCell className="text-right">
              <div className="flex items-center justify-end gap-1">
                <Award className="h-3 w-3 text-amber-500" />
                {entry.badgeCount}
              </div>
            </TableCell>
            <TableCell className="text-right">
              <span
                className={cn(
                  "font-bold",
                  entry.avgScore >= 85 ? "text-emerald-600" : entry.avgScore >= 75 ? "text-amber-600" : ""
                )}
              >
                {entry.avgScore}%
              </span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export function LeaderboardView({
  national,
  classBoard,
  className,
}: {
  national: LeaderboardResult
  classBoard: LeaderboardResult | null
  className: string | null
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Leaderboard</h1>
        <p className="text-muted-foreground">See how you stack up against other learners</p>
      </div>

      <Tabs defaultValue={classBoard ? "class" : "national"} className="space-y-6">
        <TabsList>
          {classBoard && <TabsTrigger value="class">My Class</TabsTrigger>}
          <TabsTrigger value="national">National</TabsTrigger>
        </TabsList>

        {classBoard && (
          <TabsContent value="class" className="space-y-6">
            <OwnRankCard result={classBoard} scope={className ?? "class"} />
            <Card>
              <CardHeader>
                <CardTitle>{className ?? "Your Class"}</CardTitle>
                <CardDescription>Ranked by average exam score</CardDescription>
              </CardHeader>
              <CardContent>
                <LeaderboardTable result={classBoard} showSchool={false} />
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="national" className="space-y-6">
          <OwnRankCard result={national} scope="national" />
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-500" />
                Top Students Nationally
              </CardTitle>
              <CardDescription>Ranked by average exam score across every subject and program</CardDescription>
            </CardHeader>
            <CardContent>
              <LeaderboardTable result={national} showSchool />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
