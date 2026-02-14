import { Card, CardContent } from "@/components/ui/card";
import { type LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  value: number | string;
  label: string;
}

export default function StatCard({ icon: Icon, value, label }: StatCardProps) {
  return (
    <Card className="bg-card dark:bg-gray-800">
      <CardContent className="pt-6 text-center">
        <Icon className="h-8 w-8 text-primary mx-auto mb-2" />
        <p className="text-2xl font-bold text-foreground dark:text-white">{value}</p>
        <p className="text-sm text-muted-foreground dark:text-gray-400">{label}</p>
      </CardContent>
    </Card>
  );
}
