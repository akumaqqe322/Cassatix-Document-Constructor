import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  useTemplate, 
  useTemplateVersions, 
  useGeneratePreview, 
  useGeneratedDocument 
} from "../hooks/useTemplate";
import { 
  TemplateStatus, 
  TemplateVersionStatus, 
  ValidationStatus,
  TemplateVersion
} from "../types/template";
import { DocumentStatus } from "../types/document";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Separator } from "../components/ui/separator";
import { 
  ArrowLeft, 
  Calendar, 
  FileText, 
  History, 
  Info, 
  User, 
  AlertCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
  Loader2,
  Download
} from "lucide-react";
import { cn } from "../lib/utils";

export default function TemplateDetails() {
  const { templateId } = useParams<{ templateId: string }>();
  const { data: template, isLoading: isTemplateLoading, isError: isTemplateError } = useTemplate(templateId);
  const { data: versions, isLoading: isVersionsLoading } = useTemplateVersions(templateId);
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const { data: activeDoc } = useGeneratedDocument(activeDocId || undefined);

  // Clear active doc if it's finished and user closes a notification or something
  // For now, we just keep it to show the status

  if (isTemplateLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <p className="text-sm text-gray-500">Loading template details...</p>
      </div>
    );
  }

  if (isTemplateError || !template) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4 text-center">
        <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
          <AlertCircle className="h-6 w-6 text-red-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Template not found</h3>
          <p className="text-sm text-gray-500 mt-1">The template you are looking for does not exist or has been removed.</p>
        </div>
        <Button asChild variant="outline">
          <Link to="/templates">Back to Templates</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm" className="-ml-2 text-gray-500">
          <Link to="/templates">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Templates
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">{template.name}</h1>
            <Badge 
              variant="outline" 
              className={cn(
                "text-[10px] uppercase font-bold tracking-wider px-2 py-0",
                template.status === TemplateStatus.ACTIVE 
                  ? "bg-green-50 text-green-700 border-green-200" 
                  : "bg-gray-50 text-gray-600 border-gray-200"
              )}
            >
              {template.status}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <code className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-700 font-mono text-xs">
                {template.code}
              </code>
            </div>
            <Separator orientation="vertical" className="h-4" />
            <span>{template.category}</span>
            <Separator orientation="vertical" className="h-4" />
            <span>{template.caseType}</span>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-transparent border-b rounded-none w-full justify-start h-auto p-0 gap-8">
          <TabsTrigger 
            value="overview" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-gray-900 data-[state=active]:bg-transparent px-0 py-2 text-sm font-medium text-gray-500 data-[state=active]:text-gray-900 transition-all"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger 
            value="history" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-gray-900 data-[state=active]:bg-transparent px-0 py-2 text-sm font-medium text-gray-500 data-[state=active]:text-gray-900 transition-all"
          >
            Version History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-0">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-2 border shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Info className="h-4 w-4 text-gray-400" />
                  General Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Template Name</p>
                    <p className="text-sm font-medium text-gray-900">{template.name}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Template Code</p>
                    <p className="text-sm font-mono text-gray-900">{template.code}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Category</p>
                    <p className="text-sm font-medium text-gray-900">{template.category}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Case Type</p>
                    <p className="text-sm font-medium text-gray-900">{template.caseType}</p>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Created By</p>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                        <User className="h-3 w-3 text-gray-500" />
                      </div>
                      <span className="text-sm text-gray-700">{template.createdBy?.name || 'System'}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Created At</p>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      {new Date(template.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-gray-400" />
                  Published Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {template.publishedVersion ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-green-700 uppercase tracking-wider">Currently Published</span>
                        <Badge className="bg-green-600 text-white border-none text-[10px]">v{template.publishedVersion.versionNumber}</Badge>
                      </div>
                      <p className="text-sm text-green-800 font-medium truncate">
                        {template.publishedVersion.fileName || 'Template File'}
                      </p>
                      <div className="flex items-center gap-1 mt-2 text-[10px] text-green-600">
                        <Clock className="h-3 w-3" />
                        Published on {new Date(template.publishedVersion.publishedAt!).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Validation</p>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium text-gray-700">Valid & Ready</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 text-center">
                    <AlertCircle className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-600">No version published</p>
                    <p className="text-xs text-gray-400 mt-1">Publish a version to make it available for document generation.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-0">
          <Card className="border shadow-sm overflow-hidden">
            <CardHeader className="border-b bg-gray-50/50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <History className="h-4 w-4 text-gray-400" />
                    Version History
                  </CardTitle>
                  <CardDescription>Complete audit trail of all template versions.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isVersionsLoading ? (
                <div className="p-12 flex flex-col items-center justify-center gap-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                  <p className="text-xs text-gray-500">Loading versions...</p>
                </div>
              ) : versions && versions.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-[100px] text-xs font-semibold uppercase tracking-wider">Version</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider">Status</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider">File Name</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider">Validation</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider">Created</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider">Changelog</TableHead>
                      <TableHead className="text-right text-xs font-semibold uppercase tracking-wider">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {versions.sort((a, b) => b.versionNumber - a.versionNumber).map((version) => (
                      <TableRow key={version.id} className="group">
                        <TableCell className="font-mono font-bold text-gray-900">
                          v{version.versionNumber}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "text-[10px] uppercase font-bold tracking-wider px-2 py-0",
                              version.status === TemplateVersionStatus.PUBLISHED 
                                ? "bg-green-50 text-green-700 border-green-200" 
                                : version.status === TemplateVersionStatus.DRAFT
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : "bg-gray-50 text-gray-600 border-gray-200"
                            )}
                          >
                            {version.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate text-sm text-gray-600">
                          {version.fileName || <span className="text-gray-400 italic">No file uploaded</span>}
                        </TableCell>
                        <TableCell>
                          {version.validationStatus ? (
                            <div className="flex items-center gap-1.5">
                              {version.validationStatus === ValidationStatus.VALID ? (
                                <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                              ) : version.validationStatus === ValidationStatus.INVALID ? (
                                <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                              ) : (
                                <Clock className="h-3.5 w-3.5 text-blue-500" />
                              )}
                              <span className="text-xs font-medium text-gray-700">{version.validationStatus}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-xs text-gray-700">{new Date(version.createdAt).toLocaleDateString()}</span>
                            <span className="text-[10px] text-gray-400">{new Date(version.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[250px]">
                          <p className="text-xs text-gray-500 truncate italic">
                            {version.changelog || "No changelog provided"}
                          </p>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <PreviewAction 
                              templateId={templateId!} 
                              version={version} 
                              onSuccess={(docId) => setActiveDocId(docId)}
                              activeDocId={activeDocId}
                              activeDoc={activeDoc}
                            />
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-900">
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="p-12 text-center">
                  <History className="h-8 w-8 text-gray-200 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-600">No version history</p>
                  <p className="text-xs text-gray-400 mt-1">Create a new version to start tracking changes.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface PreviewActionProps {
  templateId: string;
  version: TemplateVersion;
  onSuccess: (docId: string) => void;
  activeDocId: string | null;
  activeDoc: any;
}

function PreviewAction({ templateId, version, onSuccess, activeDocId, activeDoc }: PreviewActionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [caseId, setCaseId] = useState("");
  const generatePreview = useGeneratePreview();

  const isThisVersionActive = activeDocId && activeDoc?.templateVersionId === version.id;

  const handleRequest = async () => {
    if (!caseId) return;
    try {
      const doc = await generatePreview.mutateAsync({
        templateId,
        versionId: version.id,
        caseId,
      });
      onSuccess(doc.id);
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to request preview", error);
    }
  };

  const canPreview = version.storagePath && version.validationStatus === ValidationStatus.VALID;

  if (isThisVersionActive && activeDoc) {
    return (
      <div className="flex items-center gap-2 px-2 py-1 bg-gray-50 rounded-md border border-gray-200">
        <div className="flex items-center gap-1.5">
          {activeDoc.status === DocumentStatus.COMPLETED ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
          ) : activeDoc.status === DocumentStatus.FAILED ? (
            <AlertCircle className="h-3.5 w-3.5 text-red-500" />
          ) : (
            <Loader2 className="h-3.5 w-3.5 text-blue-500 animate-spin" />
          )}
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-600">
            Preview: {activeDoc.status}
          </span>
        </div>
        {activeDoc.status === DocumentStatus.COMPLETED && activeDoc.storagePath && (
          <Button variant="ghost" size="icon" className="h-6 w-6 text-blue-600" asChild>
            <a href={`/api/documents/${activeDoc.id}/download`} target="_blank" rel="noreferrer">
              <Download className="h-3 w-3" />
            </a>
          </Button>
        )}
        {activeDoc.status === DocumentStatus.FAILED && activeDoc.errorMessage && (
          <div className="group relative">
            <AlertCircle className="h-3.5 w-3.5 text-red-400 cursor-help" />
            <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block w-48 p-2 bg-white border border-red-100 rounded shadow-lg text-[10px] text-red-600 z-50">
              {activeDoc.errorMessage}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-8 text-xs font-semibold"
          disabled={!canPreview}
        >
          <FileText className="mr-2 h-3.5 w-3.5" />
          Preview
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Request Preview</DialogTitle>
          <DialogDescription>
            Generate a preview document for v{version.versionNumber} using case data.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="caseId" className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Case ID
            </Label>
            <Input
              id="caseId"
              placeholder="e.g. CASE-2024-001"
              value={caseId}
              onChange={(e) => setCaseId(e.target.value)}
              className="bg-gray-50/50"
            />
            <p className="text-[10px] text-gray-400">
              Enter a valid Case ID from Cassatix to populate the template variables.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setIsOpen(false)} disabled={generatePreview.isPending}>
            Cancel
          </Button>
          <Button 
            onClick={handleRequest} 
            disabled={!caseId || generatePreview.isPending}
            className="bg-gray-900 text-white hover:bg-gray-800"
          >
            {generatePreview.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Requesting...
              </>
            ) : (
              "Generate Preview"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
