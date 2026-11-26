import { BedDouble, Heart, MapPin, Utensils } from 'lucide-react';
import { motion } from 'motion/react';
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
  isSelected?: boolean;
  mode?: 'default' | 'favorite';
  onToggleFavorite: (type: FavoritableType, id: string) => void;
  onShowDetail: (type: FavoritableType, id: string) => void;
}

export function ItemCard({
  item,
  type,
  isFavorite,
  isSelected = false,
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
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -2 }}
      className={`group bg-white border rounded-xl overflow-hidden card-shadow transition-colors duration-200 flex flex-col ${
        isSelected
          ? 'border-[#f59e0b] ring-2 ring-[#f59e0b]/25'
          : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      <div
        onClick={() => onShowDetail(type, item.id)}
        className="aspect-[16/10] photo-gradient relative overflow-hidden cursor-pointer"
      >
        {validImg ? (
          <img
            src={validImg}
            alt={item.nama}
            referrerPolicy="no-referrer"
            onError={() => setImgFailed(true)}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-[#0f2438] px-4 text-center">
            <FallbackIcon className="w-6 h-6 opacity-75" strokeWidth={1.6} />
            <span className="text-xs font-medium opacity-80 line-clamp-1">
              {item.nama}
            </span>
          </div>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="text-xs text-slate-500 flex items-center gap-1.5 min-w-0 truncate">
            {food ? (
              <span
                className={
                  food.statusSertifikasiHalal === 'Terverifikasi'
                    ? 'font-semibold text-emerald-700'
                    : 'font-medium text-amber-700'
                }
              >
                Halal: {food.statusSertifikasiHalal}
              </span>
            ) : dest ? (
              <span className="capitalize font-semibold text-[#d97706]">
                {cat}
              </span>
            ) : (
              <span className="font-semibold text-[#0d8a68]">
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
            <motion.button
              type="button"
              whileTap={{ scale: 0.94 }}
              onClick={() => onToggleFavorite(type, item.id)}
              aria-label="Hapus dari favorit"
              className="shrink-0 inline-flex items-center gap-1 border border-rose-200 bg-rose-50 text-rose-700 rounded-lg px-2.5 py-1 text-xs font-semibold cursor-pointer hover:bg-rose-100 transition-colors whitespace-nowrap"
            >
              <Heart className="w-3 h-3 fill-current" />
              <span>Hapus</span>
            </motion.button>
          ) : (
            <motion.button
              type="button"
              whileTap={{ scale: 0.88 }}
              animate={isFavorite ? { scale: [1, 1.18, 1] } : { scale: 1 }}
              transition={{ duration: 0.22 }}
              onClick={() => onToggleFavorite(type, item.id)}
              aria-label={isFavorite ? 'Hapus dari favorit' : 'Simpan ke favorit'}
              className={`shrink-0 w-8 h-8 inline-grid place-items-center border rounded-lg cursor-pointer transition-colors ${
                isFavorite
                  ? 'bg-rose-50 text-rose-600 border-rose-200'
                  : 'bg-slate-50 text-slate-500 border-slate-200 hover:text-[#0f2438] hover:border-slate-300'
              }`}
            >
              <Heart
                className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`}
                strokeWidth={1.8}
              />
            </motion.button>
          )}
        </div>

        <button
          type="button"
          onClick={() => onShowDetail(type, item.id)}
          className="text-left bg-transparent border-0 p-0 cursor-pointer"
        >
          <h3 className="text-[16px] leading-snug font-bold text-[#0f2438] hover:text-[#d97706] transition-colors m-0">
            {item.nama}
          </h3>
        </button>

        <div className="text-xs text-slate-500 mt-1">
          {dest ? dest.alamat || loc : loc}
        </div>

        <p className="text-[13px] leading-relaxed text-slate-600 mt-2.5 mb-4 flex-1 line-clamp-2">
          {dest?.deskripsi ||
            food?.catatan ||
            stay?.catatan ||
            'Informasi contoh; konfirmasi langsung kepada penyedia.'}
        </p>

        <div className="pt-3 border-t border-slate-100 flex justify-between items-center gap-3">
          <div className="tabular-nums">
            <span className="font-bold text-[#0f2438] text-sm">
              {rupiah(price)}
            </span>
            <span className="text-[11px] text-slate-500 ml-1.5">
              simulasi
            </span>
          </div>
          <button
            type="button"
            onClick={() => onShowDetail(type, item.id)}
            className={`border rounded-full px-4 py-1.5 font-semibold text-xs transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              isSelected
                ? 'bg-[#0f2438] text-white border-[#0f2438]'
                : 'bg-[#f59e0b] text-white border-[#f59e0b] hover:bg-[#d97706]'
            }`}
          >
            {isSelected ? 'Sedang dilihat' : 'Detail'}
          </button>
        </div>
      </div>
    </motion.article>
  );
}
