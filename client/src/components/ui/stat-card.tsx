import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  iconBgColor?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  iconBgColor = "bg-primary/10",
  className,
}: StatCardProps) {
  const changeColorMap = {
    positive: "text-accent",
    negative: "text-destructive", 
    neutral: "text-muted-foreground",
  };

  return (
    <Card className={cn("border card-hover", className)} data-testid={`stat-card-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground text-sm font-medium">{title}</p>
            <p className="text-2xl font-bold text-foreground mt-2">{value}</p>
            {change && (
              <p className={cn("text-sm mt-1", changeColorMap[changeType])}>
                {change}
              </p>
            )}
          </div>
          <div className={cn("h-12 w-12 rounded-lg flex items-center justify-center", iconBgColor)}>
            <Icon className="text-xl" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
