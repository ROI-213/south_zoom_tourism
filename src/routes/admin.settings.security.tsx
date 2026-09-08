import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Shield, KeyRound, Lock, Eye, EyeOff, CheckCircle2, AlertTriangle, Clock, RefreshCw, Loader2 } from 'lucide-react';
import { getAdminSecuritySettings, updateAdminPassword, DEFAULT_ADMIN_PASSWORD } from '@/lib/admin-auth';

export const Route = createFileRoute('/admin/settings/security')({
  component: AdminSecurityPage,
});

function AdminSecurityPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isDefault, setIsDefault] = useState(false);

  async function loadSettings() {
    setLoading(true);
    try {
      const settings = await getAdminSecuritySettings();
      setLastUpdated(settings.updated_at);
      setIsDefault(settings.password === DEFAULT_ADMIN_PASSWORD);
    } catch (err) {
      console.error('Failed to load admin security settings:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSettings();
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword) {
      toast.error('Please enter your current password');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setSaving(true);
    try {
      const res = await updateAdminPassword(currentPassword, newPassword);
      if (!res.success) {
        toast.error(res.error || 'Failed to update password');
        return;
      }

      toast.success('Admin password updated successfully!', {
        description: 'New password has been saved to the database and is now active.',
      });

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      await loadSettings();
    } catch (err: any) {
      toast.error(err.message || 'An error occurred while updating password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Shield className="text-orange-500" size={22} />
          Admin Security & Password
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Manage authentication credentials and access control for the South Zoom Tourism admin dashboard.
        </p>
      </div>

      {/* Security Status Banner */}
      <div
        className={`border rounded-xl p-4.5 flex items-start gap-3.5 ${
          isDefault
            ? 'bg-amber-50 border-amber-200 text-amber-900'
            : 'bg-emerald-50 border-emerald-200 text-emerald-900'
        }`}
      >
        {isDefault ? (
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        ) : (
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
        )}
        <div className="space-y-1">
          <div className="font-semibold text-sm">
            {isDefault ? 'Default Password in Use' : 'Custom Password Active'}
          </div>
          <p className="text-xs opacity-90 leading-relaxed">
            {isDefault
              ? 'Your admin portal is currently using the initial default password. We strongly recommend setting a custom, secure password below.'
              : `Your password was last updated on ${
                  lastUpdated ? new Date(lastUpdated).toLocaleString('en-IN') : 'recently'
                }. All admin logins are protected.`}
          </p>
        </div>
      </div>

      {/* Change Password Card */}
      <Card className="shadow-sm border-gray-200">
        <CardHeader className="border-b bg-gray-50/50 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
              <KeyRound size={18} />
            </div>
            <div>
              <CardTitle className="text-base font-bold">Change Password</CardTitle>
              <CardDescription className="text-xs">
                Enter your existing password and choose a new secure password.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleUpdatePassword} className="space-y-5">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-700">Current Password *</Label>
              <div className="relative max-w-md">
                <Input
                  type={showCurrent ? 'text' : 'password'}
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="pr-10 text-sm"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowCurrent(!showCurrent)}
                  tabIndex={-1}
                >
                  {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <p className="text-[11px] text-gray-400">
                If you have never changed the password before, enter your initial default password.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-700">New Password *</Label>
                <div className="relative">
                  <Input
                    type={showNew ? 'text' : 'password'}
                    placeholder="Minimum 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pr-10 text-sm"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowNew(!showNew)}
                    tabIndex={-1}
                  >
                    {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-700">Confirm New Password *</Label>
                <div className="relative">
                  <Input
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Re-type new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pr-10 text-sm"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowConfirm(!showConfirm)}
                    tabIndex={-1}
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            {newPassword && confirmPassword && (
              <div className="text-xs">
                {newPassword === confirmPassword ? (
                  <span className="text-emerald-600 font-medium flex items-center gap-1.5">
                    <CheckCircle2 size={14} /> Passwords match perfectly
                  </span>
                ) : (
                  <span className="text-red-500 font-medium flex items-center gap-1.5">
                    <AlertTriangle size={14} /> Passwords do not match yet
                  </span>
                )}
              </div>
            )}

            <div className="pt-2 flex items-center gap-3">
              <Button
                type="submit"
                disabled={saving || !currentPassword || !newPassword || newPassword !== confirmPassword}
                className="bg-orange-500 hover:bg-orange-600 text-white font-medium gap-2 px-6"
              >
                {saving ? (
                  <>
                    <Loader2 size={15} className="animate-spin" /> Updating...
                  </>
                ) : (
                  <>
                    <Lock size={15} /> Save New Password
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                }}
                disabled={saving}
              >
                Clear
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Access Information Card */}
      <Card className="shadow-sm border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Clock size={16} className="text-gray-500" />
            Session & Login Information
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-gray-600 space-y-2">
          <div className="flex justify-between py-1.5 border-b">
            <span className="text-gray-500">Default Super Admin Email:</span>
            <span className="font-mono font-medium text-gray-900">admin@southzoom.com</span>
          </div>
          <div className="flex justify-between py-1.5 border-b">
            <span className="text-gray-500">Database Synchronization:</span>
            <span className="text-emerald-600 font-medium flex items-center gap-1">
              <CheckCircle2 size={12} /> Supabase website_settings (admin_security_settings)
            </span>
          </div>
          <div className="flex justify-between py-1.5">
            <span className="text-gray-500">Emergency Recovery Helpline:</span>
            <span className="font-medium text-gray-900">+91 6366357757</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
