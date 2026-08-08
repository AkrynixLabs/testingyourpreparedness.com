import { prisma } from "@/lib/prisma"

// PlatformSettings is a singleton row (id fixed to "default"). Upserting on
// read means no seed/migration data script has to remember to create it -
// the first read (or the first admin edit) creates it with the schema's
// default (15), matching what was previously a hardcoded constant.
export async function getPlatformFeePercent(): Promise<number> {
  const settings = await prisma.platformSettings.upsert({
    where: { id: "default" },
    create: { id: "default" },
    update: {},
  })
  return settings.platformFeePercent
}
