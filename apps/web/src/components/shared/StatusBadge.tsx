import React from "react";
import { Badge } from "../ui/badge";
import { cn } from "../../lib/utils";
import { 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Loader2, 
  XCircle,
  FileText,
  History
} from "lucide-react";
import { TemplateStatus, TemplateVersionStatus, ValidationStatus } from "../../types/template";
import { DocumentStatus, GenerationType } from "../../types/document";

interface StatusBadgeProps {
  status: string;
  type: 'template' | 'version' | 'validation' | 'document' | 'generation';
  className?: string;
  showIcon?: boolean;
  label?: string;
  children?: React.ReactNode;
}

export function StatusBadge({ status, type, className, showIcon = false, label, children }: StatusBadgeProps) {
  let badgeClass = "bg-gray-50 text-gray-600 border-gray-200";
  let Icon = null;

  switch (type) {
    case 'template':
      if (status === TemplateStatus.ACTIVE) badgeClass = "bg-green-50 text-green-700 border-green-200";
      break;
    case 'version':
      if (status === TemplateVersionStatus.PUBLISHED) badgeClass = "bg-green-50 text-green-700 border-green-200";
      if (status === TemplateVersionStatus.DRAFT) badgeClass = "bg-blue-50 text-blue-700 border-blue-200";
      break;
    case 'validation':
      if (status === ValidationStatus.VALID) {
        badgeClass = "bg-green-50 text-green-700 border-green-200";
        Icon = CheckCircle2;
      } else if (status === ValidationStatus.INVALID) {
        badgeClass = "bg-red-50 text-red-700 border-red-200";
        Icon = AlertCircle;
      } else {
        badgeClass = "bg-blue-50 text-blue-700 border-blue-200";
        Icon = Clock;
      }
      break;
    case 'document':
      if (status === DocumentStatus.COMPLETED) {
        badgeClass = "bg-green-50 text-green-700 border-green-200";
        Icon = CheckCircle2;
      } else if (status === DocumentStatus.FAILED) {
        badgeClass = "bg-red-50 text-red-700 border-red-200";
        Icon = XCircle;
      } else if (status === DocumentStatus.PROCESSING) {
        badgeClass = "bg-blue-50 text-blue-700 border-blue-200";
        Icon = Loader2;
      } else {
        badgeClass = "bg-gray-50 text-gray-600 border-gray-200";
        Icon = Clock;
      }
      break;
    case 'generation':
      if (status === GenerationType.FINAL) badgeClass = "bg-purple-50 text-purple-700 border-purple-200";
      else badgeClass = "bg-blue-50 text-blue-700 border-blue-200";
      break;
  }

  return (
    <div className={cn("inline-flex items-center gap-1.5", className)}>
      {showIcon && Icon && (
        <Icon className={cn("h-3.5 w-3.5", status === DocumentStatus.PROCESSING && "animate-spin")} />
      )}
      <Badge 
        variant="outline" 
        className={cn(
          "text-[10px] uppercase font-bold tracking-wider px-2 py-0",
          badgeClass
        )}
      >
        {label && <span className="mr-1 opacity-70">{label}:</span>}
        {status}
      </Badge>
      {children}
    </div>
  );
}

interface PageStateProps {
  title: string;
  description?: string;
  icon?: 'loading' | 'error' | 'empty';
  action?: React.ReactNode;
  className?: string;
}

export function PageState({ title, description, icon, action, className }: PageStateProps) {
  return (
    <div className={cn("p-24 flex flex-col items-center justify-center gap-4 text-center", className)}>
      {icon === 'loading' && (
        <Loader2 className="h-8 w-8 text-gray-900 animate-spin" />
      )}
      {icon === 'error' && (
        <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
          <AlertCircle className="h-6 w-6 text-red-600" />
        </div>
      )}
      {icon === 'empty' && (
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
          <FileText className="h-8 w-8 text-gray-300" />
        </div>
      )}
      
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {description && (
          <p className="text-sm text-gray-500 max-w-xs mx-auto">{description}</p>
        )}
      </div>
      
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
