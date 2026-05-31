'use client';

import { useEffect, useState, useRef } from 'react';
import { HexColorPicker } from 'react-colorful';
import LivePreview from '@/components/LivePreview';
import { createClient } from '@/lib/supabase/client';

interface BrandingValues {
  business_name: string;
  tagline: string;
  website_url: string;
  logo_url: string;
  primary_color: string;
  secondary_color: string;
  bg_color: string;
  font_choice: string;
  default_payment_terms: string;
  default_kill_fee: number;
  default_revision_rounds: string;
  default_late_penalty: number;
  custom_footer: string;
  email_sender_name: string;
  email_signature: string;
  thank_you_message: string;
}

const DEFAULT_VALUES: BrandingValues = {
  business_name: '',
  tagline: '',
  website_url: '',
  logo_url: '',
  primary_color: '#2563EB',
  secondary_color: '#64748B',
  bg_color: '#FFFFFF',
  font_choice: 'Inter',
  default_payment_terms: '50_upfront',
  default_kill_fee: 25,
  default_revision_rounds: '2',
  default_late_penalty: 2.0,
  custom_footer: '',
  email_sender_name: '',
  email_signature: '',
  thank_you_message: '',
};

const FONTS = ['Inter', 'Merriweather', 'Playfair Display', 'Roboto', 'Lato'];

interface ColorPickerFieldProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
}

