import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { rupiah, safeUrl } from '../data/seed';
import type {
  Destination,
  FavoritableType,
  FoodItem,
  StayItem,
} from '../types/tourism';

export type ModalState =
  | { kind: 'closed' }
  | { kind: 'detail'; type: FavoritableType; item: Destination | FoodItem | StayItem }
  | { kind: 'copyFallback'; text: string }
  | {
      kind: 'confirm';
      title: string;
      message: string;
      confirmLabel: string;
      danger?: boolean;
      onConfirm: () => void;
    };

interface DetailModalProps {
  modal: ModalState;
  onClose: () => void;
}

export function DetailModal({ modal, onClose }: DetailModalProps) {
  const [imgError, setImgError] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    setImgError(false);
  }, [modal]);

  useEffect(() => {
    if (modal.kind === 'copyFallback' && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [modal]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <AnimatePresence>
      {modal.kind !== 'closed' && (
        <motion.div
          key="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 bg-[#06182c]/70 backdrop-blur-xs grid place-items-center p-[18px] z-30 no-print"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            key="modal-dialog"
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white border border-slate-200 text-[#0f2438] rounded-2xl p-6 w-[min(560px,100%)] max-h-[88vh] overflow-auto shadow-2xl"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup modal"
              className="float-right border border-slate-200 bg-slate-50 hover:bg-slate-100 rounded-lg w-9 h-9 inline-grid place-items-center text-[#0f2438] cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {modal.kind === 'copyFallback' && (
              <div>
                <div className="text-[#d97706] font-semibold text-xs tracking-wide">
                  Salin manual
                </div>
                <h2 className="font-display text-[#0f2438] mt-1 mb-3 text-xl font-semibold">
                  Ringkasan itinerary
                </h2>
                <textarea
                  ref={textareaRef}
                  readOnly
                  rows={14}
                  value={modal.text}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg bg-slate-50 text-[#0f2438] text-sm outline-none focus:border-[#f59e0b]"
                />
                <p className="text-xs text-slate-500 mt-2">
                  Teks sudah dipilih. Tekan Ctrl/Cmd+C untuk menyalin, lalu tutup
                  jendela ini.
                </p>
              </div>
            )}

            {modal.kind === 'confirm' && (
              <div>
                <div className="text-[#d97706] font-semibold text-xs tracking-wide">
                  Konfirmasi
                </div>
                <h2 className="font-display text-[#0f2438] mt-1 mb-2 text-xl font-semibold">
                  {modal.title}
                </h2>
                <p className="text-slate-600 text-sm mb-5">{modal.message}</p>
                <div className="flex gap-2.5 justify-end">
                  <button
                    type="button"
                    onClick={onClose}
                    className="border border-slate-200 bg-white text-[#0f2438] rounded-lg px-4 py-2 text-xs font-semibold cursor-pointer hover:bg-slate-50"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      modal.onConfirm();
                      onClose();
                    }}
                    className={`border-0 rounded-lg px-4 py-2 text-xs font-semibold cursor-pointer ${
                      modal.danger
                        ? 'bg-rose-600 text-white hover:bg-rose-700'
                        : 'bg-[#f59e0b] text-white hover:bg-[#d97706]'
                    }`}
                  >
                    {modal.confirmLabel}
                  </button>
                </div>
              </div>
            )}

            {modal.kind === 'detail' && (
              <DetailBody
                type={modal.type}
                item={modal.item}
                imgError={imgError}
                onImgError={() => setImgError(true)}
              />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function DetailBody({
  type,
  item,
  imgError,
  onImgError,
}: {
  type: FavoritableType;
  item: Destination | FoodItem | StayItem;
  imgError: boolean;
  onImgError: () => void;
}) {
  const isDest = type === 'destinations';
  const isFood = type === 'foods';
  const dest = isDest ? (item as Destination) : null;
  const food = isFood ? (item as FoodItem) : null;
  const stay = !isDest && !isFood ? (item as StayItem) : null;
  const img = !imgError ? safeUrl(item.imageUrl) : '';
  const photoSource = safeUrl(item.sumberFoto);
  const contact = food?.kontak || stay?.kontak;

  return (
    <div>
      {img && (
        <img
          src={img}
          alt={`Foto ${item.nama}`}
          referrerPolicy="no-referrer"
          onError={onImgError}
          className="w-full max-h-[260px] object-cover rounded-xl mb-4 border border-slate-200"
        />
      )}

      <div className="text-[#d97706] font-semibold text-xs tracking-wide">
        {isDest ? 'Destinasi' : isFood ? 'Kuliner & UMKM' : 'Akomodasi'}
      </div>
      <h2 className="font-display text-[#0f2438] mt-1 mb-2 text-2xl font-semibold">
        {item.nama}
      </h2>
      <p className="text-slate-600 text-sm mb-3">
        {dest?.deskripsi || food?.catatan || stay?.catatan || 'Informasi contoh.'}
      </p>

      {dest && (
        <>
          <p className="text-[14px] leading-relaxed mb-2 text-[#0f2438]">
            <b>Wilayah:</b> {dest.wilayah}
            <br />
            <b>Alamat:</b> {dest.alamat}
            <br />
            <b>Estimasi biaya:</b>{' '}
            <span className="tabular-nums">{rupiah(dest.estimasiBiaya)}</span> (simulasi)
            <br />
            <b>Fasilitas:</b> {(dest.fasilitas || []).join(', ')}
            <br />
            <b>Fasilitas ibadah:</b> {(dest.fasilitasIbadah || []).join(', ')}
          </p>
          <p className="text-xs text-slate-500 mb-4">
            {dest.catatanVerifikasi || 'Informasi perlu verifikasi.'}
          </p>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={safeUrl(dest.mapsUrl) || '#'}
            className="inline-block border-0 rounded-full px-5 py-2.5 bg-[#f59e0b] text-white font-semibold text-xs no-underline hover:bg-[#d97706] transition-colors"
          >
            Buka Google Maps ↗
          </a>
        </>
      )}

      {food && (
        <p className="text-[14px] leading-relaxed mb-2 text-[#0f2438]">
          <b>Wilayah:</b> {food.wilayah}
          <br />
          <b>Harga:</b> <span className="tabular-nums">{rupiah(food.harga)}</span> (simulasi)
          <br />
          <b>Status sertifikasi halal:</b> {food.statusSertifikasiHalal}
          <br />
          <b>Sumber:</b> {food.sumberVerifikasi || 'Belum tersedia'}
          <br />
          <span className="text-xs text-slate-500">{food.catatan || ''}</span>
        </p>
      )}

      {stay && (
        <p className="text-[14px] leading-relaxed mb-2 text-[#0f2438]">
          <b>Wilayah:</b> {stay.wilayah}
          <br />
          <b>Harga/malam:</b>{' '}
          <span className="tabular-nums">{rupiah(stay.hargaPerMalam)}</span> (simulasi)
          <br />
          <b>Fasilitas:</b> {(stay.fasilitas || []).join(', ')}
          <br />
          <b>Fasilitas ramah Muslim:</b>{' '}
          {(stay.fasilitasRamahMuslim || []).join(', ')}
          <br />
          <span className="text-xs text-slate-500">{stay.catatan || ''}</span>
        </p>
      )}

      {photoSource && (
        <p className="text-xs text-slate-500 mt-3">
          Foto:{' '}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={photoSource}
            className="underline text-slate-600 hover:text-[#0f2438]"
          >
            Wikimedia Commons
          </a>
          {item.fotoIlustrasi ? ' · foto ilustrasi' : ''}
        </p>
      )}

      {contact && (
        <>
          <p className="text-xs text-slate-600 bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-lg mt-3 mb-3">
            Kontak simulasi, bukan nomor penyedia terverifikasi.
          </p>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={`https://wa.me/${encodeURIComponent(contact)}?text=${encodeURIComponent(
              'Halo, saya ingin bertanya tentang informasi layanan (mode demo Pemuda Aceh).'
            )}`}
            className="inline-block border-0 rounded-full px-5 py-2.5 bg-[#0f2438] text-white font-semibold text-xs no-underline hover:bg-[#1a3957] transition-colors"
          >
            Hubungi via WhatsApp demo
          </a>
        </>
      )}
    </div>
  );
}
