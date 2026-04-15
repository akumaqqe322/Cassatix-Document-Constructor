import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types/auth';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '../components/ui/card';
import { Button } from '../components/ui/button';
import { 
  Shield, 
  User, 
  Info, 
  Monitor,
  CheckCircle2,
  RefreshCcw
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function Settings() {
  const { user, login, isLoading } = useAuth();

  const roles = [
    { 
      id: UserRole.ADMIN, 
      name: 'Administrator', 
      description: 'Full access to templates, documents, and audit logs.',
      icon: Shield,
      color: 'text-red-600',
      bg: 'bg-red-50'
    },
    { 
      id: UserRole.LAWYER, 
      name: 'Lawyer', 
      description: 'Access to templates and documents. Cannot view audit logs.',
      icon: User,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    { 
      id: UserRole.PARTNER, 
      name: 'Partner (Client)', 
      description: 'Read-only access to documents. Cannot manage templates.',
      icon: User,
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1 text-sm">Manage your application preferences and developer identity.</p>
      </div>

      <div className="grid gap-6">
        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Monitor className="h-5 w-5 text-gray-400" />
              Developer Identity (Mock Auth)
            </CardTitle>
            <CardDescription>
              Switch between different user roles to test the RBAC implementation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              {roles.map((role) => {
                const isActive = user?.role === role.id;
                
                return (
                  <button
                    key={role.id}
                    onClick={() => !isActive && login(role.id)}
                    disabled={isLoading || isActive}
                    className={cn(
                      "relative flex flex-col items-start p-4 rounded-xl border text-left transition-all",
                      isActive 
                        ? "border-gray-900 bg-gray-50 ring-1 ring-gray-900" 
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/50",
                      isLoading && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <div className={cn("p-2 rounded-lg mb-3", role.bg)}>
                      <role.icon className={cn("h-5 w-5", role.color)} />
                    </div>
                    <div className="font-semibold text-sm text-gray-900 mb-1 flex items-center gap-2">
                      {role.name}
                      {isActive && <CheckCircle2 className="h-3.5 w-3.5 text-gray-900" />}
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      {role.description}
                    </p>
                    {isLoading && isActive && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/50 rounded-xl">
                        <RefreshCcw className="h-5 w-5 animate-spin text-gray-400" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Info className="h-5 w-5 text-gray-400" />
              Application Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Environment</p>
                <p className="font-medium text-gray-900">Development</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Version</p>
                <p className="font-medium text-gray-900">1.0.0-beta</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Database</p>
                <p className="font-medium text-gray-900">SQLite (Local)</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Storage</p>
                <p className="font-medium text-gray-900">S3 Compatible (Minio)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
