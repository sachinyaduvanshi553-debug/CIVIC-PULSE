'use client';

import React, { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useCivicStore } from '@/store/useCivicStore';
import { SeverityLevel, Complaint } from '@/types';
import { calculateDeterministicPriority, getPriorityBadgeInfo } from '@/lib/utils';
import { 
  MapPin,
  Camera,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Upload,
  X,
  Navigation,
  ExternalLink,
  CheckCircle,
  FileCheck,
  Film,
  Image as ImageIcon,
  Search,
  AlertTriangle
} from 'lucide-react';

interface MediaItem {
  id: string;
  url: string;
  type: 'image' | 'video';
  name: string;
}

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

export const ReportIssueWizard: React.FC = () => {
  const router = useRouter();
  const { categories, reportComplaint, emergencyAlert } = useCivicStore();

  const [step, setStep] = useState(1);
  const [selectedCategoryId, setSelectedCategoryId] = useState(categories[0]?.id || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<SeverityLevel>('HIGH');
  const [affectedCount, setAffectedCount] = useState(100);

  // Location States — MUST be selected before submit is enabled
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [locationDetected, setLocationDetected] = useState(false);
  const [locationError, setLocationError] = useState('');

  // Address search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<NominatimResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Media upload
  const [uploadedMedia, setUploadedMedia] = useState<MediaItem[]>([]);
  const [photoUrl, setPhotoUrl] = useState('https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80');

  // Success modal
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submittedComplaint, setSubmittedComplaint] = useState<Complaint | null>(null);

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId) || categories[0];

  const livePriority = calculateDeterministicPriority(
    selectedCategory ? selectedCategory.categoryWeight : 1.5,
    severity,
    affectedCount,
    !!emergencyAlert
  );

  // ── File Upload ──────────────────────────────────────────────────────────────
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => {
      const isVideo = file.type.startsWith('video/');
      const isImage = file.type.startsWith('image/');
      if (!isImage && !isVideo) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setUploadedMedia((prev) => [
            ...prev,
            {
              id: `media-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              url: result,
              type: isVideo ? 'video' : 'image',
              name: file.name,
            },
          ]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeMediaItem = (id: string) =>
    setUploadedMedia((prev) => prev.filter((item) => item.id !== id));

  // ── GPS Detect Current Location ──────────────────────────────────────────────
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    setLocationError('');
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = parseFloat(position.coords.latitude.toFixed(6));
        const lng = parseFloat(position.coords.longitude.toFixed(6));
        setLatitude(lat);
        setLongitude(lng);
        setIsLocating(false);
        setLocationDetected(true);
        setLocationError('');
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
          );
          const data = await res.json();
          if (data?.display_name) {
            setAddress(data.display_name.split(',').slice(0, 5).join(', '));
            setSearchQuery(data.display_name.split(',').slice(0, 3).join(', '));
          } else {
            setAddress(`GPS: ${lat}, ${lng}`);
          }
        } catch {
          setAddress(`GPS: ${lat}, ${lng}`);
        }
      },
      (err) => {
        setIsLocating(false);
        setLocationError(`Could not get your location: ${err.message}. Please search or pick from the map.`);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // ── Address Text Search (Nominatim) ──────────────────────────────────────────
  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    if (!q.trim() || q.length < 3) { setSearchResults([]); return; }
    setIsSearching(true);
    searchDebounce.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=6&countrycodes=in`
        );
        const data: NominatimResult[] = await res.json();
        setSearchResults(data);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500);
  };

  const handleSelectSearchResult = (result: NominatimResult) => {
    const lat = parseFloat(parseFloat(result.lat).toFixed(6));
    const lng = parseFloat(parseFloat(result.lon).toFixed(6));
    setLatitude(lat);
    setLongitude(lng);
    setAddress(result.display_name.split(',').slice(0, 5).join(', '));
    setSearchQuery(result.display_name.split(',').slice(0, 3).join(', '));
    setLocationDetected(true);
    setLocationError('');
    setSearchResults([]);
  };

  // ── Location Presets ──────────────────────────────────────────────────────────
  const locationPresets = [
    { name: 'Mansarovar', lat: 26.8548, lng: 75.7645, addr: 'Madhyam Marg, Mansarovar Sector 4, Jaipur' },
    { name: 'Malviya Nagar', lat: 26.8521, lng: 75.8142, addr: 'Near Calgiri Hospital, Malviya Nagar, Jaipur' },
    { name: 'C-Scheme', lat: 26.9089, lng: 75.8016, addr: 'Ashok Marg, C-Scheme, Jaipur' },
    { name: 'Vaishali Nagar', lat: 26.9065, lng: 75.736, addr: 'Amrapali Circle, Vaishali Nagar, Jaipur' },
    { name: 'Pink City', lat: 26.9205, lng: 75.8257, addr: 'Johari Bazar, Old City, Jaipur' },
  ];

  // ── Submit (only works if location is set) ────────────────────────────────────
  const isLocationSet = latitude !== null && longitude !== null && address.trim().length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;
    if (!isLocationSet) {
      setLocationError('⚠️ Please select a location before submitting.');
      return;
    }

    const imageList: string[] = [];
    const videoList: string[] = [];
    if (photoUrl) imageList.push(photoUrl);
    uploadedMedia.forEach((m) => {
      if (m.type === 'image') imageList.push(m.url);
      else videoList.push(m.url);
    });

    const created = reportComplaint({
      title,
      description,
      categoryId: selectedCategoryId,
      severity,
      affectedCount,
      latitude: latitude!,
      longitude: longitude!,
      address,
      landmark,
      images: imageList,
      videos: videoList,
    });

    setSubmittedComplaint(created);
    setShowSuccessModal(true);
  };

  const handleResetForm = () => {
    setShowSuccessModal(false);
    setSubmittedComplaint(null);
    setStep(1);
    setTitle('');
    setDescription('');
    setUploadedMedia([]);
    setLatitude(null);
    setLongitude(null);
    setAddress('');
    setLandmark('');
    setLocationDetected(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <div className="relative">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden max-w-3xl mx-auto">
        {/* ── Wizard Header ─────────────────────────────────────────────────── */}
        <div className="bg-slate-900 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold tracking-tight">Report Civic Problem</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Upload photo/video evidence • Pin exact location • Submit to Municipal Command
              </p>
            </div>
            <span className="text-xs font-bold bg-slate-800 text-sky-400 px-3 py-1 rounded-full border border-slate-700">
              Step {step} of 3
            </span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-4 overflow-hidden">
            <div
              className="bg-sky-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>

          {/* Step labels */}
          <div className="flex items-center justify-between mt-3 text-[10px] font-semibold">
            {['Category & Severity', 'Problem & Media', 'Location & Submit'].map((label, i) => (
              <span key={i} className={i + 1 === step ? 'text-sky-400' : 'text-slate-600'}>
                {i + 1}. {label}
              </span>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* ────── STEP 1: Category & Severity ──────────────────────────────── */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                  Select Problem Category
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategoryId(cat.id)}
                      className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between h-24 ${
                        selectedCategoryId === cat.id
                          ? 'border-sky-600 bg-sky-50/80 ring-2 ring-sky-200 text-sky-950 font-bold'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span className="text-xs font-bold line-clamp-2">{cat.name}</span>
                      <span className="text-[10px] text-slate-500">SLA: {cat.slaHours}h</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Severity Level
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as SeverityLevel[]).map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setSeverity(lvl)}
                        className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                          severity === lvl
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Citizens Affected
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10000"
                    value={affectedCount}
                    onChange={(e) => setAffectedCount(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              {/* Live Priority Box */}
              <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-sky-600 animate-spin" />
                  <div>
                    <h4 className="text-xs font-bold text-sky-950">Deterministic Priority Engine</h4>
                    <p className="text-[11px] text-sky-700">
                      Weight ({selectedCategory?.categoryWeight}) × Severity ({severity}) × Affected ({affectedCount})
                    </p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-lg text-xs font-black ${getPriorityBadgeInfo(livePriority).color}`}>
                  {livePriority}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex items-center gap-2 bg-sky-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-sky-700 transition-colors"
                >
                  Next: Problem Details <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ────── STEP 2: Description & Media Upload ────────────────────────── */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Issue Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Deep pothole causing heavy traffic jam on Madhyam Marg"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Detailed Description *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe the exact problem, hazard level, and any previous complaints..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {/* File Upload Zone */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <Upload className="w-4 h-4 text-sky-600" />
                    Upload Evidence (Image / Video)
                  </label>
                  <span className="text-[11px] text-slate-500">PNG, JPG, MP4, MOV, WEBM</span>
                </div>

                <div className="relative border-2 border-dashed border-sky-300 bg-white rounded-xl p-6 text-center hover:bg-sky-50/50 transition-colors">
                  <input
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-sky-100 flex items-center justify-center text-sky-600">
                      <Camera className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-slate-800">Click to Select Files from Folder</p>
                    <p className="text-xs text-slate-500">Or drag & drop images / videos here</p>
                    <div className="flex gap-2 mt-1">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-md">
                        <ImageIcon className="w-3.5 h-3.5" /> Photo
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-purple-100 text-purple-800 px-2.5 py-1 rounded-md">
                        <Film className="w-3.5 h-3.5" /> Video
                      </span>
                    </div>
                  </div>
                </div>

                {uploadedMedia.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <p className="text-xs font-bold text-slate-700">Uploaded ({uploadedMedia.length}):</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {uploadedMedia.map((item) => (
                        <div key={item.id} className="relative group border border-slate-200 rounded-xl overflow-hidden bg-black/90">
                          {item.type === 'image' ? (
                            <img src={item.url} alt={item.name} className="w-full h-28 object-cover" />
                          ) : (
                            <video src={item.url} controls className="w-full h-28 object-cover" />
                          )}
                          <button
                            type="button"
                            onClick={() => removeMediaItem(item.id)}
                            className="absolute top-1.5 right-1.5 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 z-20"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                          <div className="p-1.5 bg-slate-900/80 text-white text-[10px] truncate flex items-center justify-between">
                            <span className="truncate">{item.name}</span>
                            <span className="uppercase text-[9px] font-bold px-1 rounded bg-slate-700">{item.type}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Preset Photos */}
                <div className="pt-2 border-t border-slate-200">
                  <p className="text-[11px] font-semibold text-slate-500 mb-2">Or pick a demo evidence preset:</p>
                  <div className="flex gap-2">
                    {[
                      'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80',
                      'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=80',
                      'https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=600&auto=format&fit=crop&q=80',
                    ].map((url, i) => (
                      <img
                        key={i}
                        src={url}
                        onClick={() => setPhotoUrl(url)}
                        alt="Preset"
                        className={`w-14 h-14 object-cover rounded-lg cursor-pointer border-2 transition-all ${
                          photoUrl === url ? 'border-sky-600 scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center gap-1.5 text-slate-600 font-bold text-sm px-4 py-2 hover:bg-slate-100 rounded-xl"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!title || !description) {
                      alert('Please fill in the Issue Title and Description before continuing.');
                      return;
                    }
                    setStep(3);
                  }}
                  className="flex items-center gap-2 bg-sky-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-sky-700 transition-colors"
                >
                  Next: Pin Location <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ────── STEP 3: Location Selection & Submit ───────────────────────── */}
          {step === 3 && (
            <div className="space-y-4">
              {/* Location Required Banner */}
              {!isLocationSet && (
                <div className="flex items-center gap-2 bg-amber-50 border border-amber-300 text-amber-900 text-xs font-semibold rounded-xl px-4 py-3">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                  You must select a location before you can submit this complaint.
                </div>
              )}

              {/* Method 1: 1-Click Live GPS */}
              <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-sky-950 flex items-center gap-1.5">
                      <Navigation className="w-4 h-4 text-sky-600" />
                      Method 1 — Live GPS (1 Click)
                    </h4>
                    <p className="text-xs text-sky-700 mt-0.5">
                      Instantly fetch your exact current device location
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    disabled={isLocating}
                    className="flex items-center gap-2 bg-sky-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-sky-700 transition-all shadow-sm shrink-0 disabled:opacity-60"
                  >
                    {isLocating ? (
                      <>
                        <Sparkles className="w-4 h-4 animate-spin" /> Detecting...
                      </>
                    ) : (
                      <>
                        <MapPin className="w-4 h-4" /> 📍 Detect My Current Location
                      </>
                    )}
                  </button>
                </div>

                {locationDetected && latitude !== null && longitude !== null && (
                  <div className="bg-emerald-100 border border-emerald-300 text-emerald-950 text-xs rounded-lg p-2.5 flex items-center justify-between font-medium">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      Pinpointed: {latitude}°, {longitude}°
                    </span>
                    <span className="text-[10px] bg-emerald-200 px-2 py-0.5 rounded font-bold">GPS ✓</span>
                  </div>
                )}
              </div>

              {/* Method 2: Search by Address */}
              <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-white">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Search className="w-4 h-4 text-slate-500" />
                  Method 2 — Search Address / Area Name
                </h4>

                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchInput}
                    placeholder="Search: e.g. Mansarovar Jaipur, Johari Bazar, MG Road..."
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 pr-10"
                  />
                  {isSearching && (
                    <div className="absolute right-3 top-3">
                      <Sparkles className="w-4 h-4 animate-spin text-sky-500" />
                    </div>
                  )}

                  {/* Dropdown Results */}
                  {searchResults.length > 0 && (
                    <div className="absolute top-full mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-xl z-20 max-h-52 overflow-y-auto">
                      {searchResults.map((result) => (
                        <button
                          key={result.place_id}
                          type="button"
                          onClick={() => handleSelectSearchResult(result)}
                          className="w-full text-left px-4 py-2.5 text-xs hover:bg-sky-50 border-b border-slate-100 last:border-0 transition-colors"
                        >
                          <div className="font-semibold text-slate-900 line-clamp-1">
                            📍 {result.display_name.split(',')[0]}
                          </div>
                          <div className="text-slate-500 text-[10px] line-clamp-1">
                            {result.display_name}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Method 3: Quick Zone Presets */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Method 3 — Quick Zone Presets (Jaipur)
                </label>
                <div className="flex flex-wrap gap-2">
                  {locationPresets.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setLatitude(preset.lat);
                        setLongitude(preset.lng);
                        setAddress(preset.addr);
                        setSearchQuery(preset.name);
                        setLocationDetected(true);
                        setLocationError('');
                        setSearchResults([]);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        latitude === preset.lat && longitude === preset.lng
                          ? 'bg-slate-900 text-white border-slate-900 font-bold shadow-sm'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      📍 {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Google Maps Embed — live preview */}
              {latitude !== null && longitude !== null && (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-slate-900 text-white px-3.5 py-2 text-xs font-bold flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-sky-400" /> Selected Location Preview
                    </span>
                    <a
                      href={`https://www.google.com/maps?q=${latitude},${longitude}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-sky-400 hover:underline flex items-center gap-1"
                    >
                      Open Google Maps <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <iframe
                    title="Location Preview"
                    width="100%"
                    height="200"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    src={`https://maps.google.com/maps?q=${latitude},${longitude}&z=16&output=embed`}
                  />
                </div>
              )}

              {/* Address & Landmark Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Street Address {!isLocationSet && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => { setAddress(e.target.value); if (e.target.value.trim()) setLocationError(''); }}
                    placeholder="Address will auto-fill after location pick"
                    className={`w-full px-3.5 py-2 border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 ${
                      !isLocationSet ? 'border-amber-300 focus:ring-amber-400' : 'border-slate-200 focus:ring-sky-500'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Landmark (Optional)
                  </label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder="e.g. Opposite SBI Bank"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm font-medium"
                  />
                </div>
              </div>

              {/* GPS Coordinate inputs */}
              {latitude !== null && longitude !== null && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">GPS Latitude</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={latitude}
                      onChange={(e) => setLatitude(parseFloat(e.target.value))}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">GPS Longitude</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={longitude}
                      onChange={(e) => setLongitude(parseFloat(e.target.value))}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Location error */}
              {locationError && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl px-4 py-3">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  {locationError}
                </div>
              )}

              {/* Submission Summary */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-1.5 text-slate-700">
                <div className="font-bold text-slate-900 text-sm mb-1">Submission Summary</div>
                <div><strong>Category:</strong> {selectedCategory?.name} (SLA: {selectedCategory?.slaHours} hrs)</div>
                <div><strong>Priority:</strong> <span className="font-bold text-red-600">{livePriority}</span></div>
                <div>
                  <strong>Location:</strong>{' '}
                  {isLocationSet ? (
                    <span className="text-emerald-700 font-semibold">{address.split(',').slice(0, 3).join(', ')}</span>
                  ) : (
                    <span className="text-amber-600 font-semibold">⚠️ Not selected yet</span>
                  )}
                </div>
                <div><strong>Evidence:</strong> {uploadedMedia.length} uploaded file(s) + {photoUrl ? '1 preset' : 'none'}</div>
                <div>
                  <strong>Will be sent to:</strong>{' '}
                  <span className="text-sky-700 font-bold">Municipal Command Dashboard → Official Officer Queue</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex items-center gap-1.5 text-slate-600 font-bold text-sm px-4 py-2 hover:bg-slate-100 rounded-xl"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="submit"
                  disabled={!isLocationSet}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all ${
                    isLocationSet
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {isLocationSet ? 'Submit Complaint to Officers' : 'Select Location First'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* ── SUCCESS POPUP MODAL ──────────────────────────────────────────────────── */}
      {showSuccessModal && submittedComplaint && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 text-center space-y-5">
            {/* Animated success icon */}
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner ring-8 ring-emerald-50">
              <CheckCircle className="w-12 h-12" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-extrabold uppercase tracking-widest bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full border border-emerald-200">
                Official Receipt Confirmed
              </span>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Form Successfully Submitted!</h3>

              {/* Exact popup message */}
              <div className="bg-emerald-50 border-2 border-emerald-400 rounded-2xl p-4 text-emerald-950 font-bold text-sm shadow-sm">
                ✅ "Your form has been successfully submitted! Action will be taken after some time."
              </div>

              {/* Where it went */}
              <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 text-sky-900 text-xs font-medium text-left space-y-1">
                <div className="font-bold text-sky-800 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> Routed To:
                </div>
                <div>📋 <strong>Municipal Command Dashboard</strong> → Officer queue under <em>REPORT_SUBMITTED</em></div>
                <div>🏢 Department: <strong>{submittedComplaint.departmentName}</strong></div>
                <div>📍 Location: <strong>{submittedComplaint.address?.split(',').slice(0, 2).join(', ')}</strong></div>
              </div>
            </div>

            {/* Ticket details */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-2 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-semibold">Complaint Ticket:</span>
                <span className="font-mono font-black text-sm text-sky-600 bg-sky-50 px-2.5 py-0.5 rounded border border-sky-200">
                  {submittedComplaint.complaintNumber}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Category:</span>
                <span className="font-bold text-slate-800">{submittedComplaint.categoryName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Priority:</span>
                <span className="font-bold text-red-600">{submittedComplaint.priority}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">SLA Deadline:</span>
                <span className="font-bold text-emerald-700">Within {selectedCategory?.slaHours || 24} hours</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Evidence:</span>
                <span className="font-bold text-slate-700">
                  {(submittedComplaint.images?.length || 0) + (submittedComplaint.videos?.length || 0)} file(s) attached
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <button
                type="button"
                onClick={() => router.push(`/citizen/complaints/${submittedComplaint.id}`)}
                className="flex-1 bg-slate-900 text-white font-bold py-3 px-4 rounded-xl text-sm hover:bg-slate-800 transition-colors shadow-md flex items-center justify-center gap-2"
              >
                <FileCheck className="w-4 h-4 text-sky-400" /> Track Issue Live
              </button>
              <button
                type="button"
                onClick={handleResetForm}
                className="flex-1 bg-slate-100 text-slate-700 font-bold py-3 px-4 rounded-xl text-sm hover:bg-slate-200 border border-slate-200"
              >
                Report Another Issue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
