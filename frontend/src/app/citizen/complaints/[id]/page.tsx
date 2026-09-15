'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCivicStore } from '@/store/useCivicStore';
import { StatusTimeline } from '@/components/complaints/StatusTimeline';
import { getPriorityBadgeInfo, getStatusBadgeInfo, formatDateTime } from '@/lib/utils';
import { 
  CheckCircle2, 
  RotateCcw, 
  MapPin, 
  Clock, 
  User, 
  Building2, 
  HardHat, 
  MessageSquare, 
  Send,
  Star,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

export default function ComplaintDetailPage() {
  const params = useParams();
  const router = useRouter();
  const complaintId = params.id as string;

  const {
    complaints,
    history,
    comments,
    currentUser,
    citizenVerifyAndClose,
    citizenReopenComplaint,
    addComment,
    workers,
    assignWorker,
    workerStartJob,
    workerResolveJob,
  } = useCivicStore();

  const [commentInput, setCommentInput] = useState('');
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [reopenReason, setReopenReason] = useState('');
  const [isVerifyingModalOpen, setIsVerifyingModalOpen] = useState(false);
  const [isReopenModalOpen, setIsReopenModalOpen] = useState(false);

  const complaint = complaints.find((c) => c.id === complaintId);
  const complaintHistory = history.filter((h) => h.complaintId === complaintId);
  const complaintComments = comments.filter((c) => c.complaintId === complaintId);

  if (!complaint) {
    return (
      <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Complaint Not Found</h2>
        <p className="text-xs text-slate-500">The requested ticket does not exist or has been archived.</p>
        <Link href="/citizen" className="inline-block text-xs font-bold text-sky-600 bg-sky-50 px-4 py-2 rounded-xl">
          Return to My Reports
        </Link>
      </div>
    );
  }

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    addComment(complaint.id, commentInput);
    setCommentInput('');
  };

  const handleCitizenClose = () => {
    citizenVerifyAndClose(complaint.id, rating, feedback);
    setIsVerifyingModalOpen(false);
  };

  const handleCitizenReopen = () => {
    if (!reopenReason.trim()) return;
    citizenReopenComplaint(complaint.id, reopenReason);
    setIsReopenModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft className="w-4 h-4" /> Back to List
      </button>

      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase bg-slate-100 px-2 py-0.5 rounded">
              {complaint.complaintNumber}
            </span>
            <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${getPriorityBadgeInfo(complaint.priority).color}`}>
              {complaint.priority} Priority
            </span>
            <span className={`px-2.5 py-0.5 rounded text-xs font-bold border ${getStatusBadgeInfo(complaint.status).color}`}>
              {getStatusBadgeInfo(complaint.status).label}
            </span>
          </div>

          <h1 className="text-2xl font-black text-slate-900 tracking-tight">{complaint.title}</h1>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
            <span>Reported by <strong>{complaint.citizenName}</strong></span>
            <span>•</span>
            <span>{formatDateTime(complaint.createdAt)}</span>
            <span>•</span>
            <span className="text-sky-700 font-semibold">{complaint.departmentName}</span>
          </p>
        </div>

        {/* Citizen Actions (Verify / Reopen) */}
        {complaint.status === 'RESOLVED' && currentUser.role === 'CITIZEN' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsVerifyingModalOpen(true)}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md animate-bounce"
            >
              <CheckCircle2 className="w-4 h-4" />
              Verify & Close Resolution
            </button>

            <button
              onClick={() => setIsReopenModalOpen(true)}
              className="flex items-center gap-1.5 bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 px-3 py-2 rounded-xl text-xs font-bold transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reopen
            </button>
          </div>
        )}

        {/* Worker Actions */}
        {currentUser.role === 'FIELD_WORKER' && complaint.status === 'ASSIGNED' && (
          <button
            onClick={() => workerStartTask(complaint.id)}
            className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md"
          >
            <HardHat className="w-4 h-4" /> Start Field Work
          </button>
        )}

        {currentUser.role === 'FIELD_WORKER' && complaint.status === 'IN_PROGRESS' && (
          <button
            onClick={() => workerResolveTask(complaint.id)}
            className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md"
          >
            <CheckCircle2 className="w-4 h-4" /> Upload Completion Evidence
          </button>
        )}
      </div>

      {/* Main Grid: Details + Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Complaint Details & Comments */}
        <div className="lg:col-span-7 space-y-6">
          {/* Details Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Issue Description
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed">{complaint.description}</p>
            </div>

            {/* Images & Video Gallery */}
            {((complaint.images && complaint.images.length > 0) || (complaint.videos && complaint.videos.length > 0)) && (
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Photographic & Video Evidence
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {complaint.images?.map((img, i) => (
                    <img
                      key={`img-${i}`}
                      src={img}
                      alt="Evidence"
                      className="w-full h-48 object-cover rounded-xl border border-slate-200 shadow-sm"
                    />
                  ))}
                  {complaint.videos?.map((vid, i) => (
                    <video
                      key={`vid-${i}`}
                      src={vid}
                      controls
                      className="w-full h-48 object-cover rounded-xl border border-purple-200 shadow-sm bg-black"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Meta tags */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Location</span>
                <span className="font-bold text-slate-800">{complaint.address}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Zone</span>
                <span className="font-bold text-slate-800">{complaint.zoneName || 'Jaipur Central'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Assigned Worker</span>
                <span className="font-bold text-slate-800">{complaint.assignedWorkerName || 'Unassigned'}</span>
              </div>
            </div>
          </div>

          {/* Comments / Collaboration Section */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-sky-600" />
              Citizen & Municipal Communications ({complaintComments.length})
            </h3>

            {/* Comments List */}
            <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
              {complaintComments.length === 0 ? (
                <div className="text-xs text-slate-400 italic">No notes or comments added yet.</div>
              ) : (
                complaintComments.map((comm) => (
                  <div key={comm.id} className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                    <div className="flex items-center justify-between font-bold text-slate-800">
                      <span>{comm.userName} ({comm.userRole})</span>
                      <span className="text-[10px] text-slate-400 font-mono">{formatDateTime(comm.createdAt)}</span>
                    </div>
                    <p className="text-slate-600 mt-1">{comm.message}</p>
                  </div>
                ))
              )}
            </div>

            {/* Add Comment Input */}
            <form onSubmit={handleCommentSubmit} className="flex gap-2">
              <input
                type="text"
                placeholder={`Post an update as ${currentUser.firstName}...`}
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                className="flex-1 px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <button
                type="submit"
                className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" /> Post
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Status Timeline & Audit Trail */}
        <div className="lg:col-span-5">
          <StatusTimeline currentStatus={complaint.status} history={complaintHistory} />
        </div>
      </div>

      {/* MODAL: Citizen Verify & Close */}
      {isVerifyingModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">Verify Resolution & Sign Off</h3>
            <p className="text-xs text-slate-500">
              Please rate the work quality executed by the municipal field crew to complete ticket closure.
            </p>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-2">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`p-2 rounded-lg border text-sm font-bold ${
                      rating >= star ? 'bg-amber-100 text-amber-600 border-amber-300' : 'bg-slate-50 text-slate-400'
                    }`}
                  >
                    ★ {star}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Feedback Note</label>
              <textarea
                rows={3}
                placeholder="Work verified satisfactorily, potholes patched smoothly..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsVerifyingModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCitizenClose}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md"
              >
                Confirm & Close Ticket
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Citizen Reopen */}
      {isReopenModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">Reopen Civic Ticket</h3>
            <p className="text-xs text-slate-500">
              If the problem was not solved or has re-occurred, please specify why. It will automatically be bumped to High Priority.
            </p>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Reason for Reopening</label>
              <textarea
                rows={3}
                required
                placeholder="The pothole was only partially filled with sand, gravel washed away..."
                value={reopenReason}
                onChange={(e) => setReopenReason(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsReopenModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCitizenReopen}
                className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-md"
              >
                Reopen Complaint
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
