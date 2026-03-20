import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  change?: number
  changeLabel?: string
  icon?: React.ComponentType<{ className?: string }>
  className?: string
}

export function StatCard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  className,
}: StatCardProps) {
  return (
    <Card className={cn("border-border/50", className)}>
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs sm:text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-xl sm:text-2xl font-bold tracking-tight">{value}</p>
          </div>
          {Icon && typeof Icon === 'function' && (
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
          )}
        </div>
        {change !== undefined && (
          <div className="mt-3 sm:mt-4 flex flex-wrap items-center gap-1 sm:gap-2">
            {change >= 0 ? (
              <div className="flex items-center text-xs sm:text-sm text-emerald-600">
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                +{change}%
              </div>
            ) : (
              <div className="flex items-center text-xs sm:text-sm text-red-600">
                <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                {change}%
              </div>
            )}
            {changeLabel && (
              <span className="text-xs sm:text-sm text-muted-foreground">{changeLabel}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
