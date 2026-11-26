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
    <aside className="bg-[#0f1f1a] border border-[#1d352d] rounded-2xl overflow-hidden card-shadow">
      <div className="px-4 py-3 border-b border-[#182c25] bg-[#0b1814] flex items-center justify-between gap-3">
        <div
          role="tablist"
          aria-label="Mode panel kanan"
          className="inline-flex items-center gap-1 p-1 bg-[#07110e] border border-[#1d352d] rounded-lg"
        >
          <button
            type="button"
            role="tab"
            aria-selected={!showDetail}
            onClick={() => onChangeMode('map')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              !showDetail
                ? 'bg-[#24b486] text-[#041b14]'
                : 'text-[#97b0a5] hover:text-[#ecf5f1]'
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
                ? 'bg-[#24b486] text-[#041b14] cursor-pointer'
                : selected
                  ? 'text-[#97b0a5] hover:text-[#ecf5f1] cursor-pointer'
                  : 'text-[#52695f] cursor-not-allowed'
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
            className="text-xs font-semibold text-[#3ad19e] hover:underline bg-transparent border-0 p-0 cursor-pointer whitespace-nowrap"
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
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <h3 className="font-display text-lg font-semibold text-[#ecf5f1] m-0">
                  Orientasi wilayah Aceh
                </h3>
                <p className="text-xs text-[#97b0a5] mt-0.5 mb-0">
                  Klik titik pada peta atau daftar di bawah untuk menyaring
                  lokasi di sebelah kiri.
                </p>
              </div>
            </div>

            <div className="bg-[#081310] border border-[#182c25] rounded-xl p-3">
              <svg
                viewBox="0 0 440 290"
                role="img"
                aria-label="Peta interaktif wilayah Aceh"
                className="w-full max-h-[250px]"
              >
                <path
                  d="M95 20 L160 35 188 70 238 82 260 115 315 125 335 170 310 210 270 220 246 270 205 250 176 225 140 220 115 180 80 160 70 110 45 75Z"
                  fill="#133127"
                  stroke="#24b486"
                  strokeWidth="2.2"
                />
                <motion.path
                  d="M70 110 Q140 125 180 110 T310 155"
                  fill="none"
                  stroke="#4ae3b1"
                  strokeOpacity="0.55"
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
                      onClick={() =>
                        onSelectRegion(isActive ? '' : reg)
                      }
                      className="cursor-pointer"
                    >
                      {isActive && (
                        <circle
                          cx={pos.cx}
                          cy={pos.cy}
                          r="15"
                          fill="#24b486"
                          fillOpacity="0.24"
                        />
                      )}
                      <circle
                        cx={pos.cx}
                        cy={pos.cy}
                        r={isActive ? '9' : '7'}
                        fill={isActive ? '#3ad19e' : '#1fa87d'}
                        stroke="#07110e"
                        strokeWidth="2.5"
                      />
                      <text
                        x={pos.tx}
                        y={pos.ty}
                        fill={isActive ? '#3ad19e' : '#dceee6'}
                        fontSize="12"
                        fontWeight={isActive ? '700' : '600'}
                      >
                        {reg}
                      </text>
                    </g>
                  );
                })}

                <text x="16" y="276" fill="#728c81" fontSize="10">
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
                        ? 'bg-[#132c24] border-[#24b486]'
                        : 'bg-[#091411] border-[#182c25] hover:border-[#2c5245]'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => onSelectRegion(isActive ? '' : region)}
                      className="flex-1 text-left bg-transparent border-0 p-0 cursor-pointer flex items-center gap-2 text-xs font-semibold text-[#ecf5f1]"
                    >
                      <MapPin
                        className={`w-3.5 h-3.5 ${
                          isActive ? 'text-[#3ad19e]' : 'text-[#849f93]'
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
                      className="text-[11px] font-medium text-[#97b0a5] hover:text-[#3ad19e] no-underline inline-flex items-center gap-1 shrink-0"
                    >
                      <span>Maps</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </a>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-4 border-t border-[#182c25] grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => onSelectRegion('Sabang')}
                className="group text-left bg-[#091411] border border-[#182c25] hover:border-[#24b486] rounded-lg overflow-hidden p-0 cursor-pointer transition-colors"
              >
                <div className="aspect-[16/10] photo-gradient overflow-hidden">
                  <img
                    src={SABANG_IMAGE}
                    alt="Sabang Pulau Weh"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-300"
                  />
                </div>
                <div className="p-2.5 text-xs font-semibold text-[#ecf5f1]">
                  Bahari Sabang
                </div>
              </button>
              <button
                type="button"
                onClick={() => onSelectRegion('Aceh Tengah')}
                className="group text-left bg-[#091411] border border-[#182c25] hover:border-[#24b486] rounded-lg overflow-hidden p-0 cursor-pointer transition-colors"
              >
                <div className="aspect-[16/10] photo-gradient overflow-hidden">
                  <img
                    src={GAYO_IMAGE}
                    alt="Dataran Tinggi Gayo"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-300"
                  />
                </div>
                <div className="p-2.5 text-xs font-semibold text-[#ecf5f1]">
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
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#3ad19e] hover:underline bg-transparent border-0 p-0 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke peta</span>
        </button>

        <button
          type="button"
          onClick={onToggleFav}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${
            isFav
              ? 'bg-[#2a1316] text-[#f28b94] border-[#52272c]'
              : 'bg-[#091411] text-[#ecf5f1] border-[#1d352d] hover:border-[#2c5245]'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
          <span>{isFav ? 'Tersimpan' : 'Simpan'}</span>
        </button>
      </div>

      {img && (
        <div className="aspect-[16/10] w-full rounded-xl overflow-hidden border border-[#1d352d] mb-4 photo-gradient">
          <img
            src={img}
            alt={`Foto ${item.nama}`}
            referrerPolicy="no-referrer"
            onError={onImgError}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="text-xs font-medium text-[#3ad19e]">
        {isDest ? `Destinasi · ${dest?.kategori}` : isFood ? 'Kuliner & UMKM' : 'Akomodasi'}
        {item.wilayah ? ` · ${item.wilayah}` : ''}
      </div>
      <h3 className="font-display text-2xl font-semibold text-[#ecf5f1] mt-1 mb-2">
        {item.nama}
      </h3>
      <p className="text-sm text-[#b2c7be] leading-relaxed mb-4">
        {dest?.deskripsi || food?.catatan || stay?.catatan || 'Informasi contoh.'}
      </p>

      {dest && (
        <div className="bg-[#091411] border border-[#182c25] rounded-xl p-4 text-[13px] space-y-2 text-[#dceee6]">
          <div>
            <span className="text-[#97b0a5]">Alamat:</span> {dest.alamat}
          </div>
          <div className="tabular-nums">
            <span className="text-[#97b0a5]">Estimasi biaya:</span>{' '}
            {rupiah(dest.estimasiBiaya)} (simulasi)
          </div>
          <div>
            <span className="text-[#97b0a5]">Fasilitas:</span>{' '}
            {(dest.fasilitas || []).join(', ')}
          </div>
          <div>
            <span className="text-[#97b0a5]">Fasilitas ibadah:</span>{' '}
            {(dest.fasilitasIbadah || []).join(', ')}
          </div>
          <div className="text-xs text-[#849f93] pt-1">
            {dest.catatanVerifikasi || 'Informasi perlu verifikasi.'}
          </div>
        </div>
      )}

      {food && (
        <div className="bg-[#091411] border border-[#182c25] rounded-xl p-4 text-[13px] space-y-2 text-[#dceee6]">
          <div className="tabular-nums">
            <span className="text-[#97b0a5]">Harga:</span> {rupiah(food.harga)}{' '}
            (simulasi)
          </div>
          <div>
            <span className="text-[#97b0a5]">Status halal:</span>{' '}
            {food.statusSertifikasiHalal}
          </div>
          <div>
            <span className="text-[#97b0a5]">Sumber:</span>{' '}
            {food.sumberVerifikasi || 'Belum tersedia'}
          </div>
        </div>
      )}

      {stay && (
        <div className="bg-[#091411] border border-[#182c25] rounded-xl p-4 text-[13px] space-y-2 text-[#dceee6]">
          <div className="tabular-nums">
            <span className="text-[#97b0a5]">Harga/malam:</span>{' '}
            {rupiah(stay.hargaPerMalam)} (simulasi)
          </div>
          <div>
            <span className="text-[#97b0a5]">Fasilitas:</span>{' '}
            {(stay.fasilitas || []).join(', ')}
          </div>
          <div>
            <span className="text-[#97b0a5]">Ramah Muslim:</span>{' '}
            {(stay.fasilitasRamahMuslim || []).join(', ')}
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2.5">
        {dest && onAddToItinerary && (
          <button
            type="button"
            onClick={() => onAddToItinerary(dest.id)}
            className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2.5 bg-[#24b486] text-[#041b14] font-semibold text-xs border-0 cursor-pointer hover:bg-[#2ec493] transition-colors"
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
            className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2.5 bg-[#142a23] border border-[#244237] text-[#d9f0e7] font-semibold text-xs no-underline hover:bg-[#1b382f] transition-colors"
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
            className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2.5 bg-[#142a23] border border-[#244237] text-[#d9f0e7] font-semibold text-xs no-underline hover:bg-[#1b382f] transition-colors"
          >
            <span>Hubungi WhatsApp demo</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      {photoSource && (
        <p className="text-[11px] text-[#728c81] mt-3 mb-0">
          Foto:{' '}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={photoSource}
            className="underline text-[#97b0a5] hover:text-white"
          >
            Wikimedia Commons
          </a>
          {item.fotoIlustrasi ? ' · foto ilustrasi' : ''}
        </p>
      )}
    </div>
  );
}
