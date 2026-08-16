"use client"

import { type ReactNode, useState, useTransition } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"

interface ConfirmDialogProps {
  /** Element that opens the dialog when clicked. Omit for a fully controlled dialog (pair with `open`/`onOpenChange`). */
  trigger?: ReactNode
  title: string
  description: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  /** "destructive" styles the confirm button red - use for logout, delete, and other hard-to-undo actions. */
  variant?: "default" | "destructive"
  onConfirm: () => void | Promise<void>
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

/**
 * Shared confirmation dialog for logout, delete, and other actions that
 * shouldn't fire on a single accidental click. Wraps the existing
 * AlertDialog primitive so every confirmation in the app looks and behaves
 * the same way instead of each page hand-rolling its own.
 */
export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  onConfirm,
  open: openProp,
  onOpenChange: onOpenChangeProp,
}: ConfirmDialogProps) {
  const [isPending, startTransition] = useTransition()
  const [openState, setOpenState] = useState(false)

  const open = openProp ?? openState
  const setOpen = onOpenChangeProp ?? setOpenState

  const handleConfirm = () => {
    startTransition(async () => {
      await onConfirm()
      setOpen(false)
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      {trigger && <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              handleConfirm()
            }}
            disabled={isPending}
            className={cn(
              variant === "destructive" && "bg-destructive text-destructive-foreground hover:bg-destructive/90",
            )}
          >
            {isPending ? "Please wait..." : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
