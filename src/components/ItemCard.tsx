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
      className={`group bg-[#0f1f1a] border rounded-xl overflow-hidden card-shadow transition-colors duration-200 flex flex-col ${
        isSelected
          ? 'border-[#24b486] ring-1 ring-[#24b486]/40'
          : 'border-[#1d352d] hover:border-[#2c5245]'
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
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-[#7bc9ad] px-4 text-center">
            <FallbackIcon className="w-6 h-6 opacity-80" strokeWidth={1.6} />
            <span className="text-xs font-medium opacity-85 line-clamp-1">
              {item.nama}
            </span>
          </div>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="text-xs text-[#97b0a5] flex items-center gap-1.5 min-w-0 truncate">
            {food ? (
              <span
                className={
                  food.statusSertifikasiHalal === 'Terverifikasi'
                    ? 'font-semibold text-[#3ad19e]'
                    : 'font-medium text-[#e5a86b]'
                }
              >
                Halal: {food.statusSertifikasiHalal}
              </span>
            ) : dest ? (
              <span className="capitalize font-medium text-[#3ad19e]">
                {cat}
              </span>
            ) : (
              <span className="font-medium text-[#3ad19e]">
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
              className="shrink-0 inline-flex items-center gap-1 border border-[#52272c] bg-[#2a1316] text-[#f28b94] rounded-lg px-2.5 py-1 text-xs font-semibold cursor-pointer hover:bg-[#3a191d] transition-colors whitespace-nowrap"
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
                  ? 'bg-[#2a1316] text-[#f28b94] border-[#52272c]'
                  : 'bg-[#0b1713] text-[#97b0a5] border-[#1d352d] hover:text-[#ecf5f1] hover:border-[#2c5245]'
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
          <h3 className="text-[16px] leading-snug font-semibold text-[#ecf5f1] hover:text-[#3ad19e] transition-colors m-0">
            {item.nama}
          </h3>
        </button>

        <div className="text-xs text-[#97b0a5] mt-1">
          {dest ? dest.alamat || loc : loc}
        </div>

        <p className="text-[13px] leading-relaxed text-[#b2c7be] mt-2.5 mb-4 flex-1 line-clamp-2">
          {dest?.deskripsi ||
            food?.catatan ||
            stay?.catatan ||
            'Informasi contoh; konfirmasi langsung kepada penyedia.'}
        </p>

        <div className="pt-3 border-t border-[#182c25] flex justify-between items-center gap-3">
          <div className="tabular-nums">
            <span className="font-semibold text-[#ecf5f1] text-sm">
              {rupiah(price)}
            </span>
            <span className="text-[11px] text-[#849f93] ml-1.5">
              simulasi
            </span>
          </div>
          <button
            type="button"
            onClick={() => onShowDetail(type, item.id)}
            className={`border rounded-lg px-3.5 py-1.5 font-semibold text-xs transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              isSelected
                ? 'bg-[#24b486] text-[#041b14] border-[#24b486]'
                : 'bg-[#142a23] text-[#d9f0e7] border-[#244237] hover:bg-[#1b382f]'
            }`}
          >
            {isSelected ? 'Sedang dilihat' : 'Lihat detail'}
          </button>
        </div>
      </div>
    </motion.article>
  );
}
