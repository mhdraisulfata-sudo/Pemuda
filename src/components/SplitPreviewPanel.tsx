import {
  ArrowLeft,
  ArrowUpRight,
  Heart,
  Map as MapIcon,
  MapPin,
  Plus,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { rupiah, safeUrl } from '../data/seed';
import type {
  Destination,
  FavoritableType,
  FoodItem,
  StayItem,
} from '../types/tourism';

export interface SelectedPreviewItem {
  type: FavoritableType;
  item: Destination | FoodItem | StayItem;
}

interface SplitPreviewPanelProps {
  regions: string[];
  activeRegionFilter: string;
  onSelectRegion: (region: string) => void;
  selected: SelectedPreviewItem | null;
  panelMode: 'map' | 'detail';
  onChangeMode: (mode: 'map' | 'detail') => void;
  isFavorite: (type: FavoritableType, id: string) => boolean;
  onToggleFavorite: (type: FavoritableType, id: string) => void;
  onAddToItinerary?: (destId: string) => void;
}

const REGION_COORDS: Record<string, { cx: number; cy: number; tx: number; ty: number }> = {
  Sabang: { cx: 82, cy: 150, tx: 10, ty: 135 },
  'Banda Aceh': { cx: 120, cy: 180, tx: 22, ty: 207 },
  'Aceh Besar': { cx: 170, cy: 90, tx: 148, ty: 70 },
  'Aceh Tengah': { cx: 255, cy: 135, tx: 266, ty: 124 },
  'Bener Meriah': { cx: 275, cy: 205, tx: 286, ty: 222 },
};

const SABANG_IMAGE = '/src/assets/images/aceh_coast_sabang_1795663520301.jpg';
const GAYO_IMAGE = '/src/assets/images/aceh_gayo_highlands_1795663520276.jpg';

export function SplitPreviewPanel({
  regions,
  activeRegionFilter,
  onSelectRegion,
  selected,
  panelMode,
  onChangeMode,
  isFavorite,
  onToggleFavorite,
  onAddToItinerary,
}: SplitPreviewPanelProps) {
  const [detailImgError, setDetailImgError] = useState(false);

  const showDetail = panelMode === 'detail' && selected !== null;

  return (
    <aside className="bg-white border border-slate-200 rounded-2xl overflow-hidden card-shadow">
      <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
        <div
          role="tablist"
          aria-label="Mode panel kanan"
          className="inline-flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-lg"
        >
          <button
            type="button"
            role="tab"
            aria-selected={!showDetail}
            onClick={() => onChangeMode('map')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              !showDetail
                ? 'bg-[#0f2438] text-white'
                : 'text-slate-600 hover:text-[#0f2438]'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>Peta Wilayah</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={showDetail}
            disabled={!selected}
            onClick={() => selected && onChangeMode('detail')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
              showDetail
                ? 'bg-[#0f2438] text-white cursor-pointer'
                : selected
                  ? 'text-slate-600 hover:text-[#0f2438] cursor-pointer'
                  : 'text-slate-400 cursor-not-allowed'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Pratinjau Detail</span>
          </button>
        </div>

        {activeRegionFilter && !showDetail && (
          <button
            type="button"
            onClick={() => onSelectRegion('')}
            className="text-xs font-semibold text-[#d97706] hover:underline bg-transparent border-0 p-0 cursor-pointer whitespace-nowrap"
          >
            Reset wilayah
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {showDetail && selected ? (
          <motion.div
            key={`detail-${selected.type}-${selected.item.id}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="p-5"
          >
            <DetailPreviewBody
              selected={selected}
              imgError={detailImgError}
              onImgError={() => setDetailImgError(true)}
              onResetImgError={() => setDetailImgError(false)}
              isFav={isFavorite(selected.type, selected.item.id)}
              onToggleFav={() =>
                onToggleFavorite(selected.type, selected.item.id)
              }
              onBackToMap={() => onChangeMode('map')}
              onAddToItinerary={onAddToItinerary}
            />
          </motion.div>
        ) : (
          <motion.div
            key="map-panel"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="p-5"
          >
            <div className="mb-3">
              <h3 className="font-display text-lg font-semibold text-[#0f2438] m-0">
                Orientasi wilayah Aceh
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 mb-0">
                Klik titik pada peta atau daftar di bawah untuk menyaring
                lokasi di sebelah kiri.
              </p>
            </div>

            <div className="bg-[#f1f6fa] border border-slate-200 rounded-xl p-3">
              <svg
                viewBox="0 0 440 290"
                role="img"
                aria-label="Peta interaktif wilayah Aceh"
                className="w-full max-h-[250px]"
              >
                <path
                  d="M95 20 L160 35 188 70 238 82 260 115 315 125 335 170 310 210 270 220 246 270 205 250 176 225 140 220 115 180 80 160 70 110 45 75Z"
                  fill="#d5e6f3"
                  stroke="#0f2438"
                  strokeWidth="2.2"
                />
                <motion.path
                  d="M70 110 Q140 125 180 110 T310 155"
                  fill="none"
                  stroke="#f59e0b"
                  strokeOpacity="0.85"
                  strokeWidth="3"
                  strokeDasharray="6 6"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.9, ease: 'easeOut' }}
                />

                {regions.map((reg) => {
                  const pos = REGION_COORDS[reg];
                  if (!pos) return null;
                  const isActive = activeRegionFilter === reg;
                  return (
                    <g
                      key={reg}
                      onClick={() => onSelectRegion(isActive ? '' : reg)}
                      className="cursor-pointer"
                    >
                      {isActive && (
                        <circle
                          cx={pos.cx}
                          cy={pos.cy}
                          r="15"
                          fill="#f59e0b"
                          fillOpacity="0.25"
                        />
                      )}
                      <circle
                        cx={pos.cx}
                        cy={pos.cy}
                        r={isActive ? '9' : '7'}
                        fill={isActive ? '#f59e0b' : '#0f2438'}
                        stroke="#ffffff"
                        strokeWidth="2.5"
                      />
                      <text
                        x={pos.tx}
                        y={pos.ty}
                        fill={isActive ? '#b45309' : '#0f2438'}
                        fontSize="12"
                        fontWeight={isActive ? '700' : '600'}
                      >
                        {reg}
                      </text>
                    </g>
                  );
                })}

                <text x="16" y="276" fill="#64748b" fontSize="10">
                  Skema ilustratif · klik wilayah untuk filter
                </text>
              </svg>
            </div>

            <div className="mt-4 grid gap-2">
              {regions.map((region) => {
                const isActive = activeRegionFilter === region;
                return (
                  <div
                    key={region}
                    className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-2 transition-colors ${
                      isActive
                        ? 'bg-amber-50 border-[#f59e0b]'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => onSelectRegion(isActive ? '' : region)}
                      className="flex-1 text-left bg-transparent border-0 p-0 cursor-pointer flex items-center gap-2 text-xs font-semibold text-[#0f2438]"
                    >
                      <MapPin
                        className={`w-3.5 h-3.5 ${
                          isActive ? 'text-[#d97706]' : 'text-slate-500'
                        }`}
                      />
                      <span>{region}</span>
                    </button>
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        region + ', Aceh'
                      )}`}
                      aria-label={`Buka ${region} di Google Maps`}
                      className="text-[11px] font-medium text-slate-600 hover:text-[#0f2438] no-underline inline-flex items-center gap-1 shrink-0"
                    >
                      <span>Maps</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </a>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => onSelectRegion('Sabang')}
                className="group text-left bg-slate-50 border border-slate-200 hover:border-[#f59e0b] rounded-lg overflow-hidden p-0 cursor-pointer transition-colors"
              >
                <div className="aspect-[16/10] photo-gradient overflow-hidden">
                  <img
                    src={SABANG_IMAGE}
                    alt="Sabang Pulau Weh"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-300"
                  />
                </div>
                <div className="p-2.5 text-xs font-semibold text-[#0f2438]">
                  Bahari Sabang
                </div>
              </button>
              <button
                type="button"
                onClick={() => onSelectRegion('Aceh Tengah')}
                className="group text-left bg-slate-50 border border-slate-200 hover:border-[#f59e0b] rounded-lg overflow-hidden p-0 cursor-pointer transition-colors"
              >
                <div className="aspect-[16/10] photo-gradient overflow-hidden">
                  <img
                    src={GAYO_IMAGE}
                    alt="Dataran Tinggi Gayo"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-300"
                  />
                </div>
                <div className="p-2.5 text-xs font-semibold text-[#0f2438]">
                  Gayo &amp; Laut Tawar
                </div>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </aside>
  );
}

function DetailPreviewBody({
  selected,
  imgError,
  onImgError,
  onResetImgError,
  isFav,
  onToggleFav,
  onBackToMap,
  onAddToItinerary,
}: {
  selected: SelectedPreviewItem;
  imgError: boolean;
  onImgError: () => void;
  onResetImgError: () => void;
  isFav: boolean;
  onToggleFav: () => void;
  onBackToMap: () => void;
  onAddToItinerary?: (destId: string) => void;
}) {
  const { type, item } = selected;
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
      <div className="flex items-center justify-between gap-3 mb-3">
        <button
          type="button"
          onClick={() => {
            onResetImgError();
            onBackToMap();
          }}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0f2438] hover:text-[#d97706] bg-transparent border-0 p-0 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke peta</span>
        </button>

        <button
          type="button"
          onClick={onToggleFav}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${
            isFav
              ? 'bg-rose-50 text-rose-700 border-rose-200'
              : 'bg-slate-50 text-[#0f2438] border-slate-200 hover:border-slate-300'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
          <span>{isFav ? 'Tersimpan' : 'Simpan'}</span>
        </button>
      </div>

      {img && (
        <div className="aspect-[16/10] w-full rounded-xl overflow-hidden border border-slate-200 mb-4 photo-gradient">
          <img
            src={img}
            alt={`Foto ${item.nama}`}
            referrerPolicy="no-referrer"
            onError={onImgError}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="text-xs font-semibold text-[#d97706] capitalize">
        {isDest ? `Destinasi · ${dest?.kategori}` : isFood ? 'Kuliner & UMKM' : 'Akomodasi'}
        {item.wilayah ? ` · ${item.wilayah}` : ''}
      </div>
      <h3 className="font-display text-2xl font-semibold text-[#0f2438] mt-1 mb-2">
        {item.nama}
      </h3>
      <p className="text-sm text-slate-600 leading-relaxed mb-4">
        {dest?.deskripsi || food?.catatan || stay?.catatan || 'Informasi contoh.'}
      </p>

      {dest && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-[13px] space-y-2 text-[#0f2438]">
          <div>
            <span className="text-slate-500">Alamat:</span> {dest.alamat}
          </div>
          <div className="tabular-nums">
            <span className="text-slate-500">Estimasi biaya:</span>{' '}
            {rupiah(dest.estimasiBiaya)} (simulasi)
          </div>
          <div>
            <span className="text-slate-500">Fasilitas:</span>{' '}
            {(dest.fasilitas || []).join(', ')}
          </div>
          <div>
            <span className="text-slate-500">Fasilitas ibadah:</span>{' '}
            {(dest.fasilitasIbadah || []).join(', ')}
          </div>
          <div className="text-xs text-slate-500 pt-1">
            {dest.catatanVerifikasi || 'Informasi perlu verifikasi.'}
          </div>
        </div>
      )}

      {food && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-[13px] space-y-2 text-[#0f2438]">
          <div className="tabular-nums">
            <span className="text-slate-500">Harga:</span> {rupiah(food.harga)}{' '}
            (simulasi)
          </div>
          <div>
            <span className="text-slate-500">Status halal:</span>{' '}
            {food.statusSertifikasiHalal}
          </div>
          <div>
            <span className="text-slate-500">Sumber:</span>{' '}
            {food.sumberVerifikasi || 'Belum tersedia'}
          </div>
        </div>
      )}

      {stay && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-[13px] space-y-2 text-[#0f2438]">
          <div className="tabular-nums">
            <span className="text-slate-500">Harga/malam:</span>{' '}
            {rupiah(stay.hargaPerMalam)} (simulasi)
          </div>
          <div>
            <span className="text-slate-500">Fasilitas:</span>{' '}
            {(stay.fasilitas || []).join(', ')}
          </div>
          <div>
            <span className="text-slate-500">Ramah Muslim:</span>{' '}
            {(stay.fasilitasRamahMuslim || []).join(', ')}
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2.5">
        {dest && onAddToItinerary && (
          <button
            type="button"
            onClick={() => onAddToItinerary(dest.id)}
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 bg-[#f59e0b] text-white font-semibold text-xs border-0 cursor-pointer hover:bg-[#d97706] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Masukkan ke Itinerary</span>
          </button>
        )}

        {dest && (
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={safeUrl(dest.mapsUrl) || '#'}
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 bg-[#0f2438] text-white font-semibold text-xs no-underline hover:bg-[#1a3957] transition-colors"
          >
            <span>Buka Google Maps</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        )}

        {contact && (
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={`https://wa.me/${encodeURIComponent(contact)}?text=${encodeURIComponent(
              'Halo, saya ingin bertanya tentang informasi layanan (mode demo Pemuda Aceh).'
            )}`}
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 bg-[#0f2438] text-white font-semibold text-xs no-underline hover:bg-[#1a3957] transition-colors"
          >
            <span>Hubungi WhatsApp demo</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      {photoSource && (
        <p className="text-[11px] text-slate-500 mt-3 mb-0">
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
    </div>
  );
}
