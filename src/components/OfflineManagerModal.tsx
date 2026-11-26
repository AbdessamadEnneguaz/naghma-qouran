import React from 'react';
import {CheckCircle2, Download, HardDrive, Loader2, Trash2, X} from 'lucide-react';
import type {OfflineSurahRecord, Reciter, SurahMeta} from '../types/quran';
import {RECITERS} from '../data/reciters';
import {formatBytes} from '../utils/quranLogic';

interface OfflineManagerModalProps {
  isOpen: boolean;
  surahs: SurahMeta[];
  activeReciter: Reciter;
  offlineRecords: OfflineSurahRecord[];
  vaultKeys: string[];
  storageEstimate: {usage: number; quota: number};
  downloadProgress: {surah: number; completed: number; total: number} | null;
  onClose: () => void;
  onDownloadSurah: (surahMeta: SurahMeta) => void;
  onDeleteOfflineRecord: (reciter: Reciter, surahMeta: SurahMeta) => void;
  onClearAudioCache: () => void;
}

const RECOMMENDED_SURAH_IDS = [1, 18, 36, 55, 67, 112, 113, 114];

export const OfflineManagerModal: React.FC<OfflineManagerModalProps> = ({
  isOpen,
  surahs,
  activeReciter,
  offlineRecords,
  vaultKeys,
  storageEstimate,
  downloadProgress,
  onClose,
  onDownloadSurah,
  onDeleteOfflineRecord,
  onClearAudioCache,
}) => {
  if (!isOpen) return null;

  const totalAudioBytes = offlineRecords.reduce((acc, r) => acc + r.bytes, 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Offline Vault & Storage Manager"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl border border-[#E2EAE5] dark:border-[#1E2E26] bg-white dark:bg-[#111C17] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-[#E2EAE5] dark:border-[#1E2E26]">
          <div className="flex items-center gap-2.5">
            <HardDrive className="h-5 w-5 text-[#27784C] dark:text-[#52B77F]" strokeWidth={1.5} />
            <div>
              <h3 className="text-base font-semibold text-[#142019] dark:text-[#F1F5F3]">
                Offline Vault · IndexedDB
              </h3>
              <p className="text-xs text-[#5A6B62] dark:text-[#92A59B] tabular-nums">
                Audio Cached: {formatBytes(totalAudioBytes)} · Total App Storage:{' '}
                {formatBytes(storageEstimate.usage)}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Offline Vault"
            className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-xl text-[#5A6B62] dark:text-[#92A59B] hover:bg-[#EAF1EC] dark:hover:bg-[#1E3229]"
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Quran Text Vault Status */}
          <div className="rounded-xl border border-[#27784C]/25 dark:border-[#52B77F]/30 bg-[#27784C]/8 dark:bg-[#52B77F]/12 p-4 flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#27784C] dark:text-[#52B77F]">
                <CheckCircle2 className="h-4 w-4" strokeWidth={1.5} />
                <span>Full Quran Text & 604-Page Mushaf Stored Offline</span>
              </div>
              <p className="text-xs text-[#5A6B62] dark:text-[#92A59B] tabular-nums">
                114 Surahs · 6,236 Verses · Datasets cached: {vaultKeys.length} (Hafs, Warsh, Tafsir Al-Muyassar)
              </p>
            </div>
          </div>

          {/* Quick Download Recommended Surahs */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-[#5A6B62] dark:text-[#92A59B]">
              Quick Download for {activeReciter.nameEn}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {RECOMMENDED_SURAH_IDS.map((id) => {
                const sMeta = surahs.find((s) => s.id === id);
                if (!sMeta) return null;
                const isCached = offlineRecords.some(
                  (r) => r.surah === id && r.reciterId === activeReciter.id
                );
                const isDownloading = downloadProgress?.surah === id;
                return (
                  <div
                    key={id}
                    className="rounded-xl border border-[#E2EAE5] dark:border-[#1E2E26] bg-[#F4F7F5] dark:bg-[#15241D] px-3.5 py-2.5 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-[#142019] dark:text-[#F1F5F3] truncate">
                        {sMeta.id}. {sMeta.nameEn}
                      </div>
                      <div className="text-[11px] text-[#5A6B62] dark:text-[#92A59B] tabular-nums">
                        {sMeta.totalAyahs} verses
                      </div>
                    </div>

                    {isDownloading ? (
                      <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#27784C] dark:text-[#52B77F] tabular-nums">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={1.5} />
                        <span>
                          {downloadProgress.completed}/{downloadProgress.total}
                        </span>
                      </div>
                    ) : isCached ? (
                      <span className="text-xs font-semibold text-[#27784C] dark:text-[#52B77F]">
                        Saved
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onDownloadSurah(sMeta)}
                        className="inline-flex items-center gap-1 rounded-lg border border-[#E2EAE5] dark:border-[#1E2E26] bg-white dark:bg-[#111C17] px-2.5 py-1.5 text-xs font-semibold text-[#142019] dark:text-[#F1F5F3] hover:border-[#27784C] dark:hover:border-[#52B77F]"
                      >
                        <Download className="h-3.5 w-3.5" strokeWidth={1.5} />
                        <span>Save</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Downloaded Audio Records */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-[#5A6B62] dark:text-[#92A59B] tabular-nums">
                Saved Offline Audio ({offlineRecords.length})
              </h4>
              {offlineRecords.length > 0 && (
                <button
                  type="button"
                  onClick={onClearAudioCache}
                  className="text-xs font-semibold text-rose-500 hover:underline"
                >
                  Clear All Audio
                </button>
              )}
            </div>

            {offlineRecords.length === 0 ? (
              <p className="text-xs text-[#5A6B62] dark:text-[#92A59B] py-4">
                No MP3 recitations cached yet. Tap &ldquo;Save&rdquo; above or &ldquo;Download Surah Offline&rdquo; in any Surah to listen without internet.
              </p>
            ) : (
              <div className="divide-y divide-[#E2EAE5] dark:divide-[#1E2E26] rounded-xl border border-[#E2EAE5] dark:border-[#1E2E26] overflow-hidden">
                {offlineRecords.map((rec) => {
                  const sMeta = surahs.find((s) => s.id === rec.surah);
                  const rMeta = RECITERS.find((r) => r.id === rec.reciterId);
                  if (!sMeta || !rMeta) return null;
                  return (
                    <div
                      key={rec.key}
                      className="px-4 py-3 bg-[#F4F7F5] dark:bg-[#15241D] flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-[#142019] dark:text-[#F1F5F3] truncate">
                          {sMeta.id}. {sMeta.nameEn} · {rMeta.nameEn}
                        </div>
                        <div className="text-[11px] text-[#5A6B62] dark:text-[#92A59B] tabular-nums">
                          {rec.totalFiles} audio file{rec.totalFiles > 1 ? 's' : ''} ·{' '}
                          {formatBytes(rec.bytes)}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => onDeleteOfflineRecord(rMeta, sMeta)}
                        aria-label={`Delete offline audio for ${sMeta.nameEn}`}
                        className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg text-[#5A6B62] dark:text-[#92A59B] hover:text-rose-500"
                      >
                        <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
