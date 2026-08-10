import { Card, CardContent } from "@/components/ui/card"
import { Construction } from "lucide-react"

// Shared by every "not built yet" public marketing page (about, features,
// help, cookies) - same honest "don't pretend this is finished" framing as
// the /terms and /privacy placeholders, but lighter tone since these are
// informational pages, not legal-review-gated ones.
export function ComingSoonNotice({ children }: { children: React.ReactNode }) {
  return (
    <Card className="mb-8 border-border bg-muted/30">
      <CardContent className="pt-6 flex gap-3">
        <Construction className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
        <div className="text-sm text-muted-foreground">
          <p className="font-medium text-foreground mb-1">This page is still being built.</p>
          <p>{children}</p>
        </div>
      </CardContent>
    </Card>
  )
}
