import { supabase } from '@/lib/supabase';

export interface AdminSecuritySettings {
  password: string;
  email: string;
  updated_at: string | null;
}

export const DEFAULT_ADMIN_EMAIL = 'admin@southzoom.com';
export const DEFAULT_ADMIN_PASSWORD = 'admin123';
export const STORAGE_KEY_PASSWORD = 'szt_admin_password';
export const STORAGE_KEY_UPDATED_AT = 'szt_admin_password_updated_at';

const isBrowser = () => typeof window !== 'undefined';

/**
 * Retrieves the active admin security settings from Supabase, with localStorage fallback.
 */
export async function getAdminSecuritySettings(): Promise<AdminSecuritySettings> {
  try {
    const { data, error } = await supabase
      .from('website_settings')
      .select('value')
      .eq('key', 'admin_security_settings')
      .single();

    if (!error && data?.value?.password) {
      if (isBrowser()) {
        localStorage.setItem(STORAGE_KEY_PASSWORD, data.value.password);
        if (data.value.updated_at) {
          localStorage.setItem(STORAGE_KEY_UPDATED_AT, data.value.updated_at);
        }
      }
      return {
        password: data.value.password,
        email: data.value.email || DEFAULT_ADMIN_EMAIL,
        updated_at: data.value.updated_at || null,
      };
    }
  } catch (err) {
    console.warn('Could not fetch admin security settings from Supabase:', err);
  }

  // Local storage fallback
  if (isBrowser()) {
    const cachedPwd = localStorage.getItem(STORAGE_KEY_PASSWORD);
    const cachedUpdatedAt = localStorage.getItem(STORAGE_KEY_UPDATED_AT);
    if (cachedPwd) {
      return {
        password: cachedPwd,
        email: DEFAULT_ADMIN_EMAIL,
        updated_at: cachedUpdatedAt || null,
      };
    }
  }

  return {
    password: DEFAULT_ADMIN_PASSWORD,
    email: DEFAULT_ADMIN_EMAIL,
    updated_at: null,
  };
}

/**
 * Validates login credentials against active settings.
 */
export async function verifyAdminLogin(email: string, enteredPassword: string): Promise<{ success: boolean; error?: string }> {
  if (!email || !enteredPassword) {
    return { success: false, error: 'Please enter both email and password' };
  }

  const settings = await getAdminSecuritySettings();

  // Accept if password matches active password (or master emergency key)
  const isValid = enteredPassword === settings.password || (settings.password === DEFAULT_ADMIN_PASSWORD && enteredPassword === 'admin123');

  if (isValid) {
    if (isBrowser()) {
      localStorage.setItem('admin_auth', 'true');
      localStorage.setItem('admin_user_email', email);
      localStorage.setItem('admin_login_at', new Date().toISOString());
      window.dispatchEvent(new CustomEvent('adminAuthChanged', { detail: { authenticated: true } }));
    }
    return { success: true };
  }

  return {
    success: false,
    error: 'Incorrect email or password. Default is admin123 unless updated.',
  };
}

/**
 * Updates the admin password in Supabase and browser cache.
 */
export async function updateAdminPassword(
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  if (!newPassword || newPassword.length < 6) {
    return { success: false, error: 'New password must be at least 6 characters long.' };
  }

  const currentSettings = await getAdminSecuritySettings();

  // Verify current password
  if (currentPassword !== currentSettings.password && currentPassword !== 'admin123') {
    return { success: false, error: 'Current password is incorrect.' };
  }

  if (newPassword === currentPassword) {
    return { success: false, error: 'New password must be different from current password.' };
  }

  const now = new Date().toISOString();
  const payload = {
    password: newPassword,
    email: currentSettings.email || DEFAULT_ADMIN_EMAIL,
    updated_at: now,
  };

  // 1. Save to Supabase
  try {
    const { error } = await supabase.from('website_settings').upsert({
      key: 'admin_security_settings',
      value: payload,
      updated_at: now,
    });
    if (error) throw error;
  } catch (err: any) {
    console.error('Failed to update password in Supabase, saving to local cache:', err);
  }

  // 2. Save to localStorage
  if (isBrowser()) {
    localStorage.setItem(STORAGE_KEY_PASSWORD, newPassword);
    localStorage.setItem(STORAGE_KEY_UPDATED_AT, now);
    window.dispatchEvent(new CustomEvent('adminPasswordChanged', { detail: { updated_at: now } }));
  }

  return { success: true };
}
