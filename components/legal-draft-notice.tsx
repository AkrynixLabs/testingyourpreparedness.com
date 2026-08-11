import { Card, CardContent } from "@/components/ui/card"
import { FileText } from "lucide-react"

// Shared by /terms and /privacy now that both carry real, product-accurate
// drafted content (no longer the "nothing here yet" LegalPlaceholderNotice,
// which /cookies still uses). The framing here is different on purpose:
// this text was drafted from the real schema/product behavior, but it is a
// first draft for the user/their counsel to review, not lawyer-finalized or
// binding yet - don't collapse this back into LegalPlaceholderNotice's
// "not written yet" framing, and don't drop the notice once it feels done.
export function LegalDraftNotice({ policyName }: { policyName: string }) {
  return (
    <Card className="mb-8 border-amber-500/30 bg-amber-500/5">
      <CardContent className="pt-6 flex gap-3">
        <FileText className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-sm text-muted-foreground">
          <p className="font-medium text-foreground mb-1">Draft — pending legal review.</p>
          <p>
            This {policyName} was drafted to accurately describe how TYP actually works today, but it has not yet
            been reviewed by a lawyer and is not final. Do not rely on it as a finalized legal document until this
            notice is removed. Questions in the meantime? {" "}
            <a href="/contact" className="text-primary hover:underline">
              Contact us
            </a>
            .
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
