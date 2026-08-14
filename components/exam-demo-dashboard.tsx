"use client"

import { useEffect, useState } from "react"
import { Clock, CheckCircle2, ChevronLeft, ChevronRight, Menu, Wifi, BatteryFull } from "lucide-react"

const demos = [
  {
    subject: "WASSCE Geography",
    year: "2019",
    index: 12,
    total: 50,
    timeLeft: "00:45:15",
    text: "The climatic data above can best be represented by",
    options: ["Divided circles", "Choropleth maps", "Flow line maps", "Bar and line graphs"],
    correctAnswer: 2,
    navigator: Array.from({ length: 25 }, (_, i) => {
      if (i + 1 === 12) return "current"
      if ([3, 7, 9, 11, 13, 15].includes(i + 1)) return "flagged"
      if (i < 20) return "answered"
      return "unanswered"
    }),
  },
  {
    subject: "BECE Mathematics",
    year: "2023",
    index: 8,
    total: 40,
    timeLeft: "00:32:40",
    text: "Simplify: 3x + 2y − x + 4y",
    options: ["2x + 6y", "4x + 6y", "2x + 2y", "4x + 2y"],
    correctAnswer: 0,
    navigator: Array.from({ length: 25 }, (_, i) => {
      if (i + 1 === 8) return "current"
      if ([2, 4, 6, 14].includes(i + 1)) return "flagged"
      if (i < 15) return "answered"
      return "unanswered"
    }),
  },
  {
    subject: "WASSCE English",
    year: "2021",
    index: 24,
    total: 80,
    timeLeft: "01:02:08",
    text: "Choose the option nearest in meaning to the underlined word: the crowd's mood was decidedly hostile.",
    options: ["Friendly", "Antagonistic", "Indifferent", "Curious"],
    correctAnswer: 1,
    navigator: Array.from({ length: 25 }, (_, i) => {
      if (i + 1 === 24) return "current"
      if ([5, 10, 18].includes(i + 1)) return "flagged"
      if (i < 22) return "answered"
      return "unanswered"
    }),
  },
]

const navigatorStyles: Record<string, string> = {
  current: "bg-primary text-primary-foreground border-primary",
  answered: "border-primary/40 bg-primary/10 text-primary",
  flagged: "border-chart-4/50 bg-chart-4/10 text-chart-4",
  unanswered: "border-border text-muted-foreground",
}

export function ExamDemoDashboard() {
  const [active, setActive] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    const rotate = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setActive((prev) => (prev + 1) % demos.length)
        setVisible(true)
      }, 350)
    }, 6000)

    return () => clearInterval(rotate)
  }, [])

  const demo = demos[active]

  return (
    <div className="relative mx-auto max-w-4xl">
      {/* Browser window frame */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-black/15">
        {/* Title bar */}
        <div className="flex items-center gap-3 border-b border-border bg-muted/50 px-4 py-2.5">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          </div>
          <div className="mx-auto flex w-64 items-center justify-center rounded-md bg-background px-3 py-1 text-xs text-muted-foreground">
            <span className="truncate">testingyourpreparedness.com/dashboard</span>
          </div>
        </div>

        {/* App content */}
        <div
          className={`flex transition-opacity duration-350 ${visible ? "opacity-100" : "opacity-0"}`}
        >
          {/* Sidebar */}
          <div className="hidden sm:flex w-40 md:w-48 shrink-0 flex-col gap-4 border-r border-border bg-muted/20 p-4">
            <div className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-2.5 py-1.5 text-primary">
              <Clock className="h-3.5 w-3.5" />
              <span className="font-mono text-xs font-bold">{demo.timeLeft}</span>
            </div>
            <p className="text-xs font-semibold text-muted-foreground">Questions</p>
            <div className="grid grid-cols-5 gap-1.5">
              {demo.navigator.map((state, i) => (
                <div
                  key={i}
                  className={`flex h-6 w-6 items-center justify-center rounded-md border text-[10px] font-medium ${navigatorStyles[state]}`}
                >
                  {i + 1}
                </div>
              ))}
            </div>
          </div>

          {/* Main question area */}
          <div className="flex-1 min-w-0 p-4 md:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-1 rounded-md bg-secondary text-secondary-foreground">
                  {demo.subject}
                </span>
                <span className="text-xs text-muted-foreground hidden md:inline">{demo.year}</span>
              </div>
              <span className="text-xs text-muted-foreground">
                Question {demo.index} of {demo.total}
              </span>
            </div>

            <p className="text-sm md:text-base font-semibold leading-relaxed text-balance">{demo.text}</p>

            <div className="space-y-2">
              {demo.options.map((option, i) => {
                const isCorrect = i === demo.correctAnswer
                return (
                  <div
                    key={option}
                    className={`flex items-center gap-3 rounded-lg border p-2.5 text-xs md:text-sm transition-colors ${
                      isCorrect ? "border-primary bg-primary/10" : "border-border"
                    }`}
                  >
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold ${
                        isCorrect ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/30"
                      }`}
                    >
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="flex-1">{option}</span>
                    {isCorrect && <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />}
                  </div>
                )
              })}
            </div>

            <div className="flex items-center justify-between pt-1">
              <button className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs text-muted-foreground">
                <ChevronLeft className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Previous</span>
              </button>
              <button className="flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1.5 text-xs text-primary-foreground">
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Overlapping phone mockup */}
      <div className="hidden lg:block absolute -bottom-6 -right-6 w-40 animate-float-delayed">
        <div className="overflow-hidden rounded-[1.75rem] border-4 border-foreground/90 bg-card shadow-2xl shadow-black/20">
          <div className="flex items-center justify-between bg-foreground/90 px-3 py-1 text-[9px] text-background">
            <span>9:41</span>
            <div className="flex items-center gap-1">
              <Wifi className="h-2.5 w-2.5" />
              <BatteryFull className="h-3 w-3" />
            </div>
          </div>
          <div
            className={`space-y-2.5 p-3 transition-opacity duration-350 ${visible ? "opacity-100" : "opacity-0"}`}
          >
            <div className="flex items-center justify-between">
              <Menu className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-[9px] text-muted-foreground">
                {demo.index}/{demo.total}
              </span>
            </div>
            <p className="text-[9px] font-semibold leading-snug line-clamp-3">{demo.text}</p>
            <div className="space-y-1.5">
              {demo.options.slice(0, 3).map((option, i) => (
                <div key={option} className="rounded-md border border-border px-2 py-1 text-[8px]">
                  {String.fromCharCode(65 + i)}. {option}
                </div>
              ))}
            </div>
            <div className="rounded-md bg-primary py-1 text-center text-[8px] font-medium text-primary-foreground">
              Submit Exam
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