function ColorPickerField({ label, value, onChange }: ColorPickerFieldProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex items-center gap-3 border border-gray-300 rounded-lg px-3 py-2 w-full hover:border-gray-400 transition-colors"
        >
          <div
            className="w-6 h-6 rounded-md border border-gray-200 flex-shrink-0"
            style={{ background: value }}
          />
          <span className="text-sm font-mono text-gray-700">{value}</span>
        </button>
        {open && (
          <div className="absolute top-full left-0 mt-2 z-50 shadow-xl rounded-xl overflow-hidden border border-gray-100">
            <HexColorPicker color={value} onChange={onChange} />
            <div className="bg-white px-3 py-2">
              <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full text-sm font-mono border border-gray-200 rounded px-2 py-1"
                maxLength={7}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [values, setValues] = useState<BrandingValues>(DEFAULT_VALUES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const loadProfile = async () => {
      const res = await fetch('/api/branding');
      const json = await res.json();
      if (json.profile) {
        setValues({ ...DEFAULT_VALUES, ...json.profile });
      }
      setLoading(false);
    };
    loadProfile();
  }, []);

  const handleChange = (field: keyof BrandingValues, value: string | number) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setUploadingLogo(false);
      return;
    }

    const path = `${user.id}/logo.${file.name.split('.').pop()}`;
    const { error } = await supabase.storage.from('logos').upload(path, file, { upsert: true });

    if (!error) {
      const { data } = supabase.storage.from('logos').getPublicUrl(path);
      handleChange('logo_url', data.publicUrl);
    }
    setUploadingLogo(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg('');

    const res = await fetch('/api/branding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });

    const json = await res.json();

    if (res.ok) {
      setSaveMsg('Settings saved!');
      setTimeout(() => setSaveMsg(''), 3000);
    } else {
      setSaveMsg(json.error || 'Failed to save');
    }
    setSaving(false);
  };

  const inputClass =
    'w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm';
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1';
  const sectionClass = 'bg-white rounded-xl border border-gray-100 p-6 space-y-4 mb-4';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Branding Settings</h1>
          <p className="text-gray-500 mt-1">Customize your documents with your brand identity</p>
        </div>
        <div className="flex items-center gap-3">
          {saveMsg && (
            <span
              className={`text-sm font-medium ${saveMsg.includes('saved') ? 'text-green-600' : 'text-red-500'}`}
            >
              {saveMsg}
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left: Form */}
        <div>
          {/* Logo & Identity */}
          <div className={sectionClass}>
            <h2 className="font-bold text-gray-900 text-base">Logo & Identity</h2>
            <div>
              <label className={labelClass}>Business Logo</label>
              {values.logo_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={values.logo_url} alt="Logo" className="h-12 mb-3 object-contain" />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                disabled={uploadingLogo}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 file:font-semibold hover:file:bg-blue-100"
              />
              {uploadingLogo && <p className="text-xs text-gray-400 mt-1">Uploading...</p>}
            </div>
            <div>
              <label className={labelClass}>Business Name</label>
              <input
                value={values.business_name}
                onChange={(e) => handleChange('business_name', e.target.value)}
                className={inputClass}
                placeholder="Smith Creative Studio"
              />
            </div>
            <div>
              <label className={labelClass}>Tagline</label>
              <input
                value={values.tagline}
                onChange={(e) => handleChange('tagline', e.target.value)}
                className={inputClass}
                placeholder="Design that converts"
              />
            </div>
            <div>
              <label className={labelClass}>Website URL</label>
              <input
                value={values.website_url}
                onChange={(e) => handleChange('website_url', e.target.value)}
                className={inputClass}
                placeholder="https://smithcreative.ca"
              />
            </div>
          </div>

          {/* Colors */}
          <div className={sectionClass}>
            <h2 className="font-bold text-gray-900 text-base">Colors</h2>
            <ColorPickerField
              label="Primary Color"
              value={values.primary_color}
              onChange={(c) => handleChange('primary_color', c)}
            />
            <ColorPickerField
              label="Secondary Color"
              value={values.secondary_color}
              onChange={(c) => handleChange('secondary_color', c)}
            />
            <ColorPickerField
              label="Background Color"
              value={values.bg_color}
              onChange={(c) => handleChange('bg_color', c)}
            />
          </div>

          {/* Font */}
          <div className={sectionClass}>
            <h2 className="font-bold text-gray-900 text-base">Typography</h2>
            <div>
              <label className={labelClass}>Font</label>
              <select
                value={values.font_choice}
                onChange={(e) => handleChange('font_choice', e.target.value)}
                className={inputClass}
              >
                {FONTS.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Document Defaults */}
          <div className={sectionClass}>
            <h2 className="font-bold text-gray-900 text-base">Document Defaults</h2>
            <div>
              <label className={labelClass}>Default Payment Terms</label>
              <select
                value={values.default_payment_terms}
                onChange={(e) => handleChange('default_payment_terms', e.target.value)}
                className={inputClass}
              >
                <option value="50_upfront">50% upfront + 50% on completion</option>
                <option value="milestone">Milestone-based</option>
                <option value="net_30">Net-30</option>
                <option value="full_upfront">100% upfront</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Default Kill Fee %</label>
              <select
                value={values.default_kill_fee}
                onChange={(e) => handleChange('default_kill_fee', Number(e.target.value))}
                className={inputClass}
              >
                {[10, 20, 25, 30].map((v) => (
                  <option key={v} value={v}>{v}%</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Default Revision Rounds</label>
              <select
                value={values.default_revision_rounds}
                onChange={(e) => handleChange('default_revision_rounds', e.target.value)}
                className={inputClass}
              >
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="unlimited">Unlimited</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Late Payment Penalty (% per month)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={values.default_late_penalty}
                onChange={(e) => handleChange('default_late_penalty', Number(e.target.value))}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Custom Footer Text</label>
              <textarea
                value={values.custom_footer}
                onChange={(e) => handleChange('custom_footer', e.target.value)}
                className={`${inputClass} h-20 resize-none`}
                placeholder="Thank you for your business. Payment is due within 30 days."
              />
            </div>
          </div>

          {/* Email Branding */}
          <div className={sectionClass}>
            <h2 className="font-bold text-gray-900 text-base">Email Branding</h2>
            <div>
              <label className={labelClass}>Email Sender Name</label>
              <input
                value={values.email_sender_name}
                onChange={(e) => handleChange('email_sender_name', e.target.value)}
                className={inputClass}
                placeholder="Jane at Smith Creative"
              />
            </div>
            <div>
              <label className={labelClass}>Email Signature</label>
              <textarea
                value={values.email_signature}
                onChange={(e) => handleChange('email_signature', e.target.value)}
                className={`${inputClass} h-20 resize-none`}
                placeholder="Jane Smith | Smith Creative Studio | jane@smithcreative.ca"
              />
            </div>
            <div>
              <label className={labelClass}>Thank You Message (shown after payment)</label>
              <textarea
                value={values.thank_you_message}
                onChange={(e) => handleChange('thank_you_message', e.target.value)}
                className={`${inputClass} h-20 resize-none`}
                placeholder="Thank you so much! Looking forward to working with you."
              />
            </div>
          </div>
        </div>

        {/* Right: Live Preview */}
        <div>
          <LivePreview values={values} />
        </div>
      </div>
    </div>
  );
}
