import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useSermons } from '@/hooks/useSermons';
import { useSeries } from '@/hooks/useSeries';
import { Sermon } from '@/types';

interface EditSermonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  sermon: Sermon;
}

export default function EditSermonModal({ isOpen, onClose, onSuccess, sermon }: EditSermonModalProps) {
  const { updateSermon } = useSermons();
  const { series, loading: loadingSeries } = useSeries();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    speaker: '',
    date: '',
    series: '',
    isPartOfSeries: false,
    description: '',
    audioFile: null as File | null,
    thumbnail: null as File | null,
  });

  useEffect(() => {
    if (isOpen) {
      const d = new Date(sermon.date);
      const date = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
      const matchedSeries = series.find(s => s.name === sermon.series_name);
      setFormData({
        title: sermon.title,
        speaker: sermon.speaker,
        date,
        series: matchedSeries?.id || '',
        isPartOfSeries: !!sermon.series_name,
        description: sermon.description || '',
        audioFile: null,
        thumbnail: null,
      });
      setStep(1);
    }
  }, [isOpen, sermon, series]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const target = e.target;
    const value = target.type === 'checkbox' ? (target as HTMLInputElement).checked : target.value;
    setFormData(prev => ({ ...prev, [target.name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'audioFile' | 'thumbnail') => {
    setFormData(prev => ({ ...prev, [field]: e.target.files?.[0] || null }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) { setStep(2); return; }
    setLoading(true);
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('speaker', formData.speaker);
      data.append('date', formData.date);
      data.append('description', formData.description);
      data.append('series_id', formData.isPartOfSeries && formData.series ? formData.series : '');
      if (formData.audioFile) data.append('audio', formData.audioFile);
      if (formData.thumbnail) data.append('thumbnail', formData.thumbnail);
      await updateSermon(sermon.id, data);
      onSuccess?.();
      onClose();
    } catch {
      toast.error('Failed to update sermon. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        <div className="relative bg-white rounded-xl text-left shadow-2xl w-full max-w-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Edit Sermon</h3>
              <p className="text-sm text-gray-500 mt-1">Step {step} of 2: {step === 1 ? 'Replace Files (optional)' : 'Sermon Details'}</p>
            </div>
            <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 cursor-pointer">
              <i className="ri-close-line text-2xl"></i>
            </button>
          </div>

          {/* Step indicator */}
          <div className="mb-6 flex items-center">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
              {step > 1 ? <i className="ri-check-line"></i> : '1'}
            </div>
            <div className={`flex-1 h-1 mx-2 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>2</div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {step === 1 && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Replace Audio File <span className="text-gray-400 font-normal">(optional)</span></label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 bg-gray-50">
                    <input type="file" accept="audio/*" onChange={(e) => handleFileChange(e, 'audioFile')} className="hidden" id="audio-upload" />
                    <label htmlFor="audio-upload" className="cursor-pointer block text-center">
                      <i className="ri-upload-cloud-line text-gray-400 text-3xl mb-2"></i>
                      <p className="text-sm text-gray-600">{formData.audioFile ? formData.audioFile.name : sermon.audio_url ? `Current: ${sermon.audio_url.split('/').pop()}` : 'Click to upload audio'}</p>
                      <p className="text-xs text-gray-500 mt-1">MP3, WAV supported</p>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Replace Thumbnail <span className="text-gray-400 font-normal">(optional)</span></label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 bg-gray-50">
                    <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'thumbnail')} className="hidden" id="thumbnail-upload" />
                    <label htmlFor="thumbnail-upload" className="cursor-pointer block text-center">
                      <i className="ri-image-line text-gray-400 text-3xl mb-2"></i>
                      <p className="text-sm text-gray-600">{formData.thumbnail ? formData.thumbnail.name : sermon.thumbnail_url ? `Current: ${sermon.thumbnail_url.split('/').pop()}` : 'Click to upload thumbnail'}</p>
                      <p className="text-xs text-gray-500 mt-1">JPG, PNG supported</p>
                    </label>
                  </div>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Sermon Title *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><i className="ri-book-open-line text-gray-400"></i></div>
                    <input type="text" name="title" required value={formData.title} onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter sermon title" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Speaker *</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><i className="ri-user-voice-line text-gray-400"></i></div>
                      <input type="text" name="speaker" required value={formData.speaker} onChange={handleChange}
                        className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Speaker name" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Sermon Date *</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><i className="ri-calendar-line text-gray-400"></i></div>
                      <input type="date" name="date" required value={formData.date} onChange={handleChange}
                        className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" name="isPartOfSeries" checked={formData.isPartOfSeries} onChange={handleChange}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span className="text-sm font-medium text-gray-700">Part of a series</span>
                  </label>
                </div>
                {formData.isPartOfSeries && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Series</label>
                    <select name="series" value={formData.series} onChange={handleChange} required={formData.isPartOfSeries} disabled={loadingSeries}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                      <option value="">{loadingSeries ? 'Loading...' : 'Select a series'}</option>
                      {series.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                  <textarea name="description" rows={3} maxLength={500} value={formData.description} onChange={handleChange}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Brief description..." />
                  <p className="text-xs text-gray-500 mt-1">{formData.description.length}/500</p>
                </div>
              </>
            )}

            <div className="flex justify-between pt-6 border-t border-gray-200">
              <button type="button" onClick={() => step === 1 ? onClose() : setStep(1)}
                className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer whitespace-nowrap">
                {step === 1 ? 'Cancel' : 'Back'}
              </button>
              <button type="submit" disabled={loading}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-sm cursor-pointer whitespace-nowrap disabled:opacity-50 transition-all">
                {step === 1 ? (
                  <span className="flex items-center">Next Step <i className="ri-arrow-right-line ml-2"></i></span>
                ) : loading ? (
                  <span className="flex items-center"><i className="ri-loader-4-line animate-spin mr-2"></i>Saving...</span>
                ) : (
                  <span className="flex items-center"><i className="ri-save-line mr-2"></i>Save Changes</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
