import React, { useState } from "react";
import { useCreateTemplate, CreateTemplateInput } from "../../hooks/useTemplates";
import { TemplateStatus } from "../../types/template";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Loader2, AlertCircle } from "lucide-react";

interface CreateTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CATEGORIES = ["CONTRACT", "NDA", "PLEADING", "CORPORATE"];
const CASE_TYPES = ["LITIGATION", "CORPORATE", "FAMILY", "REAL_ESTATE"];

export function CreateTemplateDialog({ open, onOpenChange }: CreateTemplateDialogProps) {
  const [formData, setFormData] = useState<CreateTemplateInput>({
    name: "",
    code: "",
    category: "",
    caseType: "",
    status: TemplateStatus.ACTIVE,
  });

  const { mutate, isPending, error, reset } = useCreateTemplate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate(formData, {
      onSuccess: () => {
        onOpenChange(false);
        setFormData({
          name: "",
          code: "",
          category: "",
          caseType: "",
          status: TemplateStatus.ACTIVE,
        });
        reset();
      },
    });
  };

  const handleChange = (key: keyof CreateTemplateInput, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Template</DialogTitle>
            <DialogDescription>
              Add a new document template to Cassatix. You can upload the DOCX file after creation.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {error && (
              <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100">
                <AlertCircle className="h-4 w-4" />
                <p>{error instanceof Error ? error.message : "Failed to create template"}</p>
              </div>
            )}
            
            <div className="grid gap-2">
              <Label htmlFor="name">Template Name</Label>
              <Input
                id="name"
                placeholder="e.g. Standard Service Agreement"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="code">Template Code</Label>
              <Input
                id="code"
                placeholder="e.g. SSA-2024"
                value={formData.code}
                onChange={(e) => handleChange("code", e.target.value)}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(v) => handleChange("category", v)}
                  required
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="caseType">Case Type</Label>
                <Select
                  value={formData.caseType}
                  onValueChange={(v) => handleChange("caseType", v)}
                  required
                >
                  <SelectTrigger id="caseType">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {CASE_TYPES.map((ct) => (
                      <SelectItem key={ct} value={ct}>
                        {ct.replace("_", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="status">Initial Status</Label>
              <Select
                value={formData.status}
                onValueChange={(v) => handleChange("status", v as TemplateStatus)}
                required
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TemplateStatus.ACTIVE}>Active</SelectItem>
                  <SelectItem value={TemplateStatus.ARCHIVED}>Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Template
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
