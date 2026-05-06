'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

export function OnboardForm() {
  const searchParams = useSearchParams();
  const draftIdParam = searchParams.get('draft_id');

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [draftSuccess, setDraftSuccess] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    businessName: '',
    ownerName: '',
    industry: '',
    existingPhone: '',
    ownerEmail: '',
    ownerMobile: '',
    newNumber: false,
    serviceTypes: '',
    operatingHours: '',
    callVolume: '',
    faqs: '',
    callbackOffer: '',
    callbackSlots: '',
    escalation: '',
    infoCapture: '',
    summaryEmail: '',
    summaryDetails: '',
    customerConfirm: false,
    successMetrics: '',
    notes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  useEffect(() => {
    if (!draftIdParam) return;

    async function loadDraft() {
      try {
        const response = await fetch(`/api/drafts/${draftIdParam}`);
        if (!response.ok) throw new Error('Draft not found');
        const draft = await response.json();
        setFormData(draft);
        setDraftId(draftIdParam);
      } catch (error) {
        console.error('Error loading draft:', error);
        alert('Could not load draft. It may have expired.');
      }
    }

    loadDraft();
  }, [draftIdParam]);

  const handleSaveDraft = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setSaving(true);

    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      if (draftId) {
        const { error } = await supabase
          .from('businesses')
          .update(formData)
          .eq('draft_id', draftId);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('businesses')
          .insert([{ ...formData, status: 'draft' }])
          .select('draft_id')
          .single();

        if (error) throw error;
        setDraftId(data.draft_id);
      }

      setDraftSuccess(true);
      setTimeout(() => setDraftSuccess(false), 4000);
    } catch (error) {
      console.error('Error saving draft:', error);
      alert('Error saving draft. Check console.');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      if (draftId) {
        const { error } = await supabase
          .from('businesses')
          .update({ ...formData, status: 'completed' })
          .eq('draft_id', draftId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('businesses')
          .insert([{ ...formData, status: 'completed' }]);

        if (error) throw error;
      }

      setSuccess(true);
      setDraftId(null);
      setFormData({
        businessName: '',
        ownerName: '',
        industry: '',
        existingPhone: '',
        ownerEmail: '',
        ownerMobile: '',
        newNumber: false,
        serviceTypes: '',
        operatingHours: '',
        callVolume: '',
        faqs: '',
        callbackOffer: '',
        callbackSlots: '',
        escalation: '',
        infoCapture: '',
        summaryEmail: '',
        summaryDetails: '',
        customerConfirm: false,
        successMetrics: '',
        notes: '',
      });

      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving business:', error);
      alert('Error saving business. Check console.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Backbone Labs</h1>
          <p className="text-lg text-slate-600">Business Onboarding</p>
        </div>

        {success && (
          <div className="mb-6 p-4 bg-green-100 text-green-800 rounded-lg border border-green-200">
            ✓ Business saved successfully
          </div>
        )}

        {draftSuccess && (
          <div className="mb-6 p-4 bg-blue-100 text-blue-800 rounded-lg border border-blue-200 flex justify-between items-center">
            <span>✓ Draft saved</span>
            {draftId && (
              <button
                onClick={() => {
                  const url = `${window.location.origin}/onboard?draft_id=${draftId}`;
                  navigator.clipboard.writeText(url);
                  alert('Draft link copied to clipboard');
                }}
                className="text-sm underline hover:no-underline"
              >
                Copy draft link
              </button>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8 space-y-8">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 mb-6">Business Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Business name</label>
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  placeholder="e.g. Mini Marshmallows"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Owner name</label>
                <input
                  type="text"
                  name="ownerName"
                  value={formData.ownerName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Industry/vertical</label>
                <input
                  type="text"
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  placeholder="e.g. Party planning, Florist"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Existing business phone</label>
                <input
                  type="tel"
                  name="existingPhone"
                  value={formData.existingPhone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Owner email</label>
                <input
                  type="email"
                  name="ownerEmail"
                  value={formData.ownerEmail}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Owner mobile</label>
                <input
                  type="tel"
                  name="ownerMobile"
                  value={formData.ownerMobile}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="newNumber"
                  checked={formData.newNumber}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-slate-300"
                />
                <span className="text-sm font-medium text-slate-700">Backbone phone number needed (new)?</span>
              </label>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-slate-900 mb-6">Service Details</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Service types offered</label>
                <textarea
                  name="serviceTypes"
                  value={formData.serviceTypes}
                  onChange={handleChange}
                  placeholder="e.g. Event planning, Florist, Consultation, Booking"
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Operating hours</label>
                  <input
                    type="text"
                    name="operatingHours"
                    value={formData.operatingHours}
                    onChange={handleChange}
                    placeholder="e.g. Mon-Fri 9am-6pm, Sat 10am-4pm"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Expected call volume per week</label>
                  <input
                    type="text"
                    name="callVolume"
                    value={formData.callVolume}
                    onChange={handleChange}
                    placeholder="e.g. 15-20 calls"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Common customer questions (FAQs)</label>
                <textarea
                  name="faqs"
                  value={formData.faqs}
                  onChange={handleChange}
                  placeholder="e.g. What's included? How much notice needed? Can we customise?"
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-slate-900 mb-6">Call Handling</h2>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Should agent offer callbacks? (Y/N)</label>
                  <input
                    type="text"
                    name="callbackOffer"
                    value={formData.callbackOffer}
                    onChange={handleChange}
                    placeholder="Yes / No"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Should calls be escalated to owner? (Y/N)</label>
                  <input
                    type="text"
                    name="escalation"
                    value={formData.escalation}
                    onChange={handleChange}
                    placeholder="Yes / No"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Available callback time slots</label>
                <textarea
                  name="callbackSlots"
                  value={formData.callbackSlots}
                  onChange={handleChange}
                  placeholder="e.g. Monday 9am-12pm, Tuesday 2-5pm, Friday 10am-1pm"
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">What information should be captured on each call?</label>
                <textarea
                  name="infoCapture"
                  value={formData.infoCapture}
                  onChange={handleChange}
                  placeholder="e.g. Name, email, phone, service type, event date, budget, special requests"
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-slate-900 mb-6">Communication & Summaries</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Send call summaries to this email</label>
                <input
                  type="email"
                  name="summaryEmail"
                  value={formData.summaryEmail}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">What details should each summary include?</label>
                <textarea
                  name="summaryDetails"
                  value={formData.summaryDetails}
                  onChange={handleChange}
                  placeholder="e.g. Transcript, caller details, booking confirmation, follow-up actions"
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="customerConfirm"
                  checked={formData.customerConfirm}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-slate-300"
                />
                <span className="text-sm font-medium text-slate-700">Send customers confirmation (SMS/email) after booking?</span>
              </label>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-slate-900 mb-6">Success Metrics</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">How will success be measured?</label>
                <textarea
                  name="successMetrics"
                  value={formData.successMetrics}
                  onChange={handleChange}
                  placeholder="e.g. Calls answered, bookings captured, customer satisfaction"
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Additional notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Any other important details..."
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              onClick={handleSaveDraft}
              disabled={saving}
              className="flex-1 bg-slate-200 hover:bg-slate-300 disabled:opacity-50 text-slate-900 font-semibold py-3 px-6 rounded-lg transition"
            >
              {saving ? 'Saving draft...' : 'Save draft'}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-lg transition"
            >
              {loading ? 'Submitting...' : 'Submit'}
            </button>
            <button
              type="reset"
              className="px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-900 font-semibold rounded-lg transition"
            >
              Clear
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
