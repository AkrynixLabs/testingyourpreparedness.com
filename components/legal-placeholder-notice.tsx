import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"

// Shared by /terms, /privacy, and /cookies - legal-adjacent placeholder
// pages, distinct from the lighter ComingSoonNotice used for pure marketing
// pages (about/features/help). The framing matters: this is explicit that
// nothing here is a binding agreement yet, not just "under construction."
export function LegalPlaceholderNotice({
  policyName,
  notBindingClause,
}: {
  policyName: string
  // e.g. "a binding agreement" (terms), "a binding description of our
  // actual data practices" (privacy) - kept as an explicit prop rather than
  // derived from policyName, since trying to generate three grammatically
  // different sentences from one string got awkward fast.
  notBindingClause: string
}) {
  return (
    <Card className="mb-8 border-amber-500/30 bg-amber-500/5">
      <CardContent className="pt-6 flex gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-sm text-muted-foreground">
          <p className="font-medium text-foreground mb-1">This page is a placeholder.</p>
          <p>
            TYP&apos;s real {policyName} is still pending legal review and has not been finalized or published yet.
            Nothing on this page should be treated as {notBindingClause}. If you have questions, please{" "}
            <a href="/contact" className="text-primary hover:underline">
              contact us
            </a>{" "}
            directly.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
