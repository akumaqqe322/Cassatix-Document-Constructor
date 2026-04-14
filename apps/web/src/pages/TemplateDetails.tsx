import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { UserRole } from "../types/auth";
import { 
  useTemplate, 
  useTemplateVersions, 
  useGeneratePreview, 
  useGenerateFinal,
  useGeneratedDocument,
  useUploadTemplateFile,
  useCreateTemplateVersion,
  usePublishVersion,
  useArchiveVersion
} from "../hooks/useTemplate";
import { 
  TemplateStatus, 
  TemplateVersionStatus, 
  ValidationStatus,
  TemplateVersion
} from "../types/template";
import { DocumentStatus, OutputFormat } from "../types/document";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
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
import { StatusBadge, PageState } from "../components/shared/StatusBadge";
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
  Download,
  Upload,
  Plus,
  Rocket,
  Archive,
  Eye
} from "lucide-react";
import { SchemaViewer } from "../components/templates/SchemaViewer";
import { SchemaEditor } from "../components/templates/SchemaEditor";
import { cn } from "../lib/utils";

export default function TemplateDetails() {
  const { user } = useAuth();
  const { templateId } = useParams<{ templateId: string }>();
  const { data: template, isLoading: isTemplateLoading, isError: isTemplateError } = useTemplate(templateId);
  const { data: versions, isLoading: isVersionsLoading } = useTemplateVersions(templateId);
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const { data: activeDoc } = useGeneratedDocument(activeDocId || undefined);
  
  const [activeFinalDocId, setActiveFinalDocId] = useState<string | null>(null);
  const { data: activeFinalDoc } = useGeneratedDocument(activeFinalDocId || undefined);
  
  if (isTemplateLoading) {
    return (
      <PageState 
        title="Loading template details..." 
        icon="loading" 
        className="h-[60vh]"
      />
    );
  }

  if (isTemplateError || !template) {
    return (
      <PageState 
        title="Template not found" 
        description="The template you are looking for does not exist or has been removed."
        icon="error"
        action={
          <Button asChild variant="outline">
            <Link to="/templates">Back to Templates</Link>
          </Button>
        }
        className="h-[60vh]"
      />
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
            <StatusBadge status={template.status} type="template" />
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
                <CreateVersionDialog templateId={templateId!} userRole={user?.role} />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isVersionsLoading ? (
                <PageState 
                  title="Loading versions..." 
                  icon="loading" 
                  className="p-12"
                />
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
                      {versions.sort((a, b) => b.versionNumber - a.versionNumber).map((version) => {
                        const isPublished = template.publishedVersionId === version.id;
                        
                        return (
                          <TableRow 
                            key={version.id} 
                            className={cn(
                              "group",
                              isPublished && "bg-green-50/30 hover:bg-green-50/50"
                            )}
                          >
                            <TableCell className="font-mono font-bold text-gray-900">
                              <div className="flex items-center gap-2">
                                v{version.versionNumber}
                                {isPublished && (
                                  <Badge className="bg-green-600 text-white border-none text-[8px] h-4 px-1">LIVE</Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={version.status} type="version" />
                            </TableCell>
                            <TableCell className="max-w-[200px] truncate text-sm text-gray-600">
                              {version.fileName || <span className="text-gray-400 italic">No file uploaded</span>}
                            </TableCell>
                            <TableCell>
                              {version.validationStatus ? (
                                <StatusBadge status={version.validationStatus} type="validation" showIcon />
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
                                <UploadAction 
                                  templateId={templateId!} 
                                  version={version} 
                                  userRole={user?.role}
                                />
                                <PublishAction 
                                  templateId={templateId!} 
                                  version={version} 
                                  userRole={user?.role}
                                />
                                <ArchiveAction 
                                  templateId={templateId!} 
                                  version={version} 
                                  userRole={user?.role}
                                />
                                <PreviewAction 
                                  templateId={templateId!} 
                                  version={version} 
                                  userRole={user?.role}
                                  onSuccess={(docId) => setActiveDocId(docId)}
                                  activeDocId={activeDocId}
                                  activeDoc={activeDoc}
                                />
                                <FinalAction 
                                  templateId={templateId!} 
                                  template={template}
                                  version={version} 
                                  userRole={user?.role}
                                  onSuccess={(docId) => setActiveFinalDocId(docId)}
                                  activeDocId={activeFinalDocId}
                                  activeDoc={activeFinalDoc}
                                />
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-900" title="View External Reference">
                                  <ExternalLink className="h-3.5 w-3.5" />
                                </Button>
                                <VersionDetailsDialog version={version} />
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                </Table>
              ) : (
                <PageState 
                  title="No version history" 
                  description="Create a new version to start tracking changes."
                  icon="empty"
                  className="p-12"
                />
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
  userRole?: UserRole;
  onSuccess: (docId: string) => void;
  activeDocId: string | null;
  activeDoc: any;
}

function PreviewAction({ templateId, version, userRole, onSuccess, activeDocId, activeDoc }: PreviewActionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [caseId, setCaseId] = useState("");
  const [outputFormat, setOutputFormat] = useState<OutputFormat>(OutputFormat.DOCX);
  const generatePreview = useGeneratePreview();

  const isThisVersionActive = activeDocId && activeDoc?.templateVersionId === version.id;

  const handleRequest = async () => {
    if (!caseId) return;
    try {
      const doc = await generatePreview.mutateAsync({
        templateId,
        versionId: version.id,
        caseId,
        outputFormat,
      });
      onSuccess(doc.id);
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to request preview", error);
    }
  };

  const isAuthorized = userRole === UserRole.ADMIN || userRole === UserRole.LAWYER;
  const hasFile = !!version.storagePath;
  const isValid = version.validationStatus === ValidationStatus.VALID;
  const canPreview = isAuthorized && hasFile && isValid;

  // If not authorized to trigger, but there is an active doc, we still show the status
  if (isThisVersionActive && activeDoc) {
    return (
      <div className="flex flex-col items-end gap-1">
        <StatusBadge 
          status={activeDoc.status} 
          type="document" 
          showIcon 
          label="Preview"
          className="px-2 py-1 bg-gray-50 rounded-md border border-gray-200"
        >
          {activeDoc.status === DocumentStatus.COMPLETED && activeDoc.storagePath && (
            <Button variant="ghost" size="icon" className="h-6 w-6 text-blue-600" asChild title="Download Preview">
              <a href={`/api/documents/${activeDoc.id}/download`} target="_blank" rel="noreferrer">
                <Download className="h-3 w-3" />
              </a>
            </Button>
          )}
          {activeDoc.status === DocumentStatus.FAILED && activeDoc.errorMessage && (
            <AlertCircle className="h-3.5 w-3.5 text-red-400 cursor-help" title={activeDoc.errorMessage} />
          )}
        </StatusBadge>
        <div className="flex flex-col items-end text-[10px] text-gray-400">
          <span className="font-medium text-gray-500">Case: {activeDoc.caseId}</span>
          {activeDoc.completedAt && (
            <span>Generated: {new Date(activeDoc.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          )}
        </div>
      </div>
    );
  }

  // Hide action entirely for Partners
  if (userRole === UserRole.PARTNER) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-8 text-xs font-semibold"
          disabled={!canPreview}
          title={!hasFile ? "No file uploaded" : !isValid ? `Validation: ${version.validationStatus || 'Pending'}` : "Request Preview"}
        >
          <FileText className="mr-2 h-3.5 w-3.5" />
          Preview
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Request Preview</DialogTitle>
          <DialogDescription>
            Generate a preview document for v{version.versionNumber} using case data from Cassatix.
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
              Enter a valid Case ID to populate the template variables.
            </p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="previewFormat" className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Output Format
            </Label>
            <Select 
              value={outputFormat} 
              onValueChange={(v) => setOutputFormat(v as OutputFormat)}
            >
              <SelectTrigger id="previewFormat" className="bg-gray-50/50">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={OutputFormat.DOCX}>Word Document (.docx)</SelectItem>
                <SelectItem value={OutputFormat.PDF}>PDF Document (.pdf)</SelectItem>
              </SelectContent>
            </Select>
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

interface FinalActionProps {
  templateId: string;
  template: any;
  version: TemplateVersion;
  userRole?: UserRole;
  onSuccess: (docId: string) => void;
  activeDocId: string | null;
  activeDoc: any;
}

function FinalAction({ templateId, template, version, userRole, onSuccess, activeDocId, activeDoc }: FinalActionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [caseId, setCaseId] = useState("");
  const [outputFormat, setOutputFormat] = useState<OutputFormat>(OutputFormat.DOCX);
  const generateFinal = useGenerateFinal();

  const isThisVersionActive = activeDocId && activeDoc?.templateVersionId === version.id;

  const handleRequest = async () => {
    if (!caseId) return;
    try {
      const doc = await generateFinal.mutateAsync({
        templateId,
        versionId: version.id,
        caseId,
        outputFormat,
      });
      onSuccess(doc.id);
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to request final generation", error);
    }
  };

  const isAuthorized = userRole === UserRole.ADMIN || userRole === UserRole.LAWYER;
  const isPublished = version.status === TemplateVersionStatus.PUBLISHED && template.publishedVersionId === version.id;
  const hasFile = !!version.storagePath;
  const isValid = version.validationStatus === ValidationStatus.VALID;
  const canGenerate = isAuthorized && isPublished && hasFile && isValid;

  if (isThisVersionActive && activeDoc) {
    return (
      <div className="flex flex-col items-end gap-1">
        <StatusBadge 
          status={activeDoc.status} 
          type="document" 
          showIcon 
          label="Final"
          className="px-2 py-1 bg-purple-50 rounded-md border border-purple-200"
        >
          {activeDoc.status === DocumentStatus.COMPLETED && activeDoc.storagePath && (
            <Button variant="ghost" size="icon" className="h-6 w-6 text-purple-600" asChild title="Download Final Document">
              <a href={`/api/documents/${activeDoc.id}/download`} target="_blank" rel="noreferrer">
                <Download className="h-3 w-3" />
              </a>
            </Button>
          )}
          {activeDoc.status === DocumentStatus.FAILED && activeDoc.errorMessage && (
            <AlertCircle className="h-3.5 w-3.5 text-red-400 cursor-help" title={activeDoc.errorMessage} />
          )}
        </StatusBadge>
        <div className="flex flex-col items-end text-[10px] text-gray-400">
          <span className="font-medium text-gray-500">Case: {activeDoc.caseId}</span>
          {activeDoc.completedAt && (
            <span>Generated: {new Date(activeDoc.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          )}
        </div>
      </div>
    );
  }

  // Hide action entirely if not published or if user is a Partner
  if (!isPublished || userRole === UserRole.PARTNER) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="default" 
          size="sm" 
          className="h-8 text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white"
          disabled={!canGenerate}
          title={!hasFile ? "No file uploaded" : !isValid ? `Validation: ${version.validationStatus || 'Pending'}` : "Request Final Generation"}
        >
          <CheckCircle2 className="mr-2 h-3.5 w-3.5" />
          Final
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Request Final Generation</DialogTitle>
          <DialogDescription>
            Generate the final document for v{version.versionNumber}. This action is logged and intended for production use.
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
              Enter the official Case ID from Cassatix.
            </p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="finalFormat" className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Output Format
            </Label>
            <Select 
              value={outputFormat} 
              onValueChange={(v) => setOutputFormat(v as OutputFormat)}
            >
              <SelectTrigger id="finalFormat" className="bg-gray-50/50">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={OutputFormat.DOCX}>Word Document (.docx)</SelectItem>
                <SelectItem value={OutputFormat.PDF}>PDF Document (.pdf)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setIsOpen(false)} disabled={generateFinal.isPending}>
            Cancel
          </Button>
          <Button 
            onClick={handleRequest} 
            disabled={!caseId || generateFinal.isPending}
            className="bg-purple-600 text-white hover:bg-purple-700"
          >
            {generateFinal.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Final Document"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface UploadActionProps {
  templateId: string;
  version: TemplateVersion;
  userRole?: UserRole;
}

function UploadAction({ templateId, version, userRole }: UploadActionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const uploadFile = useUploadTemplateFile();
  const { refetch: refetchVersions } = useTemplateVersions(templateId);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.name.endsWith('.docx')) {
        setFile(selectedFile);
      } else {
        alert("Please select a .docx file");
        e.target.value = "";
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    try {
      await uploadFile.mutateAsync({
        templateId,
        versionId: version.id,
        file,
      });
      await refetchVersions();
      setIsOpen(false);
      setFile(null);
    } catch (error) {
      console.error("Failed to upload file", error);
    }
  };

  const isAuthorized = userRole === UserRole.ADMIN || userRole === UserRole.LAWYER;
  const isArchived = version.status === TemplateVersionStatus.ARCHIVED;
  const canUpload = isAuthorized && !isArchived;

  if (!canUpload) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className="h-8 w-8 text-gray-400 hover:text-gray-900"
          title="Upload Template File (.docx)"
        >
          <Upload className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload Template File</DialogTitle>
          <DialogDescription>
            Upload a Microsoft Word (.docx) file for v{version.versionNumber}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="file" className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Select DOCX File
            </Label>
            <Input
              id="file"
              type="file"
              accept=".docx"
              onChange={handleFileChange}
              className="bg-gray-50/50"
            />
            {file && (
              <p className="text-xs text-green-600 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                {file.name} selected
              </p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setIsOpen(false)} disabled={uploadFile.isPending}>
            Cancel
          </Button>
          <Button 
            onClick={handleUpload} 
            disabled={!file || uploadFile.isPending}
            className="bg-gray-900 text-white hover:bg-gray-800"
          >
            {uploadFile.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              "Upload File"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface CreateVersionDialogProps {
  templateId: string;
  userRole?: UserRole;
}

function CreateVersionDialog({ templateId, userRole }: CreateVersionDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [changelog, setChangelog] = useState("");
  const [variablesSchema, setVariablesSchema] = useState('{\n  "type": "object",\n  "properties": {}\n}');
  const [conditionsSchema, setConditionsSchema] = useState('{\n  "type": "object",\n  "properties": {}\n}');
  const [error, setError] = useState<string | null>(null);
  
  const createVersion = useCreateTemplateVersion();
  const { refetch: refetchVersions } = useTemplateVersions(templateId);

  const handleCreate = async () => {
    setError(null);
    
    let variablesJson = undefined;
    let conditionsJson = undefined;

    try {
      if (variablesSchema.trim()) {
        variablesJson = JSON.parse(variablesSchema);
      }
    } catch (e) {
      setError("Invalid JSON in Variables Schema");
      return;
    }

    try {
      if (conditionsSchema.trim()) {
        conditionsJson = JSON.parse(conditionsSchema);
      }
    } catch (e) {
      setError("Invalid JSON in Conditions Schema");
      return;
    }

    try {
      await createVersion.mutateAsync({
        templateId,
        changelog,
        variablesSchemaJson: variablesJson,
        conditionsSchemaJson: conditionsJson,
      });
      await refetchVersions();
      setIsOpen(false);
      setChangelog("");
      setVariablesSchema('{\n  "type": "object",\n  "properties": {}\n}');
      setConditionsSchema('{\n  "type": "object",\n  "properties": {}\n}');
    } catch (error) {
      console.error("Failed to create version", error);
      setError("Failed to create version. Please check your inputs.");
    }
  };

  const isAuthorized = userRole === UserRole.ADMIN || userRole === UserRole.LAWYER;
  if (!isAuthorized) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-gray-900 text-white hover:bg-gray-800">
          <Plus className="mr-2 h-4 w-4" />
          Create Version
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Version</DialogTitle>
          <DialogDescription>
            Define a new version for this template. You can upload the file after creation.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="changelog" className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Changelog
            </Label>
            <Textarea
              id="changelog"
              placeholder="Describe what changed in this version..."
              value={changelog}
              onChange={(e) => setChangelog(e.target.value)}
              className="bg-gray-50/50 min-h-[80px]"
            />
          </div>
          
          <Separator />

          <SchemaEditor 
            title="Variables Schema" 
            value={variablesSchema} 
            onChange={setVariablesSchema}
            placeholder='{ "type": "object", "properties": { ... } }'
          />

          <Separator />

          <SchemaEditor 
            title="Conditions Schema" 
            value={conditionsSchema} 
            onChange={setConditionsSchema}
            placeholder='{ "type": "object", "properties": { ... } }'
          />

          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-md flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}
        </div>
        <DialogFooter className="sticky bottom-0 bg-white pt-4 border-t">
          <Button variant="ghost" onClick={() => setIsOpen(false)} disabled={createVersion.isPending}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreate} 
            disabled={!changelog || createVersion.isPending}
            className="bg-gray-900 text-white hover:bg-gray-800"
          >
            {createVersion.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Version"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function VersionDetailsDialog({ version }: { version: TemplateVersion }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-900" title="View Logic & Details">
          <Eye className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="font-mono">v{version.versionNumber}</Badge>
            <StatusBadge status={version.status} type="version" />
          </div>
          <DialogTitle>Version Details</DialogTitle>
          <DialogDescription>
            Logic definition and metadata for this template version.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">Changelog</h4>
            <div className="p-3 bg-gray-50 rounded-lg border text-sm text-gray-700 italic">
              {version.changelog || "No changelog provided"}
            </div>
          </div>

          <Separator />

          <SchemaViewer 
            title="Variables" 
            schema={version.variablesSchemaJson} 
            emptyMessage="No variables defined for this version."
          />

          <Separator />

          <SchemaViewer 
            title="Conditions" 
            schema={version.conditionsSchemaJson} 
            emptyMessage="No conditions defined for this version."
          />

          <div className="pt-4 grid grid-cols-2 gap-4 text-[10px] text-gray-400">
            <div className="flex flex-col gap-1">
              <span className="font-semibold uppercase tracking-wider">Created At</span>
              <span>{new Date(version.createdAt).toLocaleString()}</span>
            </div>
            {version.publishedAt && (
              <div className="flex flex-col gap-1">
                <span className="font-semibold uppercase tracking-wider">Published At</span>
                <span>{new Date(version.publishedAt).toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface LifecycleActionProps {
  templateId: string;
  version: TemplateVersion;
  userRole?: UserRole;
}

function PublishAction({ templateId, version, userRole }: LifecycleActionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const publish = usePublishVersion();
  const { refetch: refetchTemplate } = useTemplate(templateId);
  const { refetch: refetchVersions } = useTemplateVersions(templateId);

  const handlePublish = async () => {
    try {
      await publish.mutateAsync({ templateId, versionId: version.id });
      await Promise.all([refetchTemplate(), refetchVersions()]);
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to publish version", error);
    }
  };

  const isAuthorized = userRole === UserRole.ADMIN;
  const isDraft = version.status === TemplateVersionStatus.DRAFT;
  const isValid = version.validationStatus === ValidationStatus.VALID;
  const canPublish = isAuthorized && isDraft && isValid;

  if (!isAuthorized || version.status === TemplateVersionStatus.PUBLISHED || version.status === TemplateVersionStatus.ARCHIVED) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className="h-8 w-8 text-gray-400 hover:text-green-600 hover:border-green-200 hover:bg-green-50"
          disabled={!canPublish}
          title={!isValid ? "Version must be valid to publish" : "Publish Version"}
        >
          <Rocket className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Publish Version v{version.versionNumber}</DialogTitle>
          <DialogDescription>
            This will make this version the active template for all new document generations. 
            Any previously published version will be archived.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button variant="ghost" onClick={() => setIsOpen(false)} disabled={publish.isPending}>
            Cancel
          </Button>
          <Button 
            onClick={handlePublish} 
            disabled={publish.isPending}
            className="bg-green-600 text-white hover:bg-green-700"
          >
            {publish.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Publishing...
              </>
            ) : (
              "Confirm Publish"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ArchiveAction({ templateId, version, userRole }: LifecycleActionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const archive = useArchiveVersion();
  const { refetch: refetchTemplate } = useTemplate(templateId);
  const { refetch: refetchVersions } = useTemplateVersions(templateId);

  const handleArchive = async () => {
    try {
      await archive.mutateAsync({ templateId, versionId: version.id });
      await Promise.all([refetchTemplate(), refetchVersions()]);
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to archive version", error);
    }
  };

  const isAuthorized = userRole === UserRole.ADMIN;
  const isArchived = version.status === TemplateVersionStatus.ARCHIVED;
  const canArchive = isAuthorized && !isArchived;

  if (!isAuthorized || isArchived) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className="h-8 w-8 text-gray-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50"
          disabled={!canArchive}
          title="Archive Version"
        >
          <Archive className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Archive Version v{version.versionNumber}</DialogTitle>
          <DialogDescription>
            Are you sure you want to archive this version? It will no longer be available for document generation or publishing.
            {version.status === TemplateVersionStatus.PUBLISHED && (
              <p className="mt-2 font-bold text-red-600">
                Warning: This is the currently published version. Archiving it will leave the template without a published version.
              </p>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button variant="ghost" onClick={() => setIsOpen(false)} disabled={archive.isPending}>
            Cancel
          </Button>
          <Button 
            onClick={handleArchive} 
            disabled={archive.isPending}
            variant="destructive"
          >
            {archive.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Archiving...
              </>
            ) : (
              "Confirm Archive"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
