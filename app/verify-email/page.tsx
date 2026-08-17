import { VerifyEmailAction } from "./verify-email-action"

export default async function VerifyEmailPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <VerifyEmailAction token={token ?? ""} />
    </div>
  )
}
