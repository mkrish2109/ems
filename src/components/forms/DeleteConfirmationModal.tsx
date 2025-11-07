"use client";

import { DeleteConfirmState } from '@/types/profile';

interface DeleteConfirmationModalProps {
  deleteConfirm: DeleteConfirmState;
  onCancel: () => void;
  onConfirm: () => void;
  onInputChange: (value: string) => void;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  deleteConfirm,
  onCancel,
  onConfirm,
  onInputChange,
}) => {
  if (!deleteConfirm.show) return null;

  return (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
      <div className="w-full max-w-[390px] min-h-[844px] bg-black/50 flex items-center justify-center">
        <div className="bg-white rounded-[10px] p-6 w-[320px] mx-4">
          <h3 className="text-[18px] font-semibold text-[#052C4D] mb-4">
            Delete Profile
          </h3>
          <p className="text-[16px] text-[#052C4D] mb-4">
            Are you sure you want to delete your profile{' '}
            <strong>{deleteConfirm.userName}</strong>? Type{' '}
            <strong>DELETE</strong> to confirm.
          </p>
          <input
            type="text"
            value={deleteConfirm.inputText}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder="Type DELETE here"
            className="w-full h-[44px] border border-[#ccc] rounded-[8px] px-3 mb-4 text-[16px] focus:outline-none focus:border-[#008DD2]"
          />
          <div className="flex space-x-3">
            <button
              onClick={onCancel}
              className="flex-1 h-[44px] bg-gray-300 text-[#052C4D] rounded-[8px] font-medium"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={deleteConfirm.inputText !== 'DELETE'}
              className={`flex-1 h-[44px] rounded-[8px] font-medium ${
                deleteConfirm.inputText === 'DELETE'
                  ? 'bg-[red]/70 text-white'
                  : 'bg-gray-400 text-gray-200 cursor-not-allowed'
              }`}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};