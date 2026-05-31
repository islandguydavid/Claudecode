'use client';

import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';

const schema = z.object({
  freelancer_name: z.string().min(1, 'Required'),
  business_name: z.string().optional(),
  client_name: z.string().min(1, 'Required'),
  client_email: z.string().email('Invalid email'),
  province: z.string().min(1, 'Required'),
  project_type: z.string().min(1, 'Required'),
  project_description: z.string().min(50, 'Please describe the project in at least 50 characters'),
  fee_structure: z.enum(['hourly', 'fixed']),
  hourly_rate: z.number().optional(),
  estimated_hours: z.number().optional(),
  fixed_price: z.number().optional(),
  payment_terms: z.string().min(1, 'Required'),
  revision_rounds: z.string().min(1, 'Required'),
  kill_fee_pct: z.number().min(1, 'Required'),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const PROVINCES = [
  { value: 'AB', label: 'Alberta' },
  { value: 'BC', label: 'British Columbia' },
  { value: 'MB', label: 'Manitoba' },
  { value: 'NB', label: 'New Brunswick' },
  { value: 'NL', label: 'Newfoundland and Labrador' },
  { value: 'NS', label: 'Nova Scotia' },
  { value: 'NT', label: 'Northwest Territories' },
  { value: 'NU', label: 'Nunavut' },
  { value: 'ON', label: 'Ontario' },
  { value: 'PEI', label: 'Prince Edward Island' },
  { value: 'QC', label: 'Quebec' },
  { value: 'SK', label: 'Saskatchewan' },
  { value: 'YT', label: 'Yukon' },
];

const PROJECT_TYPES = [
  { value: 'web_development', label: 'Web Development' },
  { value: 'graphic_design', label: 'Graphic Design' },
  { value: 'copywriting', label: 'Copywriting' },
  { value: 'photography', label: 'Photography' },
  { value: 'consulting', label: 'Consulting' },
  { value: 'other', label: 'Other' },
];

interface IntakeFormProps {
  defaultValues?: Partial<FormData>;
}

const STEPS = [
  'Your Details',
  'Client Details',
  'Project Info',
  'Fees',
  'Terms',
  'Timeline',
  'Review & Generate',
];

export default function IntakeForm({ defaultValues }: IntakeFormProps) {
  const [step, setStep] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState('');
  const router = useRouter();

  const methods = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      fee_structure: 'fixed',
      payment_terms: defaultValues?.payment_terms || '50_upfront',
      revision_rounds: defaultValues?.revision_rounds || '2',
      kill_fee_pct: defaultValues?.kill_fee_pct || 25,
      ...defaultValues,
    },
  });

  const { register, handleSubmit, watch, formState: { errors }, trigger } = methods;
  const feeStructure = watch('fee_structure');

  const stepFields: (keyof FormData)[][] = [
    ['freelancer_name', 'business_name'],
    ['client_name', 'client_email'],
    ['province', 'project_type', 'project_description'],
    ['fee_structure', 'hourly_rate', 'estimated_hours', 'fixed_price'],
    ['payment_terms', 'revision_rounds', 'kill_fee_pct'],
    ['start_date', 'end_date'],
    [],
  ];

  const nextStep = async () => {
    const fieldsToValidate = stepFields[step].filter((f) => {
      if (f === 'hourly_rate' || f === 'estimated_hours') return feeStructure === 'hourly';
      if (f === 'fixed_price') return feeStructure === 'fixed';
      return true;
    });
    const valid = await trigger(fieldsToValidate as (keyof FormData)[]);
    if (valid) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

  const onSubmit = async (data: FormData) => {
    setGenerating(true);
    setGenError('');

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        setGenError(json.error || 'Generation failed');
        setGenerating(false);
        return;
      }

      router.push(`/dashboard/proposals/${json.id}`);
    } catch {
      setGenError('Network error. Please try again.');
      setGenerating(false);
    }
  };

  const formValues = watch();

  const inputClass =
    'w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm';
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1';
  const errorClass = 'text-red-500 text-xs mt-1';

  return (
    <FormProvider {...methods}>
      <div className="max-w-2xl mx-auto">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">
              Step {step + 1} of {STEPS.length}
            </span>
            <span className="text-sm font-medium text-gray-700">{STEPS[step]}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">{STEPS[step]}</h2>

          {/* Step 0: Your Details */}
          {step === 0 && (
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Your Full Name *</label>
                <input {...register('freelancer_name')} className={inputClass} placeholder="Jane Smith" />
                {errors.freelancer_name && <p className={errorClass}>{errors.freelancer_name.message}</p>}
              </div>
              <div>
                <label className={labelClass}>Business Name (optional)</label>
                <input {...register('business_name')} className={inputClass} placeholder="Smith Creative Studio" />
              </div>
            </div>
          )}

          {/* Step 1: Client Details */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Client Name / Company *</label>
                <input {...register('client_name')} className={inputClass} placeholder="Acme Corp" />
                {errors.client_name && <p className={errorClass}>{errors.client_name.message}</p>}
              </div>
              <div>
                <label className={labelClass}>Client Email *</label>
                <input {...register('client_email')} type="email" className={inputClass} placeholder="client@company.com" />
                {errors.client_email && <p className={errorClass}>{errors.client_email.message}</p>}
              </div>
            </div>
          )}

          {/* Step 2: Project Info */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Province / Territory *</label>
                <select {...register('province')} className={inputClass}>
                  <option value="">Select province...</option>
                  {PROVINCES.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
                {errors.province && <p className={errorClass}>{errors.province.message}</p>}
              </div>
              <div>
                <label className={labelClass}>Project Type *</label>
                <select {...register('project_type')} className={inputClass}>
                  <option value="">Select type...</option>
                  {PROJECT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
                {errors.project_type && <p className={errorClass}>{errors.project_type.message}</p>}
              </div>
              <div>
                <label className={labelClass}>Project Description *</label>
                <textarea
                  {...register('project_description')}
                  className={`${inputClass} h-32 resize-none`}
                  placeholder="Describe the project scope, goals, deliverables, and any specific requirements... (min 50 characters)"
                />
                {errors.project_description && <p className={errorClass}>{errors.project_description.message}</p>}
              </div>
            </div>
          )}

          {/* Step 3: Fees */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Fee Structure *</label>
                <div className="flex gap-4">
                  {(['hourly', 'fixed'] as const).map((v) => (
                    <label key={v} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value={v}
                        {...register('fee_structure')}
                        className="text-blue-600"
                      />
                      <span className="font-medium capitalize">{v === 'hourly' ? 'Hourly Rate' : 'Fixed Price'}</span>
                    </label>
                  ))}
                </div>
              </div>

              {feeStructure === 'hourly' && (
                <>
                  <div>
                    <label className={labelClass}>Hourly Rate ($) *</label>
                    <input
                      {...register('hourly_rate', { valueAsNumber: true })}
                      type="number"
                      min="0"
                      step="0.01"
                      className={inputClass}
                      placeholder="150"
                    />
                    {errors.hourly_rate && <p className={errorClass}>{errors.hourly_rate.message}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>Estimated Hours *</label>
                    <input
                      {...register('estimated_hours', { valueAsNumber: true })}
                      type="number"
                      min="0"
                      step="0.5"
                      className={inputClass}
                      placeholder="40"
                    />
                    {errors.estimated_hours && <p className={errorClass}>{errors.estimated_hours.message}</p>}
                  </div>
                  {formValues.hourly_rate && formValues.estimated_hours && (
                    <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-700 font-medium">
                      Estimated total: ${((formValues.hourly_rate || 0) * (formValues.estimated_hours || 0)).toFixed(2)} CAD (before tax)
                    </div>
                  )}
                </>
              )}

              {feeStructure === 'fixed' && (
                <div>
                  <label className={labelClass}>Fixed Price ($) *</label>
                  <input
                    {...register('fixed_price', { valueAsNumber: true })}
                    type="number"
                    min="0"
                    step="0.01"
                    className={inputClass}
                    placeholder="5000"
                  />
                  {errors.fixed_price && <p className={errorClass}>{errors.fixed_price.message}</p>}
                </div>
              )}
            </div>
          )}

          {/* Step 4: Terms */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Payment Terms *</label>
                <select {...register('payment_terms')} className={inputClass}>
                  <option value="50_upfront">50% upfront + 50% on completion</option>
                  <option value="milestone">Milestone-based</option>
                  <option value="net_30">Net-30</option>
                  <option value="full_upfront">100% upfront</option>
                  <option value="on_completion">100% on completion</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Revision Rounds *</label>
                <select {...register('revision_rounds')} className={inputClass}>
                  <option value="1">1 revision round</option>
                  <option value="2">2 revision rounds</option>
                  <option value="3">3 revision rounds</option>
                  <option value="unlimited">Unlimited revisions</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Kill Fee % *</label>
                <select {...register('kill_fee_pct', { valueAsNumber: true })} className={inputClass}>
                  <option value={10}>10% of project value</option>
                  <option value={20}>20% of project value</option>
                  <option value={25}>25% of project value</option>
                  <option value={30}>30% of project value</option>
                </select>
                <p className="text-xs text-gray-400 mt-1">
                  Charged if client cancels after work has begun
                </p>
              </div>
            </div>
          )}

          {/* Step 5: Timeline */}
          {step === 5 && (
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Project Start Date</label>
                <input {...register('start_date')} type="date" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Estimated End Date</label>
                <input {...register('end_date')} type="date" className={inputClass} />
              </div>
            </div>
          )}

          {/* Step 6: Review */}
          {step === 6 && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <span className="text-gray-500">Freelancer</span>
                  <span className="font-medium">{formValues.freelancer_name}</span>
                  {formValues.business_name && (
                    <>
                      <span className="text-gray-500">Business</span>
                      <span className="font-medium">{formValues.business_name}</span>
                    </>
                  )}
                  <span className="text-gray-500">Client</span>
                  <span className="font-medium">{formValues.client_name}</span>
                  <span className="text-gray-500">Client Email</span>
                  <span className="font-medium">{formValues.client_email}</span>
                  <span className="text-gray-500">Province</span>
                  <span className="font-medium">{formValues.province}</span>
                  <span className="text-gray-500">Project Type</span>
                  <span className="font-medium capitalize">{formValues.project_type?.replace('_', ' ')}</span>
                  <span className="text-gray-500">Fee Structure</span>
                  <span className="font-medium capitalize">{formValues.fee_structure}</span>
                  {formValues.fee_structure === 'hourly' && (
                    <>
                      <span className="text-gray-500">Rate</span>
                      <span className="font-medium">${formValues.hourly_rate}/hr × {formValues.estimated_hours}h</span>
                    </>
                  )}
                  {formValues.fee_structure === 'fixed' && (
                    <>
                      <span className="text-gray-500">Fixed Price</span>
                      <span className="font-medium">${formValues.fixed_price}</span>
                    </>
                  )}
                  <span className="text-gray-500">Payment Terms</span>
                  <span className="font-medium">{formValues.payment_terms?.replace(/_/g, ' ')}</span>
                  <span className="text-gray-500">Revisions</span>
                  <span className="font-medium">{formValues.revision_rounds}</span>
                  <span className="text-gray-500">Kill Fee</span>
                  <span className="font-medium">{formValues.kill_fee_pct}%</span>
                  {formValues.start_date && (
                    <>
                      <span className="text-gray-500">Timeline</span>
                      <span className="font-medium">{formValues.start_date} → {formValues.end_date}</span>
                    </>
                  )}
                </div>
              </div>

              {genError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {genError}
                </div>
              )}

              {generating && (
                <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-4 rounded-lg text-center">
                  <div className="flex items-center justify-center gap-3">
                    <svg className="animate-spin h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span className="font-medium">✨ Generating your proposal, contract & invoice...</span>
                  </div>
                  <p className="text-sm text-blue-500 mt-2">This usually takes 15–30 seconds</p>
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={prevStep}
              disabled={step === 0}
              className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-30 transition-colors"
            >
              Back
            </button>

            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-6 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                Continue
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit(onSubmit)}
                disabled={generating}
                className="px-6 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {generating ? 'Generating...' : '✨ Generate Documents'}
              </button>
            )}
          </div>
        </div>
      </div>
    </FormProvider>
  );
}
