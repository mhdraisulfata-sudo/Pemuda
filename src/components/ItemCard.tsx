import { useState } from 'react';
import { rupiah, safeUrl } from '../data/seed';
import type {
  Destination,
  FavoritableType,
  FoodItem,
  StayItem,
} from '../types/tourism';

interface ItemCardProps {
  item: Destination | FoodItem | StayItem;
  type: FavoritableType;
  isFavorite: boolean;
  mode?: 'default' | 'favorite';
  onToggleFavorite: (type: FavoritableType, id: string) => void;
  onShowDetail: (type: FavoritableType, id: string) => void;
}

const DEST_SYMBOLS: Record<string, string> = {
  religi: '🕌',
  sejarah: '🏛️',
  alam: '🌿',
  bahari: '🌊',
  budaya: '🏡',
  kuliner: '🍜',
};

export function ItemCard({
  item,
  type,
  isFavorite,
  mode = 'default',
  onToggleFavorite,
  onShowDetail,
}: ItemCardProps) {
  const [imgFailed, setImgFailed] = useState(false);

  const isDest = type === 'destinations';
  const isFood = type === 'foods';
  const dest = isDest ? (item as Destination) : null;
  const food = isFood ? (item as FoodItem) : null;
  const stay = !isDest && !isFood ? (item as StayItem) : null;

  const loc = item.wilayah || '';
  const price = dest
    ? dest.estimasiBiaya
    : food
      ? food.harga
      : stay?.hargaPerMalam || 0;
  const cat = dest ? dest.kategori : food ? food.kategori : 'Akomodasi';
  const symbol = isDest ? DEST_SYMBOLS[cat] || '📍' : isFood ? '🍲' : '🛏️';
  const validImg = !imgFailed ? safeUrl(item.imageUrl) : '';

  return (
    <article className="bg-white border border-[#e1ebe5] rounded-[18px] overflow-hidden card-shadow transition-transform duration-200 hover:-translate-y-[3px]">
      <div className="h-[170px] photo-gradient grid place-items-center text-[54px] relative">
        {validImg ? (
          <img
            src={validImg}
            alt={item.nama}
            onError={() => setImgFailed(true)}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <span>{symbol}</span>
        )}
        <small className="absolute bottom-[10px] left-[12px] z-[2] bg-[#ffffffdf] rounded-full px-[9px] py-[5px] text-[10px] font-extrabold text-[#064e3b]">
          {loc}
        </small>
      </div>

      <div className="p-4">
        <div className="flex justify-between gap-[6px] items-center">
          {food ? (
            <span
              className={`inline-flex rounded-full px-[9px] py-1 text-[10px] font-extrabold ${
                food.statusSertifikasiHalal === 'Terverifikasi'
                  ? 'bg-[#e9f5ef] text-[#064e3b]'
                  : 'bg-[#fff0e9] text-[#9a4c22]'
              }`}
            >
              {food.statusSertifikasiHalal}
            </span>
          ) : dest ? (
            <span className="inline-flex rounded-full bg-[#e9f5ef] text-[#064e3b] px-[9px] py-1 text-[10px] font-extrabold">
              {cat}
            </span>
          ) : (
            <span className="inline-flex rounded-full bg-[#e9f5ef] text-[#064e3b] px-[9px] py-1 text-[10px] font-extrabold">
              Ramah Muslim: fasilitas
            </span>
          )}

          {mode === 'favorite' ? (
            <button
              type="button"
              onClick={() => onToggleFavorite(type, item.id)}
              aria-label="Hapus dari favorit"
              className="border border-[#f4c8c8] bg-[#fff0ee] text-[#c43d48] rounded-[10px] px-[10px] py-2 cursor-pointer text-[13px] font-semibold"
            >
              ♥ Hapus
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onToggleFavorite(type, item.id)}
              aria-label="Favorit"
              className={`border rounded-[10px] px-[10px] py-2 cursor-pointer text-[14px] ${
                isFavorite
                  ? 'bg-[#fff0ee] text-[#c43d48] border-[#f4c8c8]'
                  : 'bg-white text-[#064e3b] border-[#e1ebe5]'
              }`}
            >
              {isFavorite ? '♥' : '♡'}
            </button>
          )}
        </div>

        <h3 className="mt-2 mb-[5px] text-[18px] font-bold text-[#064e3b]">
          {item.nama}
        </h3>
        <div className="text-[#687b75] text-[12px]">
          {dest ? dest.alamat || loc : loc}
        </div>
        <p className="text-[#5c7169] text-[13px] my-[10px] mb-[14px]">
          {dest?.deskripsi ||
            food?.catatan ||
            stay?.catatan ||
            'Informasi contoh; konfirmasi langsung kepada penyedia.'}
        </p>

        <div className="flex justify-between items-center gap-2">
          <span className="font-[850] text-[#064e3b] text-[13px]">
            {rupiah(price)}{' '}
            <small className="text-[11px] font-normal text-[#687b75]">
              simulasi
            </small>
          </span>
          <button
            type="button"
            onClick={() => onShowDetail(type, item.id)}
            className="border-0 rounded-[12px] px-4 py-[11px] bg-[#e8f4ee] text-[#064e3b] font-bold text-[14px] hover:brightness-95 cursor-pointer"
          >
            Detail
          </button>
        </div>
      </div>
    </article>
  );
}
