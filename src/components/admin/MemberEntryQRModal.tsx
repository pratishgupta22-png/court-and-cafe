import React from 'react';
import { MemberEntryQRView } from './MemberEntryQRView';
import { X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialBookingId?: string;
}

export const MemberEntryQRModal: React.FC<Props> = ({ isOpen, onClose, initialBookingId }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-5 overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-5xl rounded-3xl bg-zinc-950 border border-zinc-700 shadow-2xl p-4 sm:p-6 my-auto max-h-[95vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition z-20"
        >
          <X className="w-5 h-5" />
        </button>

        <MemberEntryQRView
          initialBookingId={initialBookingId}
          onCloseModal={onClose}
          isModalMode={true}
        />
      </div>
    </div>
  );
};
