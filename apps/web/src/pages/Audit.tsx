import { PageState } from "../components/shared/StatusBadge";
import { ShieldCheck } from "lucide-react";

export default function Audit() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <PageState 
          title="Audit Logs" 
          description="System audit logs and activity history will appear here."
          icon="empty"
          className="p-12"
        />
      </div>
    </div>
  );
}
