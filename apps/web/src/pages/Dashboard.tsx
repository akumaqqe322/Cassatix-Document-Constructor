import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Layers, History, ShieldCheck } from "lucide-react";

export default function Dashboard() {
  const stats = [
    { title: "Total Templates", value: "12", icon: Layers, color: "text-blue-500" },
    { title: "Generated Docs", value: "148", icon: FileText, color: "text-green-500" },
    { title: "Pending Reviews", value: "5", icon: History, color: "text-amber-500" },
    { title: "Audit Logs", value: "1,240", icon: ShieldCheck, color: "text-purple-500" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
