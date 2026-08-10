import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

// Was a dialog with a fake, uncontrolled form whose submit handler did
// nothing but close itself - no error, dialog just closes, looking exactly
// like a success. Real school creation collects far more required fields
// than a quick-add form reasonably could (ownershipType, educationLevel,
// region/district/town/address, a primary admin account, etc.), and the
// canonical creation path (app/signup/school's full wizard) already exists
// and is real. Rather than build a second, smaller creation flow or dress
// the fake one up with a disclaimer, this just links straight to the real
// one - found by a dead-UI-elements audit 2026-08-08, see docs/build-log.md.
export function AddSchoolDialog() {
  return (
    <Button asChild>
      <Link href="/signup/school">
        <Plus className="mr-2 h-4 w-4" />
        Add School
      </Link>
    </Button>
  )
}
