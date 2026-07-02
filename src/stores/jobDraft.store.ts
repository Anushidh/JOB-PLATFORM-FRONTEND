import { create } from 'zustand';

export interface JobDraft {
  title: string;
  description: string;
  skillsRequired: string;
  experienceLevel: string;
  jobType: string;
  workMode: string;
  location: string;
}

interface JobDraftState {
  draft: JobDraft | null;
  setDraft: (draft: JobDraft) => void;
  clearDraft: () => void;
}

export const useJobDraftStore = create<JobDraftState>((set) => ({
  draft: null,
  setDraft: (draft) => set({ draft }),
  clearDraft: () => set({ draft: null }),
}));
