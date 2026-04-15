import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Loader2, Upload, CheckCircle2 } from 'lucide-react';
import { TemplateVersion, TemplateVersionStatus } from '../../../types/template';
import { UserRole } from '../../../types/auth';
import { useUploadTemplateFile, useTemplateVersions } from '../../../hooks/useTemplate';
import { cn } from '../../../lib/utils';

interface UploadActionProps {
  templateId: string;
  version: TemplateVersion;
  userRole?: UserRole;
}

export function UploadAction({ templateId, version, userRole }: UploadActionProps) {
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
          variant={!version.storagePath ? "default" : "outline"} 
          size={!version.storagePath ? "sm" : "icon"} 
          className={cn(
            "h-8 text-xs font-semibold",
            !version.storagePath ? "bg-blue-600 hover:bg-blue-700 text-white" : "text-gray-400 hover:text-gray-900 w-8"
          )}
          title="Upload Template File (.docx)"
        >
          <Upload className={cn("h-3.5 w-3.5", !version.storagePath && "mr-2")} />
          {!version.storagePath && "Upload File"}
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
