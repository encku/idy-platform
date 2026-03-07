import { Skeleton } from "@/components/ui/skeleton"

export default function CardLoading() {
  return (
    <div className="mx-auto max-w-md min-h-svh bg-muted/30">
      <div className="flex flex-col items-center pt-16 px-5 space-y-4">
        <Skeleton className="size-36 rounded-full" />
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-40" />
        <div className="w-full space-y-3 pt-6">
          <Skeleton className="h-14 w-full rounded-2xl" />
          <Skeleton className="h-14 w-full rounded-2xl" />
          <Skeleton className="h-14 w-full rounded-2xl" />
          <Skeleton className="h-14 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  )
}
