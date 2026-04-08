import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types/auth';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Scale, Shield, Briefcase, Users } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const from = location.state?.from?.pathname || '/';

  const handleLogin = async (role: UserRole) => {
    setIsLoggingIn(true);
    try {
      await login(role);
      navigate(from, { replace: true });
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-black rounded-xl flex items-center justify-center mb-4">
            <Scale className="text-white w-7 h-7" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">LexFlow</h1>
          <p className="mt-2 text-sm text-gray-600">
            Legal Document Constructor & Lifecycle Management
          </p>
        </div>

        <Card className="border-none shadow-xl bg-white/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-xl">Sign in to your account</CardTitle>
            <CardDescription>
              Select a role to explore the platform (Stubbed Auth)
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Button
              variant="outline"
              className="h-16 justify-start gap-4 px-6 hover:bg-gray-50 hover:border-gray-400 transition-all"
              onClick={() => handleLogin(UserRole.ADMIN)}
              disabled={isLoggingIn}
            >
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <Shield className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-left">
                <div className="font-semibold">Administrator</div>
                <div className="text-xs text-gray-500">Full system access & audit logs</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-16 justify-start gap-4 px-6 hover:bg-gray-50 hover:border-gray-400 transition-all"
              onClick={() => handleLogin(UserRole.LAWYER)}
              disabled={isLoggingIn}
            >
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-left">
                <div className="font-semibold">Lawyer</div>
                <div className="text-xs text-gray-500">Manage templates & documents</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-16 justify-start gap-4 px-6 hover:bg-gray-50 hover:border-gray-400 transition-all"
              onClick={() => handleLogin(UserRole.PARTNER)}
              disabled={isLoggingIn}
            >
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-left">
                <div className="font-semibold">External Partner</div>
                <div className="text-xs text-gray-500">View documents & status</div>
              </div>
            </Button>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <p className="text-xs text-center text-gray-400 w-full">
              In production, this would be replaced by SSO or multi-factor authentication.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};
