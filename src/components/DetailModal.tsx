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

  if (modal.kind === 'closed') return null;

  return (
    <div
      className="fixed inset-0 bg-[#092c25a8] grid place-items-center p-[18px] z-20 no-print"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-[20px] p-6 w-[min(560px,100%)] max-h-[88vh] overflow-auto">
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup modal"
          className="float-right border border-[#e1ebe5] bg-white rounded-[10px] px-[10px] py-2 text-[#064e3b] cursor-pointer"
        >
          ✕
        </button>

        {modal.kind === 'copyFallback' && (
          <div>
            <div className="text-[#2ab98e] font-extrabold uppercase tracking-[2px] text-[11px]">
              Salin manual
            </div>
            <h2 className="text-[#064e3b] mt-1 mb-3 text-xl font-bold">
              Ringkasan itinerary
            </h2>
            <textarea
              ref={textareaRef}
              readOnly
              rows={14}
              value={modal.text}
              className="w-full px-3 py-[11px] border border-[#dce8e1] rounded-[11px] bg-white text-[#17352e] outline-none"
            />
            <p className="text-[11px] text-[#687b75] mt-2">
              Teks sudah dipilih. Tekan Ctrl/Cmd+C untuk menyalin, lalu tutup
              jendela ini.
            </p>
          </div>
        )}

        {modal.kind === 'confirm' && (
          <div>
            <div className="text-[#2ab98e] font-extrabold uppercase tracking-[2px] text-[11px]">
              Konfirmasi
            </div>
            <h2 className="text-[#064e3b] mt-1 mb-2 text-xl font-bold">
              {modal.title}
            </h2>
            <p className="text-[#5c7169] text-[14px] mb-5">{modal.message}</p>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="border border-[#e1ebe5] bg-white text-[#064e3b] rounded-[12px] px-4 py-[10px] font-bold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  modal.onConfirm();
                  onClose();
                }}
                className={`border-0 rounded-[12px] px-4 py-[10px] text-white font-bold cursor-pointer ${
                  modal.danger ? 'bg-[#b93838]' : 'bg-[#2ab98e]'
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
      </div>
    </div>
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
          onError={onImgError}
          className="w-full max-h-[260px] object-cover rounded-[14px] mb-[14px]"
        />
      )}

      <div className="text-[#2ab98e] font-extrabold uppercase tracking-[2px] text-[11px]">
        {isDest ? 'Destinasi' : isFood ? 'Kuliner & UMKM' : 'Akomodasi'}
      </div>
      <h2 className="text-[#064e3b] mt-1 mb-2 text-2xl font-bold">
        {item.nama}
      </h2>
      <p className="text-[#5c7169] mb-3">
        {dest?.deskripsi || food?.catatan || stay?.catatan || 'Informasi contoh.'}
      </p>

      {dest && (
        <>
          <p className="text-[14px] leading-relaxed mb-2">
            <b>Wilayah:</b> {dest.wilayah}
            <br />
            <b>Alamat:</b> {dest.alamat}
            <br />
            <b>Estimasi biaya:</b> {rupiah(dest.estimasiBiaya)} (simulasi)
            <br />
            <b>Fasilitas:</b> {(dest.fasilitas || []).join(', ')}
            <br />
            <b>Fasilitas ibadah:</b> {(dest.fasilitasIbadah || []).join(', ')}
          </p>
          <p className="text-[11px] text-[#687b75] mb-3">
            {dest.catatanVerifikasi || 'Informasi perlu verifikasi.'}
          </p>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={safeUrl(dest.mapsUrl) || '#'}
            className="inline-block border-0 rounded-[12px] px-4 py-[11px] bg-[#2ab98e] text-white font-bold no-underline btn-primary-shadow hover:brightness-95"
          >
            Buka Google Maps ↗
          </a>
        </>
      )}

      {food && (
        <p className="text-[14px] leading-relaxed mb-2">
          <b>Wilayah:</b> {food.wilayah}
          <br />
          <b>Harga:</b> {rupiah(food.harga)} (simulasi)
          <br />
          <b>Status sertifikasi halal:</b> {food.statusSertifikasiHalal}
          <br />
          <b>Sumber:</b> {food.sumberVerifikasi || 'Belum tersedia'}
          <br />
          <span className="text-[11px] text-[#687b75]">{food.catatan || ''}</span>
        </p>
      )}

      {stay && (
        <p className="text-[14px] leading-relaxed mb-2">
          <b>Wilayah:</b> {stay.wilayah}
          <br />
          <b>Harga/malam:</b> {rupiah(stay.hargaPerMalam)} (simulasi)
          <br />
          <b>Fasilitas:</b> {(stay.fasilitas || []).join(', ')}
          <br />
          <b>Fasilitas ramah Muslim:</b>{' '}
          {(stay.fasilitasRamahMuslim || []).join(', ')}
          <br />
          <span className="text-[11px] text-[#687b75]">{stay.catatan || ''}</span>
        </p>
      )}

      {photoSource && (
        <p className="text-[11px] text-[#687b75] mt-3">
          Foto:{' '}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={photoSource}
            className="underline"
          >
            Wikimedia Commons
          </a>
          {item.fotoIlustrasi ? ' · foto ilustrasi' : ''}
        </p>
      )}

      {contact && (
        <>
          <p className="text-[11px] text-[#687b75] bg-[#f2f7f3] px-3 py-[10px] rounded-[10px] mt-3 mb-3">
            Kontak simulasi, bukan nomor penyedia terverifikasi.
          </p>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={`https://wa.me/${encodeURIComponent(contact)}?text=${encodeURIComponent(
              'Halo, saya ingin bertanya tentang informasi layanan (mode demo Pemuda Aceh).'
            )}`}
            className="inline-block border-0 rounded-[12px] px-4 py-[11px] bg-[#e8f4ee] text-[#064e3b] font-bold no-underline hover:brightness-95"
          >
            Hubungi via WhatsApp demo
          </a>
        </>
      )}
    </div>
  );
}
