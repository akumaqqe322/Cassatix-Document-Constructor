import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Templates() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Document Templates</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> New Template
        </Button>
      </div>
      <div className="rounded-lg border border-dashed border-zinc-300 p-12 text-center">
        <p className="text-zinc-500">No templates found. Create your first one to get started.</p>
      </div>
    </div>
  );
}
