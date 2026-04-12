import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function PosLoading() {
  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-8rem)]">
      {/* Main Content Area */}
      <div className="flex-1 space-y-4 overflow-hidden flex flex-col">
        {/* Search & Filter Header */}
        <div className="flex items-center gap-3 shrink-0 bg-background/50 p-2 rounded-xl border border-border/40">
          <Skeleton className="h-10 w-full md:w-64 rounded-lg" />
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar flex-1">
            <Skeleton className="h-9 w-24 shrink-0 rounded-lg" />
            <Skeleton className="h-9 w-20 shrink-0 rounded-lg" />
            <Skeleton className="h-9 w-28 shrink-0 rounded-lg" />
            <Skeleton className="h-9 w-24 shrink-0 rounded-lg" />
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-auto pr-2 pb-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <Card key={i} className="border-border/40 overflow-hidden">
                <Skeleton className="h-32 w-full rounded-none" />
                <CardContent className="p-3 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <div className="pt-2 flex justify-between items-center">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-6 w-6 rounded-md" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Cart Panel Sidebar */}
      <Card className="w-full lg:w-96 flex flex-col border-border/60 shrink-0 h-full">
        <div className="p-4 border-b border-border/40 shrink-0">
          <div className="flex justify-between items-center mb-4">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-5 w-8 rounded-full" />
          </div>
          <Skeleton className="h-9 w-full rounded-lg" />
        </div>
        
        <div className="flex-1 overflow-auto p-4 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-3 items-start border-b border-border/20 pb-3">
              <Skeleton className="h-12 w-12 rounded-lg shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-6 w-20 rounded-md" />
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-border/40 shrink-0 bg-muted/20">
          <div className="space-y-2 mb-4">
            <div className="flex gap-2">
              <Skeleton className="h-10 flex-1 rounded-lg" />
              <Skeleton className="h-10 flex-1 rounded-lg" />
            </div>
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
          <div className="space-y-1.5 mb-4">
            <div className="flex justify-between">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-20" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-3 w-16" />
            </div>
            <div className="flex justify-between pt-2 border-t border-border/40">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-24" />
            </div>
          </div>
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </Card>
    </div>
  );
}
