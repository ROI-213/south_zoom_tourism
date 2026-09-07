import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Lock, Eye, EyeOff, CheckCircle2, ShieldCheck, Loader2 } from 'lucide-react';
import { updateAdminPassword } from '@/lib/admin-auth';

interface ChangePasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ChangePasswordDialog({ open, onOpenChange, onSuccess }: ChangePasswordDialogProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowCurrent(false);
    setShowNew(false);
    setShowConfirm(false);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!currentPassword) {
      setError('Please enter your current password.');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    setSaving(true);
    try {
      const res = await updateAdminPassword(currentPassword, newPassword);
      if (!res.success) {
        setError(res.error || 'Failed to update password');
        return;
      }

      toast.success('Admin password updated successfully!', {
        description: 'Your new credentials are now active across all administrative sessions.',
      });
      resetForm();
      onOpenChange(false);
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || 'An error occurred while changing password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val) resetForm();
        onOpenChange(val);
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-2 text-orange-600">
            <Lock size={22} />
          </div>
          <DialogTitle className="text-center text-lg font-bold">Change Admin Password</DialogTitle>
          <DialogDescription className="text-center text-xs text-gray-500">
            Update your master password for the South Zoom Tourism administration portal.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3.5 py-2.5 rounded-lg flex items-center gap-2">
              <span className="font-semibold">Error:</span> {error}
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-700">Current Password</Label>
            <div className="relative">
              <Input
                type={showCurrent ? 'text' : 'password'}
                placeholder="Enter current password (default: admin123)"
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
            <p className="text-[11px] text-gray-400">Default initial password is <code className="text-orange-600 font-mono">admin123</code></p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-700">New Password</Label>
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
            <Label className="text-xs font-semibold text-gray-700">Confirm New Password</Label>
            <div className="relative">
              <Input
                type={showConfirm ? 'text' : 'password'}
                placeholder="Re-enter new password"
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
            {newPassword && confirmPassword && (
              <div className="flex items-center gap-1.5 text-[11px]">
                {newPassword === confirmPassword ? (
                  <span className="text-green-600 flex items-center gap-1">
                    <CheckCircle2 size={12} /> Passwords match
                  </span>
                ) : (
                  <span className="text-red-500">Passwords do not match</span>
                )}
              </div>
            )}
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-xs text-orange-800 space-y-1">
            <div className="font-semibold flex items-center gap-1.5">
              <ShieldCheck size={14} /> Security Note:
            </div>
            <p className="text-[11px] leading-relaxed">
              Once saved, the new password is stored securely in the database and must be used for all future administrator logins.
            </p>
          </div>

          <DialogFooter className="pt-2 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving || !currentPassword || !newPassword || newPassword !== confirmPassword}
              className="bg-orange-500 hover:bg-orange-600 text-white font-medium gap-1.5"
            >
              {saving ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Lock size={14} /> Update Password
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
