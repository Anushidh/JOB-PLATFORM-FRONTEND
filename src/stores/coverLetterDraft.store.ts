import { create } from 'zustand';

export interface CoverLetterDraft {
  jobId: string;
  coverLetter: string;
}

interface CoverLetterDraftState {
  draft: CoverLetterDraft | null;
  setDraft: (draft: CoverLetterDraft) => void;
  clearDraft: () => void;
}

export const useCoverLetterDraftStore = create<CoverLetterDraftState>((set) => ({
  draft: null,
  setDraft: (draft) => set({ draft }),
  clearDraft: () => set({ draft: null }),
}));
