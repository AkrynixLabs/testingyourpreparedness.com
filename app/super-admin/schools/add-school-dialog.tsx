import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

// Was a dialog with a fake, uncontrolled form whose submit handler did
// nothing but close itself - no error, dialog just closes, looking exactly
// like a success. Fixed 2026-08-08 by linking out to the real public
// self-signup wizard (app/signup/school) instead of building a second
// creation flow - but that wizard is meant for a school signing *itself*
// up (plan selection/checkout, lands in the same "pending verification"
// queue), which is the wrong shape for a super admin creating a school
// directly on someone's behalf. Fixed for real 2026-08-16: now links to a
// dedicated, super-admin-privileged creation page
// (app/super-admin/schools/add) that skips the billing step and activates
// the school immediately - see that page for the full reasoning.
export function AddSchoolDialog() {
  return (
    <Button asChild>
      <Link href="/super-admin/schools/add">
        <Plus className="mr-2 h-4 w-4" />
        Add School
      </Link>
    </Button>
  )
}
