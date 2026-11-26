import { ArrowRight, ArrowUpRight, Compass, Mountain, Waves } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AcehMapSection } from './components/AcehMapSection';
import { DashboardSection } from './components/DashboardSection';
import { DetailModal, type ModalState } from './components/DetailModal';
import { ItemCard } from './components/ItemCard';
import { PlannerSection } from './components/PlannerSection';
import {
  DB_KEYS,
  DEFAULT_ITINERARY,
  SEED_DB,
  TRANSLATIONS,
  loadDatabase,
} from './data/seed';
import type {
  CatalogType,
  Destination,
  FavoritableType,
  FavoriteItem,
  FoodItem,
  Itinerary,
  Language,
  StayItem,
  TourismDatabase,
  TourPackage,
} from './types/tourism';

const HERO_IMAGE = '/src/assets/images/hero_aceh_panorama_1795663519489.jpg';
const SABANG_IMAGE = '/src/assets/images/aceh_coast_sabang_1795663520301.jpg';
const GAYO_IMAGE = '/src/assets/images/aceh_gayo_highlands_1795663520276.jpg';

function loadFavorites(): FavoriteItem[] {
  try {
    const parsed = JSON.parse(localStorage.getItem('he_favorites') || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function loadItinerary(): Itinerary {
  try {
    const parsed = JSON.parse(
      localStorage.getItem('he_itinerary') || 'null'
    );
    if (!parsed || !Array.isArray(parsed.daftarAktivitas)) {
      return DEFAULT_ITINERARY;
    }
    return parsed;
  } catch {
    return DEFAULT_ITINERARY;
  }
}

function loadLang(): Language {
  const stored = localStorage.getItem('he_lang');
  return stored === 'en' ? 'en' : 'id';
}

export default function App() {
  const [db, setDb] = useState<TourismDatabase>(loadDatabase);
  const [favorites, setFavorites] = useState<FavoriteItem[]>(loadFavorites);
  const [itinerary, setItinerary] = useState<Itinerary>(loadItinerary);
  const [lang, setLang] = useState<Language>(loadLang);

  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'name' | 'cost'>(
    'featured'
  );

  const [favSearch, setFavSearch] = useState('');
  const [favTypeFilter, setFavTypeFilter] = useState<'' | FavoritableType>('');

  const [heroImgFailed, setHeroImgFailed] = useState(false);
  const [sabangImgFailed, setSabangImgFailed] = useState(false);
  const [gayoImgFailed, setGayoImgFailed] = useState(false);

  const [toastMsg, setToastMsg] = useState('');
  const toastTimerRef = useRef<number | null>(null);
  const [modal, setModal] = useState<ModalState>({ kind: 'closed' });

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => {
      setToastMsg('');
    }, 2400);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    localStorage.setItem('he_lang', lang);
  }, [lang]);

  const persistDb = (next: TourismDatabase) => {
    setDb(next);
    localStorage.setItem('he_db', JSON.stringify(next));
  };

  const isFav = useCallback(
    (type: FavoritableType, id: string) =>
      favorites.some((x) => x.tipeItem === type && x.itemId === id),
    [favorites]
  );

  const toggleFav = (type: FavoritableType, id: string) => {
    const exists = isFav(type, id);
    const next = exists
      ? favorites.filter((x) => !(x.tipeItem === type && x.itemId === id))
      : [
          ...favorites,
          {
            id: 'fav' + Date.now(),
            itemId: id,
            tipeItem: type,
            tanggalDitambahkan: new Date().toISOString(),
          },
        ];
    setFavorites(next);
    localStorage.setItem('he_favorites', JSON.stringify(next));
    showToast(exists ? 'Dihapus dari favorit' : 'Ditambahkan ke favorit');
  };

  const regions = useMemo(
    () => [...new Set(db.destinations.map((x) => x.wilayah).filter(Boolean))],
    [db.destinations]
  );

  const categories = useMemo(
    () => [...new Set(db.destinations.map((x) => x.kategori).filter(Boolean))],
    [db.destinations]
  );

  const filteredDestinations = useMemo(() => {
    const q = search.toLowerCase();
    const list = db.destinations.filter(
      (x) =>
        (!q ||
          `${x.nama} ${x.deskripsi} ${x.wilayah}`.toLowerCase().includes(q)) &&
        (!regionFilter || x.wilayah === regionFilter) &&
        (!categoryFilter || x.kategori === categoryFilter)
    );
    if (sortBy === 'name') {
      return [...list].sort((x, y) => x.nama.localeCompare(y.nama));
    }
    if (sortBy === 'cost') {
      return [...list].sort((x, y) => x.estimasiBiaya - y.estimasiBiaya);
    }
    return [...list].sort((x, y) => Number(y.unggulan) - Number(x.unggulan));
  }, [db.destinations, search, regionFilter, categoryFilter, sortBy]);

  const resolvedFavorites = useMemo(() => {
    const validTypes: FavoritableType[] = ['destinations', 'foods', 'stays'];
    return favorites
      .filter((f) => validTypes.includes(f.tipeItem))
      .map((f) => {
        const list = db[f.tipeItem] as (Destination | FoodItem | StayItem)[];
        const found = list.find((item) => item.id === f.itemId);
        return found ? { type: f.tipeItem, item: found } : null;
      })
      .filter(
        (x): x is { type: FavoritableType; item: Destination | FoodItem | StayItem } =>
          x !== null
      );
  }, [favorites, db]);

  const filteredFavorites = useMemo(() => {
    const q = favSearch.toLowerCase();
    return resolvedFavorites.filter(
      ({ item, type }) =>
        (!favTypeFilter || type === favTypeFilter) &&
        (!q || `${item.nama} ${item.wilayah || ''}`.toLowerCase().includes(q))
    );
  }, [resolvedFavorites, favSearch, favTypeFilter]);

  const handleShowDetail = (type: FavoritableType, id: string) => {
    const list = db[type] as (Destination | FoodItem | StayItem)[];
    const item = list.find((y) => y.id === id);
    if (item) setModal({ kind: 'detail', type, item });
  };

  const handleUpdateItinerary = (next: Itinerary, saveToStorage = true) => {
    setItinerary(next);
    if (saveToStorage) {
      localStorage.setItem('he_itinerary', JSON.stringify(next));
    }
  };

  const handleSaveCatalogItem = (
    type: CatalogType,
    item: Destination | FoodItem | StayItem | TourPackage
  ) => {
    const currentList = db[type] as Array<
      Destination | FoodItem | StayItem | TourPackage
    >;
    const idx = currentList.findIndex((y) => y.id === item.id);
    const updatedList =
      idx >= 0
        ? currentList.map((y, i) => (i === idx ? item : y))
        : [...currentList, item];
    persistDb({
      ...db,
      [type]: updatedList,
    } as TourismDatabase);
  };

  const handleDeleteCatalogItem = (type: CatalogType, id: string) => {
    if (!DB_KEYS.includes(type)) return;
    setModal({
      kind: 'confirm',
      title: 'Hapus item?',
      message: 'Hapus item ini dari data demo?',
      confirmLabel: 'Hapus',
      danger: true,
      onConfirm: () => {
        const currentList = db[type] as Array<{ id: string }>;
        persistDb({
          ...db,
          [type]: currentList.filter((x) => x.id !== id),
        } as TourismDatabase);
        showToast('Data dihapus');
      },
    });
  };

  const handleResetAll = () => {
    setModal({
      kind: 'confirm',
      title: 'Reset data contoh?',
      message:
        'Kembalikan semua katalog ke data contoh? Favorit dan itinerary juga akan direset.',
      confirmLabel: 'Reset data',
      danger: true,
      onConfirm: () => {
        const fresh = structuredClone(SEED_DB);
        persistDb(fresh);
        setFavorites([]);
        setItinerary(DEFAULT_ITINERARY);
        localStorage.removeItem('he_favorites');
        localStorage.removeItem('he_itinerary');
        showToast('Data contoh dipulihkan');
      },
    });
  };

  const handleFocusRegion = (regionName: string) => {
    setRegionFilter(regionName);
    setCategoryFilter('');
    setSearch('');
    const target = document.getElementById('destinasi');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
    showToast(`Filter wilayah: ${regionName}`);
  };

  const t = TRANSLATIONS[lang];

  return (
    <div className="min-h-screen flex flex-col bg-[#f8faf8] text-[#132a24]">
      <header className="sticky top-0 z-20 bg-[#f8faf8]/95 backdrop-blur-md border-b border-[#dce6df] no-print">
        <div className="w-[min(1200px,92%)] mx-auto flex items-center justify-between gap-8 h-16">
          <a
            href="#home"
            className="font-display text-xl font-bold tracking-tight text-[#064e3b] no-underline whitespace-nowrap shrink-0"
          >
            Pemuda Aceh
          </a>

          <nav className="hidden md:flex items-center gap-7 text-[13.5px] font-medium text-[#4a6158]">
            <a
              href="#destinasi"
              className="no-underline hover:text-[#064e3b] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              {t.navDest}
            </a>
            <a
              href="#favorit"
              className="no-underline hover:text-[#064e3b] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 tabular-nums"
            >
              {t.navFav} ({resolvedFavorites.length})
            </a>
            <a
              href="#kuliner"
              className="no-underline hover:text-[#064e3b] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              {t.navFood}
            </a>
            <a
              href="#akomodasi"
              className="no-underline hover:text-[#064e3b] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              {t.navStay}
            </a>
            <a
              href="#dashboard"
              className="no-underline hover:text-[#064e3b] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              {t.navDash}
            </a>
          </nav>

          <div className="shrink-0">
            <a
              href="#planner"
              className="inline-flex items-center justify-center rounded-lg px-4 py-2 bg-[#064e3b] text-white font-semibold text-xs no-underline btn-primary-shadow hover:bg-[#08634b] transition-colors whitespace-nowrap shrink-0"
            >
              {t.explore}
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section id="home" className="pt-8 pb-14 sm:pt-12 sm:pb-16 no-print">
          <div className="w-[min(1200px,92%)] mx-auto">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#dce6df]">
              <p className="m-0 text-xs font-medium text-[#5a6f67]">
                {t.heroKicker}
              </p>

              <div
                role="group"
                aria-label="Pilih bahasa"
                className="inline-flex items-center gap-1 p-1 bg-[#edf3ef] rounded-lg border border-[#dce6df]"
              >
                <button
                  type="button"
                  onClick={() => setLang('id')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                    lang === 'id'
                      ? 'bg-white text-[#064e3b] shadow-xs'
                      : 'text-[#5a6f67] hover:text-[#132a24]'
                  }`}
                >
                  ID
                </button>
                <button
                  type="button"
                  onClick={() => setLang('en')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                    lang === 'en'
                      ? 'bg-white text-[#064e3b] shadow-xs'
                      : 'text-[#5a6f67] hover:text-[#132a24]'
                  }`}
                >
                  EN
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1.02fr_0.98fr] gap-8 lg:gap-12 pt-8 sm:pt-10 items-stretch">
              <div className="flex flex-col justify-between py-1">
                <div>
                  <h1 className="font-display text-[clamp(2.3rem,4.1vw,3.75rem)] leading-[1.06] tracking-[-0.025em] text-[#064e3b] font-semibold m-0 text-balance max-w-[16ch]">
                    {t.heroTitle}
                  </h1>
                  <p className="mt-5 mb-0 max-w-[54ch] text-[#4a6158] text-[16px] leading-[1.65]">
                    {t.heroSubtitle}
                  </p>
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-5">
                  <a
                    href="#destinasi"
                    className="inline-flex items-center gap-2 rounded-lg px-5 py-3 bg-[#064e3b] text-white font-semibold text-sm no-underline btn-primary-shadow hover:bg-[#08634b] transition-colors whitespace-nowrap shrink-0"
                  >
                    <span>{t.heroPrimaryCta}</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                  <a
                    href="#planner"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#064e3b] no-underline hover:underline underline-offset-4 whitespace-nowrap shrink-0"
                  >
                    <span>{t.heroSecondaryCta}</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </a>
                </div>
              </div>

              <div className="relative rounded-2xl overflow-hidden min-h-[260px] sm:min-h-[340px] lg:h-full border border-[#dce6df] photo-gradient">
                {!heroImgFailed ? (
                  <img
                    src={HERO_IMAGE}
                    alt={t.heroCaptionTitle}
                    referrerPolicy="no-referrer"
                    onError={() => setHeroImgFailed(true)}
                    className="w-full h-full object-cover block"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-[#064e3b] p-8">
                    <Compass className="w-10 h-10 opacity-75" strokeWidth={1.5} />
                    <span className="font-display text-xl font-semibold">
                      {t.heroCaptionTitle}
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent pointer-events-none" />
                <div className="absolute bottom-0 inset-x-0 p-5 sm:p-6 text-white">
                  <div className="font-display text-lg font-semibold leading-snug">
                    {t.heroCaptionTitle}
                  </div>
                  <div className="text-xs text-white/85 mt-0.5">
                    {t.heroCaptionSub}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 border border-[#dce6df] rounded-xl bg-white divide-y lg:divide-y-0 lg:divide-x divide-[#dce6df]">
              <div className="p-5">
                <div className="font-display text-xl font-semibold text-[#064e3b] tabular-nums">
                  {t.stat1Val}
                </div>
                <div className="text-xs text-[#5a6f67] mt-1 leading-relaxed">
                  {t.stat1Desc}
                </div>
              </div>
              <div className="p-5">
                <div className="font-display text-xl font-semibold text-[#064e3b] tabular-nums">
                  {t.stat2Val}
                </div>
                <div className="text-xs text-[#5a6f67] mt-1 leading-relaxed">
                  {t.stat2Desc}
                </div>
              </div>
              <div className="p-5">
                <div className="font-display text-xl font-semibold text-[#064e3b]">
                  {t.stat3Val}
                </div>
                <div className="text-xs text-[#5a6f67] mt-1 leading-relaxed">
                  {t.stat3Desc}
                </div>
              </div>
              <div className="p-5">
                <div className="font-display text-xl font-semibold text-[#064e3b] tabular-nums">
                  {t.stat4Val}
                </div>
                <div className="text-xs text-[#5a6f67] mt-1 leading-relaxed">
                  {t.stat4Desc}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-14 bg-[#f1f6f3] border-y border-[#dce6df] no-print">
          <div className="w-[min(1200px,92%)] mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
              <div>
                <div className="text-[#0d8a68] font-semibold text-xs tracking-wide">
                  {t.spotlightKicker}
                </div>
                <h2 className="font-display text-[clamp(24px,2.8vw,34px)] leading-[1.15] mt-1.5 mb-2 text-[#064e3b] tracking-[-0.02em] font-semibold max-w-[26ch]">
                  {t.spotlightTitle}
                </h2>
                <p className="text-[#5a6f67] m-0 max-w-[540px] text-[15px]">
                  {t.spotlightDesc}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
              <button
                type="button"
                onClick={() => handleFocusRegion('Sabang')}
                className="lg:col-span-5 group text-left rounded-xl overflow-hidden border border-[#dce6df] bg-white cursor-pointer p-0 flex flex-col card-shadow transition-transform duration-200 hover:-translate-y-0.5"
              >
                <div className="aspect-[4/3] w-full photo-gradient overflow-hidden relative">
                  {!sabangImgFailed ? (
                    <img
                      src={SABANG_IMAGE}
                      alt={t.spotlightSabangTitle}
                      referrerPolicy="no-referrer"
                      onError={() => setSabangImgFailed(true)}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#064e3b]">
                      <Waves className="w-9 h-9 opacity-75" strokeWidth={1.5} />
                    </div>
                  )}
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="text-xs font-medium text-[#5a6f67]">
                      01 · Sabang
                    </div>
                    <h3 className="font-display text-lg font-semibold text-[#064e3b] mt-1 mb-1.5">
                      {t.spotlightSabangTitle}
                    </h3>
                    <p className="text-xs text-[#4a6158] leading-relaxed m-0">
                      {t.spotlightSabangDesc}
                    </p>
                  </div>
                  <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#064e3b]">
                    <span>{t.spotlightAction}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleFocusRegion('Aceh Tengah')}
                className="lg:col-span-4 group text-left rounded-xl overflow-hidden border border-[#dce6df] bg-white cursor-pointer p-0 flex flex-col card-shadow transition-transform duration-200 hover:-translate-y-0.5"
              >
                <div className="aspect-[4/3] w-full photo-gradient overflow-hidden relative">
                  {!gayoImgFailed ? (
                    <img
                      src={GAYO_IMAGE}
                      alt={t.spotlightGayoTitle}
                      referrerPolicy="no-referrer"
                      onError={() => setGayoImgFailed(true)}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#064e3b]">
                      <Mountain className="w-9 h-9 opacity-75" strokeWidth={1.5} />
                    </div>
                  )}
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="text-xs font-medium text-[#5a6f67]">
                      02 · Aceh Tengah
                    </div>
                    <h3 className="font-display text-lg font-semibold text-[#064e3b] mt-1 mb-1.5">
                      {t.spotlightGayoTitle}
                    </h3>
                    <p className="text-xs text-[#4a6158] leading-relaxed m-0">
                      {t.spotlightGayoDesc}
                    </p>
                  </div>
                  <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#064e3b]">
                    <span>{t.spotlightAction}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleFocusRegion('Banda Aceh')}
                className="lg:col-span-3 text-left rounded-xl border border-[#064e3b] bg-[#064e3b] text-white cursor-pointer p-6 flex flex-col justify-between card-shadow transition-transform duration-200 hover:-translate-y-0.5"
              >
                <div>
                  <div className="text-xs font-medium text-emerald-100/80">
                    03 · Banda Aceh
                  </div>
                  <h3 className="font-display text-xl font-semibold text-white mt-2 mb-3 leading-snug">
                    {t.spotlightHeritageTitle}
                  </h3>
                  <p className="text-xs text-emerald-50/85 leading-relaxed m-0">
                    {t.spotlightHeritageDesc}
                  </p>
                </div>

                <div className="pt-6 border-t border-white/15 mt-6 flex items-center justify-between text-xs font-semibold text-white">
                  <span>{t.spotlightAction}</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            </div>
          </div>
        </section>

        <section id="destinasi" className="py-16 no-print">
          <div className="w-[min(1200px,92%)] mx-auto">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-5 mb-6">
              <div>
                <div className="text-[#0d8a68] font-semibold text-xs tracking-wide">
                  Jelajah Lokasi
                </div>
                <h2 className="font-display text-[clamp(26px,3vw,36px)] leading-[1.15] my-1.5 text-[#064e3b] tracking-[-0.02em] font-semibold">
                  Destinasi pilihan
                </h2>
                <p className="text-[#5a6f67] m-0 max-w-[540px] text-[15px]">
                  Inspirasi perjalanan dari pesisir, pegunungan, sejarah, hingga
                  wisata religi.
                </p>
              </div>
              <div className="text-xs font-medium text-[#5a6f67] tabular-nums">
                {filteredDestinations.length} dari {db.destinations.length} destinasi contoh
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr] gap-3 my-5">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari destinasi atau kata kunci…"
                className="col-span-2 lg:col-span-1 w-full px-3.5 py-2.5 border border-[#dce6df] rounded-lg bg-white text-[#132a24] text-sm outline-none focus:border-[#0d8a68]"
              />
              <select
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-[#dce6df] rounded-lg bg-white text-[#132a24] text-sm outline-none focus:border-[#0d8a68]"
              >
                <option value="">Semua wilayah</option>
                {regions.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-[#dce6df] rounded-lg bg-white text-[#132a24] text-sm outline-none focus:border-[#0d8a68]"
              >
                <option value="">Semua kategori</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as 'featured' | 'name' | 'cost')
                }
                className="w-full px-3.5 py-2.5 border border-[#dce6df] rounded-lg bg-white text-[#132a24] text-sm outline-none focus:border-[#0d8a68]"
              >
                <option value="featured">Urutkan: Unggulan</option>
                <option value="name">Nama A–Z</option>
                <option value="cost">Biaya terendah</option>
              </select>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
              <p className="text-xs text-[#5a6f67] m-0">
                Gunakan pencarian, filter wilayah/kategori, dan sorting untuk
                menemukan tempat yang sesuai.
              </p>
              {(search || regionFilter || categoryFilter) && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    setRegionFilter('');
                    setCategoryFilter('');
                  }}
                  className="text-xs font-semibold text-[#064e3b] hover:underline bg-transparent border-0 p-0 cursor-pointer"
                >
                  Reset filter
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredDestinations.length > 0 ? (
                filteredDestinations.map((dest) => (
                  <ItemCard
                    key={dest.id}
                    item={dest}
                    type="destinations"
                    isFavorite={isFav('destinations', dest.id)}
                    onToggleFavorite={toggleFav}
                    onShowDetail={handleShowDetail}
                  />
                ))
              ) : (
                <div className="col-span-full p-8 text-center text-[#5a6f67] bg-white border border-[#dce6df] rounded-xl">
                  Tidak ada destinasi yang cocok dengan filter saat ini.
                </div>
              )}
            </div>
          </div>
        </section>

        <section id="favorit" className="bg-[#f1f6f3] border-t border-[#e5ede8] py-16 no-print">
          <div className="w-[min(1200px,92%)] mx-auto">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-5 mb-6">
              <div>
                <div className="text-[#0d8a68] font-semibold text-xs tracking-wide">
                  Simpanan Pribadi
                </div>
                <h2 className="font-display text-[clamp(26px,3vw,36px)] leading-[1.15] my-1.5 text-[#064e3b] tracking-[-0.02em] font-semibold">
                  Favorit saya
                </h2>
                <p className="text-[#5a6f67] m-0 max-w-[540px] text-[15px]">
                  Destinasi, kuliner, dan akomodasi yang Anda simpan di browser
                  ini.
                </p>
              </div>
              <div className="text-xs font-medium text-[#5a6f67] tabular-nums">
                {filteredFavorites.length} item tersimpan
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-5">
              <input
                value={favSearch}
                onChange={(e) => setFavSearch(e.target.value)}
                placeholder="Cari favorit…"
                className="w-full px-3.5 py-2.5 border border-[#dce6df] rounded-lg bg-white text-[#132a24] text-sm outline-none focus:border-[#0d8a68]"
              />
              <select
                value={favTypeFilter}
                onChange={(e) =>
                  setFavTypeFilter(e.target.value as '' | FavoritableType)
                }
                className="w-full px-3.5 py-2.5 border border-[#dce6df] rounded-lg bg-white text-[#132a24] text-sm outline-none focus:border-[#0d8a68]"
              >
                <option value="">Semua jenis</option>
                <option value="destinations">Destinasi</option>
                <option value="foods">Kuliner &amp; UMKM</option>
                <option value="stays">Akomodasi</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredFavorites.length > 0 ? (
                filteredFavorites.map(({ item, type }) => (
                  <ItemCard
                    key={`${type}-${item.id}`}
                    item={item}
                    type={type}
                    isFavorite
                    mode="favorite"
                    onToggleFavorite={toggleFav}
                    onShowDetail={handleShowDetail}
                  />
                ))
              ) : (
                <div className="col-span-full p-8 text-center text-[#5a6f67] bg-white border border-[#dce6df] rounded-xl">
                  Belum ada favorit yang cocok. Klik tombol hati pada kartu untuk
                  menyimpan item.
                </div>
              )}
            </div>
          </div>
        </section>

        <div className="no-print">
          <AcehMapSection regions={regions} />
        </div>

        <section id="kuliner" className="bg-[#f1f6f3] border-y border-[#e5ede8] py-16 no-print">
          <div className="w-[min(1200px,92%)] mx-auto">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-5 mb-7">
              <div>
                <div className="text-[#0d8a68] font-semibold text-xs tracking-wide">
                  Cita Rasa Lokal
                </div>
                <h2 className="font-display text-[clamp(26px,3vw,36px)] leading-[1.15] my-1.5 text-[#064e3b] tracking-[-0.02em] font-semibold">
                  Kuliner &amp; UMKM lokal
                </h2>
                <p className="text-[#5a6f67] m-0 max-w-[540px] text-[15px]">
                  Kenali cita rasa Aceh dan dukung usaha lokal. Status halal
                  ditampilkan secara transparan.
                </p>
              </div>
              <div className="text-xs font-medium text-[#5a6f67] tabular-nums">
                {db.foods.length} pilihan kuliner
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {db.foods.map((food) => (
                <ItemCard
                  key={food.id}
                  item={food}
                  type="foods"
                  isFavorite={isFav('foods', food.id)}
                  onToggleFavorite={toggleFav}
                  onShowDetail={handleShowDetail}
                />
              ))}
            </div>
          </div>
        </section>

        <section id="akomodasi" className="py-16 no-print">
          <div className="w-[min(1200px,92%)] mx-auto">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-5 mb-7">
              <div>
                <div className="text-[#0d8a68] font-semibold text-xs tracking-wide">
                  Kenyamanan Menginap
                </div>
                <h2 className="font-display text-[clamp(26px,3vw,36px)] leading-[1.15] my-1.5 text-[#064e3b] tracking-[-0.02em] font-semibold">
                  Akomodasi ramah Muslim
                </h2>
                <p className="text-[#5a6f67] m-0 max-w-[540px] text-[15px]">
                  Contoh fasilitas yang dapat membantu kenyamanan wisatawan
                  Muslim.
                </p>
              </div>
              <div className="text-xs font-medium text-[#5a6f67] tabular-nums">
                {db.stays.length} pilihan akomodasi
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {db.stays.map((stay) => (
                <ItemCard
                  key={stay.id}
                  item={stay}
                  type="stays"
                  isFavorite={isFav('stays', stay.id)}
                  onToggleFavorite={toggleFav}
                  onShowDetail={handleShowDetail}
                />
              ))}
            </div>
          </div>
        </section>

        <PlannerSection
          destinations={db.destinations}
          packages={db.packages}
          itinerary={itinerary}
          onUpdateItinerary={handleUpdateItinerary}
          onToast={showToast}
          onCopyFallback={(text) => setModal({ kind: 'copyFallback', text })}
        />

        <DashboardSection
          db={db}
          onSaveItem={handleSaveCatalogItem}
          onDeleteItem={handleDeleteCatalogItem}
          onResetAll={handleResetAll}
          onToast={showToast}
        />
      </main>

      <footer className="bg-[#06382c] text-[#d5e9df] py-10 no-print border-t border-[#0c4f3e]">
        <div className="w-[min(1200px,92%)] mx-auto flex flex-col md:flex-row justify-between gap-6 md:items-center">
          <div>
            <span className="font-display text-lg font-semibold text-white">
              Pemuda Aceh
            </span>
            <p className="mt-1 mb-0 text-xs text-[#b2d1c4]">
              Temukan Aceh, ciptakan pengalaman perjalanan yang bermakna.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-5 text-xs text-[#b2d1c4]">
            <a href="#destinasi" className="text-[#d5e9df] no-underline hover:underline">
              {t.navDest}
            </a>
            <a href="#kuliner" className="text-[#d5e9df] no-underline hover:underline">
              {t.navFood}
            </a>
            <a href="#akomodasi" className="text-[#d5e9df] no-underline hover:underline">
              {t.navStay}
            </a>
            <a href="#planner" className="text-[#d5e9df] no-underline hover:underline">
              {t.navPlan}
            </a>
            <a href="#dashboard" className="text-[#d5e9df] no-underline hover:underline">
              {t.navDash}
            </a>
            <span className="text-[#8fb7a6]">
              Data contoh lokal · Harga &amp; kontak simulasi
            </span>
          </div>
        </div>
      </footer>

      {toastMsg && (
        <div
          role="status"
          className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-[#064e3b] text-white px-4 py-2.5 rounded-lg text-sm font-medium card-shadow z-30 no-print"
        >
          {toastMsg}
        </div>
      )}

      <DetailModal modal={modal} onClose={() => setModal({ kind: 'closed' })} />
    </div>
  );
}
