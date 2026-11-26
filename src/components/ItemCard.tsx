import { BedDouble, Heart, MapPin, Utensils } from 'lucide-react';
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
  const validImg = !imgFailed ? safeUrl(item.imageUrl) : '';

  const FallbackIcon = isDest ? MapPin : isFood ? Utensils : BedDouble;

  return (
    <article className="bg-white border border-[#dce6df] rounded-xl overflow-hidden card-shadow transition-transform duration-200 hover:-translate-y-0.5 flex flex-col">
      <div className="aspect-[4/3] photo-gradient relative overflow-hidden">
        {validImg ? (
          <img
            src={validImg}
            alt={item.nama}
            referrerPolicy="no-referrer"
            onError={() => setImgFailed(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-[#064e3b] px-4 text-center">
            <FallbackIcon className="w-7 h-7 opacity-75" strokeWidth={1.6} />
            <span className="text-xs font-medium opacity-80 line-clamp-1">
              {item.nama}
            </span>
          </div>
        )}
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="text-xs text-[#5a6f67] flex items-center gap-1.5 min-w-0 truncate">
            {food ? (
              <span
                className={
                  food.statusSertifikasiHalal === 'Terverifikasi'
                    ? 'font-semibold text-[#064e3b]'
                    : 'font-medium text-[#8a4520]'
                }
              >
                Halal: {food.statusSertifikasiHalal}
              </span>
            ) : dest ? (
              <span className="capitalize font-medium text-[#064e3b]">
                {cat}
              </span>
            ) : (
              <span className="font-medium text-[#064e3b]">
                Ramah Muslim
              </span>
            )}
            {loc && (
              <>
                <span aria-hidden="true">·</span>
                <span className="truncate">{loc}</span>
              </>
            )}
          </div>

          {mode === 'favorite' ? (
            <button
              type="button"
              onClick={() => onToggleFavorite(type, item.id)}
              aria-label="Hapus dari favorit"
              className="shrink-0 inline-flex items-center gap-1.5 border border-[#f0c7c7] bg-[#fff5f5] text-[#b4343e] rounded-lg px-3 py-1.5 text-xs font-semibold cursor-pointer hover:bg-[#feeceb] transition-colors whitespace-nowrap"
            >
              <Heart className="w-3.5 h-3.5 fill-current" />
              <span>Hapus</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onToggleFavorite(type, item.id)}
              aria-label={isFavorite ? 'Hapus dari favorit' : 'Simpan ke favorit'}
              className={`shrink-0 w-9 h-9 inline-grid place-items-center border rounded-lg cursor-pointer transition-colors ${
                isFavorite
                  ? 'bg-[#fff5f5] text-[#b4343e] border-[#f0c7c7]'
                  : 'bg-white text-[#48635a] border-[#dce6df] hover:text-[#064e3b] hover:border-[#b5ccc0]'
              }`}
            >
              <Heart
                className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`}
                strokeWidth={1.8}
              />
            </button>
          )}
        </div>

        <h3 className="text-[17px] leading-snug font-bold text-[#132a24] m-0">
          {item.nama}
        </h3>
        <div className="text-xs text-[#5a6f67] mt-1">
          {dest ? dest.alamat || loc : loc}
        </div>

        <p className="text-[13.5px] leading-relaxed text-[#4b625a] mt-3 mb-5 flex-1">
          {dest?.deskripsi ||
            food?.catatan ||
            stay?.catatan ||
            'Informasi contoh; konfirmasi langsung kepada penyedia.'}
        </p>

        <div className="pt-3.5 border-t border-[#ebf1ed] flex justify-between items-center gap-3">
          <div className="tabular-nums">
            <span className="font-bold text-[#064e3b] text-sm">
              {rupiah(price)}
            </span>
            <span className="text-[11px] text-[#5a6f67] ml-1.5">
              simulasi
            </span>
          </div>
          <button
            type="button"
            onClick={() => onShowDetail(type, item.id)}
            className="border border-[#dce6df] rounded-lg px-4 py-2 bg-[#f3f8f5] text-[#064e3b] font-semibold text-xs hover:bg-[#e6f1eb] transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            Lihat detail
          </button>
        </div>
      </div>
    </article>
  );
}
