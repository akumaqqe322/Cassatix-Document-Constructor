import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTemplates } from "../hooks/useTemplates";
import { TemplateStatus, TemplateFilters } from "../types/template";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "../components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { StatusBadge, PageState } from "../components/shared/StatusBadge";
import { 
  Plus, 
  Search, 
  Filter, 
  RefreshCcw, 
  FileText,
  ChevronRight
} from "lucide-react";
import { cn } from "../lib/utils";

export default function Templates() {
  const [filters, setFilters] = useState<TemplateFilters>({
    search: "",
    status: undefined,
    category: undefined,
    caseType: undefined,
  });

  const { data: templates, isLoading, isError, error, refetch } = useTemplates(filters);
  const navigate = useNavigate();

  const handleFilterChange = (key: keyof TemplateFilters, value: string | undefined) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === "all" ? undefined : value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      status: undefined,
      category: undefined,
      caseType: undefined,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Document Templates</h1>
          <p className="text-gray-500 mt-1 text-sm">Manage and version your legal document templates.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCcw className="mr-2 h-4 w-4" /> Refresh
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" /> New Template
          </Button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center bg-white p-4 rounded-xl border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name or code..."
            className="pl-9 bg-gray-50/50 border-gray-200 focus:bg-white transition-colors"
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 text-sm text-gray-500 mr-2">
            <Filter className="h-4 w-4" />
            <span>Filters:</span>
          </div>
          
          <Select
            value={filters.status || "all"}
            onValueChange={(v) => handleFilterChange("status", v as TemplateStatus)}
          >
            <SelectTrigger className="w-[130px] h-9 text-xs bg-gray-50/50 border-gray-200">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value={TemplateStatus.ACTIVE}>Active</SelectItem>
              <SelectItem value={TemplateStatus.ARCHIVED}>Archived</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.category || "all"}
            onValueChange={(v) => handleFilterChange("category", v)}
          >
            <SelectTrigger className="w-[140px] h-9 text-xs bg-gray-50/50 border-gray-200">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="CONTRACT">Contract</SelectItem>
              <SelectItem value="NDA">NDA</SelectItem>
              <SelectItem value="PLEADING">Pleading</SelectItem>
              <SelectItem value="CORPORATE">Corporate</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.caseType || "all"}
            onValueChange={(v) => handleFilterChange("caseType", v)}
          >
            <SelectTrigger className="w-[140px] h-9 text-xs bg-gray-50/50 border-gray-200">
              <SelectValue placeholder="Case Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Case Types</SelectItem>
              <SelectItem value="LITIGATION">Litigation</SelectItem>
              <SelectItem value="CORPORATE">Corporate</SelectItem>
              <SelectItem value="FAMILY">Family</SelectItem>
              <SelectItem value="REAL_ESTATE">Real Estate</SelectItem>
            </SelectContent>
          </Select>

          {(filters.search || filters.status || filters.category || filters.caseType) && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs text-gray-500 h-9">
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden min-h-[400px]">
        {isLoading ? (
          <PageState 
            title="Loading templates..." 
            icon="loading" 
            className="min-h-[400px]"
          />
        ) : isError ? (
          <PageState 
            title="Failed to load templates" 
            description={error instanceof Error ? error.message : "An unexpected error occurred while fetching templates."}
            icon="error"
            action={<Button variant="outline" onClick={() => refetch()}>Try Again</Button>}
            className="min-h-[400px]"
          />
        ) : templates && templates.length > 0 ? (
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow>
                <TableHead className="w-[300px] text-xs font-semibold uppercase tracking-wider text-gray-500">Template Name</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-gray-500">Code</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-gray-500">Category</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-gray-500">Case Type</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-gray-500">Status</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-gray-500">Last Updated</TableHead>
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((template) => (
                <TableRow 
                  key={template.id} 
                  className="group cursor-pointer hover:bg-gray-50/80 transition-colors"
                  onClick={() => navigate(`/templates/${template.id}`)}
                >
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-white group-hover:shadow-sm transition-all">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{template.name}</div>
                        <div className="text-xs text-gray-500 mt-0.5">ID: {template.id.slice(0, 8)}...</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
                      {template.code}
                    </code>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">{template.category}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">{template.caseType}</span>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={template.status} type="template" />
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-gray-500">
                      {new Date(template.updatedAt).toLocaleDateString()}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 group-hover:text-gray-900">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <PageState 
            title="No templates found"
            description={filters.search || filters.status || filters.category || filters.caseType
              ? "Try adjusting your filters to find what you're looking for."
              : "Get started by creating your first document template."}
            icon="empty"
            action={filters.search || filters.status || filters.category || filters.caseType ? (
              <Button variant="outline" onClick={clearFilters}>Clear All Filters</Button>
            ) : (
              <Button>
                <Plus className="mr-2 h-4 w-4" /> New Template
              </Button>
            )}
            className="min-h-[400px]"
          />
        )}
      </div>
    </div>
  );
}
