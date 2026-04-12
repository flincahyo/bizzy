import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function WarehousesLoading() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-10 w-36 rounded-xl" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 border-t border-border/40 pt-4 mt-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="border-border/60">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2">
                <Skeleton className="h-4 w-4 shrink-0 rounded-full mt-0.5" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <Skeleton className="h-4 w-4 shrink-0 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="flex gap-2 pt-3">
                <Skeleton className="h-8 flex-1 rounded-lg" />
                <Skeleton className="h-8 flex-1 rounded-lg" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
