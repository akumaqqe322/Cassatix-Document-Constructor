import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { 
  useTemplate, 
  useTemplateVersions, 
  useGeneratedDocument,
} from "../hooks/useTemplate";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Separator } from "../components/ui/separator";
import { StatusBadge, PageState } from "../components/shared/StatusBadge";
import { 
  ArrowLeft, 
  Calendar, 
  History, 
  Info, 
  User, 
  AlertCircle,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { PreviewAction, FinalAction } from "../components/templates/details/GenerationActions";
import { CreateVersionDialog } from "../components/templates/details/CreateVersionDialog";
import { VersionHistoryTable } from "../components/templates/details/VersionHistoryTable";

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
                    
                    <Separator />
                    
                    <div className="space-y-3">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Quick Actions</p>
                      <div className="flex flex-col gap-2">
                        <PreviewAction 
                          templateId={template.id}
                          version={template.publishedVersion}
                          userRole={user?.role}
                          onSuccess={setActiveDocId}
                          activeDocId={activeDocId}
                          activeDoc={activeDoc}
                        />
                        <FinalAction 
                          templateId={template.id}
                          template={template}
                          version={template.publishedVersion}
                          userRole={user?.role}
                          onSuccess={setActiveFinalDocId}
                          activeDocId={activeFinalDocId}
                          activeDoc={activeFinalDoc}
                        />
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
              <VersionHistoryTable 
                template={template}
                versions={versions || []}
                isLoading={isVersionsLoading}
                userRole={user?.role}
                activeDocId={activeDocId}
                activeDoc={activeDoc}
                onDocSuccess={setActiveDocId}
                activeFinalDocId={activeFinalDocId}
                activeFinalDoc={activeFinalDoc}
                onFinalDocSuccess={setActiveFinalDocId}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
