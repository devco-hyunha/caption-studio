import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { STORAGE_KEY_IO, createStorage, DEFAULT_STATE, mergeState } from './storage';
import type { EncodingKey, EncodingState, SubtitleIoStore } from '../types';

/** 인코딩 선택 영속 스토어 — localStorage 키 5개에 분해 저장 */
const useSubtitleIoStore = create<SubtitleIoStore>()(
  persist(
    (set) => ({
      ...DEFAULT_STATE,

      setEncoding: (key: EncodingKey, value: string) => {
        set({ [key]: value } as Partial<EncodingState>);
      },
    }),
    {
      name: STORAGE_KEY_IO,
      storage: createJSONStorage(() => createStorage()),
      partialize: (state) => ({
        smiEncode: state.smiEncode,
        srtEncode: state.srtEncode,
        smiEncodeFile: state.smiEncodeFile,
        srtEncodeFile: state.srtEncodeFile,
        vttEncodeFile: state.vttEncodeFile,
      }),
      merge: (persisted, current) => ({
        ...current,
        ...mergeState(persisted as Partial<EncodingState> | null, {
          smiEncode: current.smiEncode,
          srtEncode: current.srtEncode,
          smiEncodeFile: current.smiEncodeFile,
          srtEncodeFile: current.srtEncodeFile,
          vttEncodeFile: current.vttEncodeFile,
        }),
      }),
    },
  ),
);

export { useSubtitleIoStore };
