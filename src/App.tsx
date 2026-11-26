import { ArrowRight } from 'lucide-react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DashboardSection } from './components/DashboardSection';
import { DetailModal, type ModalState } from './components/DetailModal';
import { HeroDestinationSlideshow } from './components/HeroDestinationSlideshow';
import { ItemCard } from './components/ItemCard';
import { PlannerSection } from './components/PlannerSection';
import {
  SplitPreviewPanel,
  type SelectedPreviewItem,
} from './components/SplitPreviewPanel';
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
const EASE_OUT = [0.16, 1, 0.3, 1] as const;

type ExplorerTab = FavoritableType | 'favorites';

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

  const [activeTab, setActiveTab] = useState<ExplorerTab>('destinations');
  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'name' | 'cost'>(
    'featured'
  );
  const [favTypeFilter, setFavTypeFilter] = useState<'' | FavoritableType>('');

  const [selectedPreview, setSelectedPreview] =
    useState<SelectedPreviewItem | null>(null);
  const [panelMode, setPanelMode] = useState<'map' | 'detail'>('map');

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

  const filteredFoods = useMemo(() => {
    const q = search.toLowerCase();
    return db.foods.filter(
      (x) =>
        (!q || `${x.nama} ${x.wilayah} ${x.catatan || ''}`.toLowerCase().includes(q)) &&
        (!regionFilter || x.wilayah === regionFilter)
    );
  }, [db.foods, search, regionFilter]);

  const filteredStays = useMemo(() => {
    const q = search.toLowerCase();
    return db.stays.filter(
      (x) =>
        (!q || `${x.nama} ${x.wilayah} ${x.catatan || ''}`.toLowerCase().includes(q)) &&
        (!regionFilter || x.wilayah === regionFilter)
    );
  }, [db.stays, search, regionFilter]);

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
    const q = search.toLowerCase();
    return resolvedFavorites.filter(
      ({ item, type }) =>
        (!favTypeFilter || type === favTypeFilter) &&
        (!regionFilter || item.wilayah === regionFilter) &&
        (!q || `${item.nama} ${item.wilayah || ''}`.toLowerCase().includes(q))
    );
  }, [resolvedFavorites, search, favTypeFilter, regionFilter]);

  const handleShowDetail = (type: FavoritableType, id: string) => {
    const list = db[type] as (Destination | FoodItem | StayItem)[];
    const item = list.find((y) => y.id === id);
    if (!item) return;

    setSelectedPreview({ type, item });
    setPanelMode('detail');

    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setModal({ kind: 'detail', type, item });
    }
  };

  const handleUpdateItinerary = (next: Itinerary, saveToStorage = true) => {
    setItinerary(next);
    if (saveToStorage) {
      localStorage.setItem('he_itinerary', JSON.stringify(next));
    }
  };

  const handleQuickAddToItinerary = (destId: string) => {
    const dest = db.destinations.find((d) => d.id === destId);
    if (!dest) return;
    const next: Itinerary = {
      ...itinerary,
      daftarAktivitas: [
        ...itinerary.daftarAktivitas,
        {
          id: 'a' + Date.now(),
          hari: 1,
          itemId: destId,
          tipeItem: 'destinasi',
          waktu: '',
          catatan: '',
        },
      ],
    };
    handleUpdateItinerary(next, true);
    showToast(`${dest.nama} ditambahkan ke Hari 1`);
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

  const jumpToExplorerTab = (tab: ExplorerTab) => {
    setActiveTab(tab);
    const el = document.getElementById('explorer');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectRegionFromMap = (regionName: string) => {
    setRegionFilter(regionName);
    if (regionName) {
      showToast(`Wilayah disaring: ${regionName}`);
    }
  };

  const t = TRANSLATIONS[lang];
  const controlClass =
    'w-full px-3.5 py-2 border border-[#1d352d] rounded-lg bg-[#0b1814] text-[#ecf5f1] placeholder-[#728c81] text-sm outline-none focus:border-[#24b486] transition-colors';

  const explorerTabs: { id: ExplorerTab; label: string; count: number }[] = [
    { id: 'destinations', label: t.navDest, count: db.destinations.length },
    { id: 'foods', label: t.navFood, count: db.foods.length },
    { id: 'stays', label: t.navStay, count: db.stays.length },
    { id: 'favorites', label: t.navFav, count: resolvedFavorites.length },
  ];

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen flex flex-col bg-[#07110e] text-[#ecf5f1]">
        <header className="sticky top-0 z-20 bg-[#07110e]/92 backdrop-blur-md border-b border-[#182c25] no-print">
          <div className="w-[min(1360px,94%)] mx-auto flex items-center justify-between gap-8 h-16">
            <a
              href="#home"
              className="font-display text-xl font-semibold tracking-tight text-[#ecf5f1] no-underline whitespace-nowrap shrink-0"
            >
              Pemuda Aceh
            </a>

            <nav className="hidden md:flex items-center gap-7 text-[13.5px] font-medium text-[#97b0a5]">
              <button
                type="button"
                onClick={() => jumpToExplorerTab('destinations')}
                className={`bg-transparent border-0 p-0 cursor-pointer hover:text-[#ecf5f1] transition-colors whitespace-nowrap shrink-0 ${
                  activeTab === 'destinations' ? 'text-[#ecf5f1]' : ''
                }`}
              >
                {t.navDest}
              </button>
              <button
                type="button"
                onClick={() => jumpToExplorerTab('foods')}
                className={`bg-transparent border-0 p-0 cursor-pointer hover:text-[#ecf5f1] transition-colors whitespace-nowrap shrink-0 ${
                  activeTab === 'foods' ? 'text-[#ecf5f1]' : ''
                }`}
              >
                {t.navFood}
              </button>
              <button
                type="button"
                onClick={() => jumpToExplorerTab('stays')}
                className={`bg-transparent border-0 p-0 cursor-pointer hover:text-[#ecf5f1] transition-colors whitespace-nowrap shrink-0 ${
                  activeTab === 'stays' ? 'text-[#ecf5f1]' : ''
                }`}
              >
                {t.navStay}
              </button>
              <button
                type="button"
                onClick={() => jumpToExplorerTab('favorites')}
                className={`bg-transparent border-0 p-0 cursor-pointer hover:text-[#ecf5f1] transition-colors whitespace-nowrap shrink-0 tabular-nums ${
                  activeTab === 'favorites' ? 'text-[#ecf5f1]' : ''
                }`}
              >
                {t.navFav} ({resolvedFavorites.length})
              </button>
              <a
                href="#dashboard"
                className="no-underline hover:text-[#ecf5f1] transition-colors whitespace-nowrap shrink-0"
              >
                {t.navDash}
              </a>
            </nav>

            <div className="shrink-0">
              <motion.a
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                href="#planner"
                className="inline-flex items-center justify-center rounded-lg px-4 py-2 bg-[#24b486] text-[#041b14] font-semibold text-xs no-underline btn-primary-shadow hover:bg-[#2ec493] transition-colors whitespace-nowrap shrink-0"
              >
                {t.explore}
              </motion.a>
            </div>
          </div>
        </header>

        <main className="flex-1">
          <section
            id="home"
            className="relative overflow-hidden py-7 sm:py-9 border-b border-[#152822] no-print"
          >
            <motion.div
              aria-hidden="true"
              animate={{ opacity: [0.25, 0.4, 0.25], scale: [1, 1.05, 1] }}
              transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
              className="pointer-events-none absolute -top-40 right-[8%] w-[460px] h-[460px] rounded-full bg-[radial-gradient(circle,rgba(31,168,125,0.2)_0%,transparent_70%)]"
            />

            <div className="w-[min(1360px,94%)] mx-auto relative grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-7 items-center">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: EASE_OUT }}
              >
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <span className="text-xs font-medium text-[#3ad19e]">
                    {t.heroKicker}
                  </span>
                  <div
                    role="group"
                    aria-label="Pilih bahasa"
                    className="inline-flex items-center gap-1 p-0.5 bg-[#0f1f1a] rounded-lg border border-[#1d352d]"
                  >
                    <button
                      type="button"
                      onClick={() => setLang('id')}
                      className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors cursor-pointer ${
                        lang === 'id'
                          ? 'bg-[#24b486] text-[#041b14]'
                          : 'text-[#97b0a5] hover:text-[#ecf5f1]'
                      }`}
                    >
                      ID
                    </button>
                    <button
                      type="button"
                      onClick={() => setLang('en')}
                      className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors cursor-pointer ${
                        lang === 'en'
                          ? 'bg-[#24b486] text-[#041b14]'
                          : 'text-[#97b0a5] hover:text-[#ecf5f1]'
                      }`}
                    >
                      EN
                    </button>
                  </div>
                </div>

                <h1 className="font-display text-[clamp(2rem,3.4vw,3.15rem)] leading-[1.08] tracking-[-0.02em] text-[#ecf5f1] font-semibold m-0 text-balance max-w-[18ch]">
                  {t.heroTitle}
                </h1>
                <p className="mt-3 mb-0 max-w-[58ch] text-[#b2c7be] text-[15px] leading-relaxed">
                  {t.heroSubtitle}
                </p>

                <div className="mt-5 flex flex-wrap items-center gap-6 text-xs text-[#97b0a5] tabular-nums">
                  <span>
                    <strong className="text-[#ecf5f1] font-semibold">
                      {t.stat1Val}
                    </strong>{' '}
                    · Banda Aceh hingga Gayo
                  </span>
                  <span>
                    <strong className="text-[#ecf5f1] font-semibold">
                      {t.stat2Val}
                    </strong>{' '}
                    · {t.stat3Val}
                  </span>
                  <a
                    href="#explorer"
                    className="inline-flex items-center gap-1 font-semibold text-[#3ad19e] no-underline hover:underline"
                  >
                    <span>{t.heroPrimaryCta}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </motion.div>

              <HeroDestinationSlideshow
                destinations={db.destinations}
                fallbackImage={HERO_IMAGE}
                onSelectDestination={(dest) => {
                  setActiveTab('destinations');
                  handleShowDetail('destinations', dest.id);
                  document
                    .getElementById('explorer')
                    ?.scrollIntoView({ behavior: 'smooth' });
                }}
              />
            </div>
          </section>

          <section id="explorer" className="py-10 sm:py-12 no-print">
            <div className="w-[min(1360px,94%)] mx-auto grid grid-cols-1 lg:grid-cols-[1.12fr_0.88fr] gap-6 items-start">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div
                    role="tablist"
                    aria-label="Kategori katalog"
                    className="inline-flex items-center gap-1 p-1 bg-[#0b1814] border border-[#1d352d] rounded-xl flex-wrap"
                  >
                    {explorerTabs.map((tab) => {
                      const isActive = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          role="tab"
                          aria-selected={isActive}
                          onClick={() => {
                            setActiveTab(tab.id);
                            setCategoryFilter('');
                            setFavTypeFilter('');
                          }}
                          className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap tabular-nums ${
                            isActive
                              ? 'bg-[#24b486] text-[#041b14]'
                              : 'text-[#97b0a5] hover:text-[#ecf5f1]'
                          }`}
                        >
                          {tab.label} ({tab.count})
                        </button>
                      );
                    })}
                  </div>

                  {(search || regionFilter || categoryFilter || favTypeFilter) && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearch('');
                        setRegionFilter('');
                        setCategoryFilter('');
                        setFavTypeFilter('');
                      }}
                      className="text-xs font-semibold text-[#3ad19e] hover:underline bg-transparent border-0 p-0 cursor-pointer whitespace-nowrap"
                    >
                      Reset filter
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 mb-5">
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari nama, lokasi, kata kunci…"
                    className={`sm:col-span-2 ${controlClass}`}
                  />
                  <select
                    value={regionFilter}
                    onChange={(e) => setRegionFilter(e.target.value)}
                    className={controlClass}
                  >
                    <option value="">Semua wilayah</option>
                    {regions.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>

                  {activeTab === 'destinations' ? (
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className={controlClass}
                    >
                      <option value="">Semua kategori</option>
                      {categories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  ) : activeTab === 'favorites' ? (
                    <select
                      value={favTypeFilter}
                      onChange={(e) =>
                        setFavTypeFilter(e.target.value as '' | FavoritableType)
                      }
                      className={controlClass}
                    >
                      <option value="">Semua jenis</option>
                      <option value="destinations">Destinasi</option>
                      <option value="foods">Kuliner &amp; UMKM</option>
                      <option value="stays">Akomodasi</option>
                    </select>
                  ) : (
                    <select
                      value={sortBy}
                      onChange={(e) =>
                        setSortBy(e.target.value as 'featured' | 'name' | 'cost')
                      }
                      className={controlClass}
                    >
                      <option value="featured">Urutkan: Default</option>
                      <option value="name">Nama A–Z</option>
                      <option value="cost">Biaya terendah</option>
                    </select>
                  )}
                </div>

                {activeTab === 'destinations' && (
                  <div className="flex items-center justify-between gap-3 mb-4 text-xs text-[#97b0a5]">
                    <span className="tabular-nums">
                      Menampilkan {filteredDestinations.length} dari{' '}
                      {db.destinations.length} destinasi
                    </span>
                    <select
                      value={sortBy}
                      onChange={(e) =>
                        setSortBy(e.target.value as 'featured' | 'name' | 'cost')
                      }
                      aria-label="Urutkan destinasi"
                      className="px-2.5 py-1 border border-[#1d352d] rounded-md bg-[#0b1814] text-[#ecf5f1] text-xs outline-none focus:border-[#24b486]"
                    >
                      <option value="featured">Urutkan: Unggulan</option>
                      <option value="name">Nama A–Z</option>
                      <option value="cost">Biaya terendah</option>
                    </select>
                  </div>
                )}

                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2, ease: EASE_OUT }}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                  >
                    {activeTab === 'destinations' &&
                      (filteredDestinations.length > 0 ? (
                        filteredDestinations.map((dest) => (
                          <ItemCard
                            key={dest.id}
                            item={dest}
                            type="destinations"
                            isFavorite={isFav('destinations', dest.id)}
                            isSelected={
                              panelMode === 'detail' &&
                              selectedPreview?.type === 'destinations' &&
                              selectedPreview?.item.id === dest.id
                            }
                            onToggleFavorite={toggleFav}
                            onShowDetail={handleShowDetail}
                          />
                        ))
                      ) : (
                        <div className="col-span-full p-8 text-center text-[#97b0a5] bg-[#0f1f1a] border border-[#1d352d] rounded-xl">
                          Tidak ada destinasi yang cocok dengan filter saat ini.
                        </div>
                      ))}

                    {activeTab === 'foods' &&
                      (filteredFoods.length > 0 ? (
                        filteredFoods.map((food) => (
                          <ItemCard
                            key={food.id}
                            item={food}
                            type="foods"
                            isFavorite={isFav('foods', food.id)}
                            isSelected={
                              panelMode === 'detail' &&
                              selectedPreview?.type === 'foods' &&
                              selectedPreview?.item.id === food.id
                            }
                            onToggleFavorite={toggleFav}
                            onShowDetail={handleShowDetail}
                          />
                        ))
                      ) : (
                        <div className="col-span-full p-8 text-center text-[#97b0a5] bg-[#0f1f1a] border border-[#1d352d] rounded-xl">
                          Tidak ada kuliner yang cocok dengan filter saat ini.
                        </div>
                      ))}

                    {activeTab === 'stays' &&
                      (filteredStays.length > 0 ? (
                        filteredStays.map((stay) => (
                          <ItemCard
                            key={stay.id}
                            item={stay}
                            type="stays"
                            isFavorite={isFav('stays', stay.id)}
                            isSelected={
                              panelMode === 'detail' &&
                              selectedPreview?.type === 'stays' &&
                              selectedPreview?.item.id === stay.id
                            }
                            onToggleFavorite={toggleFav}
                            onShowDetail={handleShowDetail}
                          />
                        ))
                      ) : (
                        <div className="col-span-full p-8 text-center text-[#97b0a5] bg-[#0f1f1a] border border-[#1d352d] rounded-xl">
                          Tidak ada akomodasi yang cocok dengan filter saat ini.
                        </div>
                      ))}

                    {activeTab === 'favorites' &&
                      (filteredFavorites.length > 0 ? (
                        filteredFavorites.map(({ item, type }) => (
                          <ItemCard
                            key={`${type}-${item.id}`}
                            item={item}
                            type={type}
                            isFavorite
                            isSelected={
                              panelMode === 'detail' &&
                              selectedPreview?.type === type &&
                              selectedPreview?.item.id === item.id
                            }
                            mode="favorite"
                            onToggleFavorite={toggleFav}
                            onShowDetail={handleShowDetail}
                          />
                        ))
                      ) : (
                        <div className="col-span-full p-8 text-center text-[#97b0a5] bg-[#0f1f1a] border border-[#1d352d] rounded-xl">
                          Belum ada favorit tersimpan. Klik tombol hati pada
                          kartu untuk menyimpannya.
                        </div>
                      ))}
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="lg:sticky lg:top-20">
                <SplitPreviewPanel
                  regions={regions}
                  activeRegionFilter={regionFilter}
                  onSelectRegion={handleSelectRegionFromMap}
                  selected={selectedPreview}
                  panelMode={panelMode}
                  onChangeMode={setPanelMode}
                  isFavorite={isFav}
                  onToggleFavorite={toggleFav}
                  onAddToItinerary={handleQuickAddToItinerary}
                />
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

        <footer className="bg-[#050c0a] text-[#b2c7be] py-10 no-print border-t border-[#152822]">
          <div className="w-[min(1360px,94%)] mx-auto flex flex-col md:flex-row justify-between gap-6 md:items-center">
            <div>
              <span className="font-display text-lg font-semibold text-[#ecf5f1]">
                Pemuda Aceh
              </span>
              <p className="mt-1 mb-0 text-xs text-[#97b0a5]">
                Temukan Aceh, ciptakan pengalaman perjalanan yang bermakna.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-5 text-xs text-[#97b0a5]">
              <button
                type="button"
                onClick={() => jumpToExplorerTab('destinations')}
                className="bg-transparent border-0 p-0 text-xs text-[#d9f0e7] cursor-pointer hover:underline"
              >
                {t.navDest}
              </button>
              <button
                type="button"
                onClick={() => jumpToExplorerTab('foods')}
                className="bg-transparent border-0 p-0 text-xs text-[#d9f0e7] cursor-pointer hover:underline"
              >
                {t.navFood}
              </button>
              <button
                type="button"
                onClick={() => jumpToExplorerTab('stays')}
                className="bg-transparent border-0 p-0 text-xs text-[#d9f0e7] cursor-pointer hover:underline"
              >
                {t.navStay}
              </button>
              <a
                href="#planner"
                className="text-[#d9f0e7] no-underline hover:underline"
              >
                {t.navPlan}
              </a>
              <a
                href="#dashboard"
                className="text-[#d9f0e7] no-underline hover:underline"
              >
                {t.navDash}
              </a>
              <span className="text-[#728c81]">
                Data contoh lokal · Harga &amp; kontak simulasi
              </span>
            </div>
          </div>
        </footer>

        <AnimatePresence>
          {toastMsg && (
            <motion.div
              key={toastMsg}
              initial={{ opacity: 0, y: 14, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.96 }}
              transition={{ duration: 0.2, ease: EASE_OUT }}
              role="status"
              className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-[#143026] border border-[#24b486]/40 text-[#ecf5f1] px-4 py-2.5 rounded-lg text-sm font-medium shadow-2xl z-30 no-print"
            >
              {toastMsg}
            </motion.div>
          )}
        </AnimatePresence>

        <DetailModal modal={modal} onClose={() => setModal({ kind: 'closed' })} />
      </div>
    </MotionConfig>
  );
}
