import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Lock, Eye, EyeOff, ShieldAlert, Loader2, Phone, HelpCircle } from 'lucide-react';
import { verifyAdminLogin } from '@/lib/admin-auth';

export const Route = createFileRoute('/admin/login')({
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@southzoom.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forgotOpen, setForgotOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await verifyAdminLogin(email.trim(), password);
      if (res.success) {
        toast.success('Login successful! Welcome to South Zoom Admin.');
        navigate({ to: '/admin' });
      } else {
        setError(res.error || 'Invalid credentials');
        toast.error('Invalid credentials');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50 p-4">
      <Card className="w-full max-w-md shadow-lg border-gray-200">
        <CardHeader className="space-y-2 text-center pb-6">
          <div className="flex justify-center mb-2">
            <div className="h-12 w-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 shadow-sm">
              <Lock size={22} />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-gray-900">Admin Control Shell</CardTitle>
          <CardDescription className="text-xs text-gray-500">
            Sign in to manage tours, fleet, hotels, bookings & website settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3.5 py-2.5 rounded-lg flex items-start gap-2">
                <ShieldAlert size={16} className="shrink-0 mt-0.5 text-red-600" />
                <div className="space-y-0.5">
                  <div className="font-semibold">Authentication Failed</div>
                  <div>{error}</div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-semibold text-gray-700">Administrator Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="admin@southzoom.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="text-sm"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-semibold text-gray-700">Password</Label>
                <button
                  type="button"
                  onClick={() => setForgotOpen(true)}
                  className="text-xs text-orange-600 hover:text-orange-700 hover:underline font-medium"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Input 
                  id="password" 
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pr-10 text-sm"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full text-md py-5 mt-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin mr-2" />
                  Verifying...
                </>
              ) : (
                'Sign In to Admin'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Forgot Password Dialog */}
      <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="mx-auto w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mb-1 text-orange-600">
              <HelpCircle size={20} />
            </div>
            <DialogTitle className="text-center text-base font-bold">Admin Password Recovery</DialogTitle>
            <DialogDescription className="text-center text-xs text-gray-500">
              Emergency password reset instructions for South Zoom Tourism
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs text-gray-700 leading-relaxed">
            <p>
              If you forgot your password, please contact the emergency administrator helpline:
            </p>
            <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg flex items-center gap-3">
              <Phone className="text-orange-600 shrink-0" size={16} />
              <div>
                <div className="font-semibold text-orange-900">+91 6366357757</div>
                <div className="text-[11px] text-orange-700">bookings@southzoomtourism.com</div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button className="w-full" onClick={() => setForgotOpen(false)}>
              Got it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
