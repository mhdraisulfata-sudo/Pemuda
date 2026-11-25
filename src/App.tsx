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

  const t = TRANSLATIONS[lang];

  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-[#064e3b] text-white text-[10px] sm:text-[12px] py-[7px] no-print">
        <div className="w-[min(1160px,92%)] mx-auto flex justify-between gap-3">
          <span>✦ Jelajahi Aceh bersama Pemuda Aceh</span>
          <span>Data demo · Harga &amp; kontak simulasi</span>
        </div>
      </div>

      <header className="sticky top-0 z-10 bg-[#ffffffed] backdrop-blur-[12px] border-b border-[#e1ebe5] no-print">
        <div className="w-[min(1160px,92%)] mx-auto flex items-center justify-between min-h-[62px] sm:min-h-[72px] gap-[18px]">
          <a
            href="#home"
            className="flex items-center gap-[10px] no-underline font-extrabold text-[#064e3b] text-[15px] sm:text-[18px]"
          >
            <span className="w-[39px] h-[39px] rounded-[13px] brand-mark grid place-items-center text-white text-[21px]">
              ✺
            </span>
            Pemuda <span className="text-[#d6a84f]">Aceh</span>
          </a>

          <nav className="hidden lg:flex gap-5 items-center">
            <a
              href="#destinasi"
              className="no-underline text-[#47645b] font-semibold text-[13px] hover:text-[#2ab98e]"
            >
              {t.navDest}
            </a>
            <a
              href="#favorit"
              className="no-underline text-[#47645b] font-semibold text-[13px] hover:text-[#2ab98e] flex items-center gap-1"
            >
              <span>{t.navFav}</span>
              <span className="inline-grid place-items-center min-w-[19px] h-[19px] px-[5px] rounded-full bg-[#e8f4ee] text-[#064e3b] text-[10px] font-black">
                {resolvedFavorites.length}
              </span>
            </a>
            <a
              href="#kuliner"
              className="no-underline text-[#47645b] font-semibold text-[13px] hover:text-[#2ab98e]"
            >
              {t.navFood}
            </a>
            <a
              href="#akomodasi"
              className="no-underline text-[#47645b] font-semibold text-[13px] hover:text-[#2ab98e]"
            >
              {t.navStay}
            </a>
            <a
              href="#planner"
              className="no-underline text-[#47645b] font-semibold text-[13px] hover:text-[#2ab98e]"
            >
              {t.navPlan}
            </a>
            <a
              href="#dashboard"
              className="no-underline text-[#47645b] font-semibold text-[13px] hover:text-[#2ab98e]"
            >
              Dashboard
            </a>
          </nav>

          <div className="flex gap-2 items-center">
            <a
              href="#favorit"
              aria-label="Lihat favorit"
              className="border border-[#e1ebe5] bg-white text-[#064e3b] rounded-[12px] px-3 sm:px-4 py-[9px] sm:py-[11px] font-bold text-[13px] no-underline hover:brightness-95"
            >
              {t.favButton}
            </a>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as Language)}
              aria-label="Pilih bahasa"
              className="border border-[#e1ebe5] bg-white rounded-[10px] px-[10px] py-2 text-[#064e3b] font-bold cursor-pointer"
            >
              <option value="id">ID</option>
              <option value="en">EN</option>
            </select>
            <a
              href="#destinasi"
              className="border-0 rounded-[12px] px-3 sm:px-4 py-[9px] sm:py-[11px] bg-[#2ab98e] text-white font-bold text-[13px] no-underline btn-primary-shadow hover:brightness-95"
            >
              {t.explore}
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section
          id="home"
          className="py-[38px] sm:py-[58px] sm:pb-[45px] hero-bg overflow-hidden no-print"
        >
          <div className="w-[min(1160px,92%)] mx-auto grid grid-cols-1 md:grid-cols-[1.08fr_0.92fr] gap-[35px] items-center">
            <div>
              <div className="text-[#2ab98e] font-extrabold uppercase tracking-[2px] text-[11px]">
                Discover · Explore · Experience
              </div>
              <h1 className="text-[clamp(38px,5vw,62px)] leading-[1.05] tracking-[-2px] my-[13px] mb-[18px] text-[#064e3b] font-bold">
                Temukan pesona Aceh,
                <br />
                <em className="not-italic text-[#19a7a0]">
                  perjalanan penuh makna.
                </em>
              </h1>
              <p className="max-w-[560px] text-[#587169] text-[17px]">
                Rencanakan perjalanan yang nyaman dengan inspirasi destinasi,
                kuliner lokal, akomodasi ramah Muslim, dan budaya Aceh yang
                berkesan.
              </p>
              <div className="flex gap-3 flex-wrap mt-6">
                <a
                  href="#destinasi"
                  className="border-0 rounded-[12px] px-4 py-[11px] bg-[#2ab98e] text-white font-bold no-underline btn-primary-shadow hover:brightness-95"
                >
                  Jelajahi Destinasi ↗
                </a>
                <a
                  href="#planner"
                  className="border-0 rounded-[12px] px-4 py-[11px] bg-[#e8f4ee] text-[#064e3b] font-bold no-underline hover:brightness-95"
                >
                  Susun Itinerary
                </a>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-8 max-w-[510px]">
                <div className="border-l-2 border-[#d6a84f] pl-3">
                  <b className="block text-[18px] sm:text-[21px] text-[#064e3b]">
                    5 Wilayah
                  </b>
                  <span className="text-[12px] text-[#687b75]">
                    Banda Aceh hingga Gayo
                  </span>
                </div>
                <div className="border-l-2 border-[#d6a84f] pl-3">
                  <b className="block text-[18px] sm:text-[21px] text-[#064e3b]">
                    12+ Lokasi
                  </b>
                  <span className="text-[12px] text-[#687b75]">
                    Contoh destinasi
                  </span>
                </div>
                <div className="border-l-2 border-[#d6a84f] pl-3">
                  <b className="block text-[18px] sm:text-[21px] text-[#064e3b]">
                    1–5 Hari
                  </b>
                  <span className="text-[12px] text-[#687b75]">
                    Perencana perjalanan
                  </span>
                </div>
              </div>
            </div>

            <div className="min-h-[220px] sm:min-h-[340px] relative rounded-[28px] hero-visual overflow-hidden grid place-items-center text-white">
              <div className="absolute inset-0 opacity-[0.18] hero-visual-pattern" />
              <div className="absolute border border-[#ffffff28] rounded-full w-[370px] h-[370px] pointer-events-none" />
              <div className="absolute border border-[#ffffff28] rounded-full w-[270px] h-[270px] pointer-events-none" />
              <div className="absolute z-[2] bg-[#ffffffed] text-[#064e3b] px-4 py-3 rounded-[15px] font-extrabold left-[18px] top-6 card-shadow">
                🌿 Alam &amp; budaya
              </div>
              <div className="text-[75px] sm:text-[100px] z-[1] drop-shadow-[0_15px_12px_rgba(0,27,22,0.25)]">
                🕌
              </div>
              <div className="absolute z-[2] bg-[#ffffffed] text-[#064e3b] px-4 py-3 rounded-[15px] font-extrabold right-[18px] bottom-[25px] card-shadow">
                🌊 Dari kota ke bahari
              </div>
            </div>
          </div>
        </section>

        <section id="destinasi" className="py-[58px] no-print">
          <div className="w-[min(1160px,92%)] mx-auto">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-5 mb-6">
              <div>
                <div className="text-[#2ab98e] font-extrabold uppercase tracking-[2px] text-[11px]">
                  Explore Aceh
                </div>
                <h2 className="text-[clamp(25px,3vw,34px)] leading-[1.1] my-[6px] text-[#064e3b] tracking-[-0.8px] font-bold">
                  Destinasi pilihan
                </h2>
                <p className="text-[#687b75] m-0 max-w-[530px]">
                  Inspirasi perjalanan dari pesisir, pegunungan, sejarah, hingga
                  wisata religi.
                </p>
              </div>
              <span className="inline-flex rounded-full bg-[#e9f5ef] text-[#064e3b] px-[9px] py-1 text-[10px] font-extrabold self-start sm:self-auto">
                {db.destinations.length} destinasi contoh
              </span>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr] gap-[10px] my-[18px]">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari destinasi atau kata kunci…"
                className="col-span-2 lg:col-span-1 w-full px-3 py-[11px] border border-[#dce8e1] rounded-[11px] bg-white text-[#17352e] outline-none focus:border-[#19a7a0]"
              />
              <select
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
                className="w-full px-3 py-[11px] border border-[#dce8e1] rounded-[11px] bg-white text-[#17352e] outline-none"
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
                className="w-full px-3 py-[11px] border border-[#dce8e1] rounded-[11px] bg-white text-[#17352e] outline-none"
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
                className="w-full px-3 py-[11px] border border-[#dce8e1] rounded-[11px] bg-white text-[#17352e] outline-none"
              >
                <option value="featured">Urutkan: Unggulan</option>
                <option value="name">Nama A–Z</option>
                <option value="cost">Biaya terendah</option>
              </select>
            </div>

            <p className="text-[12px] text-[#687b75] mt-0 mb-[15px]">
              Gunakan pencarian, filter wilayah/kategori, dan sorting untuk
              menemukan tempat yang sesuai.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[18px]">
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
                <div className="col-span-full p-7 text-center text-[#687b75] bg-[#f7faf8] rounded-[14px]">
                  Tidak ada destinasi yang cocok.
                </div>
              )}
            </div>
          </div>
        </section>

        <section id="favorit" className="bg-[#f2f8f4] py-[58px] no-print">
          <div className="w-[min(1160px,92%)] mx-auto">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-5 mb-6">
              <div>
                <div className="text-[#2ab98e] font-extrabold uppercase tracking-[2px] text-[11px]">
                  Saved for later
                </div>
                <h2 className="text-[clamp(25px,3vw,34px)] leading-[1.1] my-[6px] text-[#064e3b] tracking-[-0.8px] font-bold">
                  Favorit saya
                </h2>
                <p className="text-[#687b75] m-0 max-w-[530px]">
                  Destinasi, kuliner, dan akomodasi yang Anda simpan di browser
                  ini.
                </p>
              </div>
              <span className="inline-flex rounded-full bg-[#e9f5ef] text-[#064e3b] px-[9px] py-1 text-[10px] font-extrabold self-start sm:self-auto">
                {filteredFavorites.length} item
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-[10px] my-[18px]">
              <input
                value={favSearch}
                onChange={(e) => setFavSearch(e.target.value)}
                placeholder="Cari favorit…"
                className="w-full px-3 py-[11px] border border-[#dce8e1] rounded-[11px] bg-white text-[#17352e] outline-none"
              />
              <select
                value={favTypeFilter}
                onChange={(e) =>
                  setFavTypeFilter(e.target.value as '' | FavoritableType)
                }
                className="w-full px-3 py-[11px] border border-[#dce8e1] rounded-[11px] bg-white text-[#17352e] outline-none"
              >
                <option value="">Semua jenis</option>
                <option value="destinations">Destinasi</option>
                <option value="foods">Kuliner &amp; UMKM</option>
                <option value="stays">Akomodasi</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[18px]">
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
                <div className="col-span-full p-7 text-center text-[#687b75] bg-[#f7faf8] rounded-[14px]">
                  Belum ada favorit yang cocok. Klik ♡ pada kartu untuk
                  menyimpan item.
                </div>
              )}
            </div>
          </div>
        </section>

        <div className="no-print">
          <AcehMapSection regions={regions} />
        </div>

        <section id="kuliner" className="bg-[#f0f7f2] py-[58px] no-print">
          <div className="w-[min(1160px,92%)] mx-auto">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-5 mb-6">
              <div>
                <div className="text-[#2ab98e] font-extrabold uppercase tracking-[2px] text-[11px]">
                  Local taste
                </div>
                <h2 className="text-[clamp(25px,3vw,34px)] leading-[1.1] my-[6px] text-[#064e3b] tracking-[-0.8px] font-bold">
                  Kuliner &amp; UMKM lokal
                </h2>
                <p className="text-[#687b75] m-0 max-w-[530px]">
                  Kenali cita rasa Aceh dan dukung usaha lokal. Status halal
                  ditampilkan secara hati-hati.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[18px]">
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

        <section id="akomodasi" className="py-[58px] no-print">
          <div className="w-[min(1160px,92%)] mx-auto">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-5 mb-6">
              <div>
                <div className="text-[#2ab98e] font-extrabold uppercase tracking-[2px] text-[11px]">
                  Stay with comfort
                </div>
                <h2 className="text-[clamp(25px,3vw,34px)] leading-[1.1] my-[6px] text-[#064e3b] tracking-[-0.8px] font-bold">
                  Akomodasi ramah Muslim
                </h2>
                <p className="text-[#687b75] m-0 max-w-[530px]">
                  Contoh fasilitas yang dapat membantu kenyamanan wisatawan
                  Muslim.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[18px]">
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

      <footer className="bg-[#073d32] text-[#d5e9df] py-[35px] no-print">
        <div className="w-[min(1160px,92%)] mx-auto flex flex-col sm:flex-row justify-between gap-[25px] sm:items-center">
          <div>
            <b className="text-[19px]">Pemuda Aceh ✺</b>
            <p className="my-[5px] mb-0">
              Temukan Aceh, ciptakan pengalaman yang bermakna.
            </p>
          </div>
          <small className="text-[#a7c7b8]">
            Prototype MVP · Tanpa backend · Data contoh perlu verifikasi
          </small>
        </div>
      </footer>

      {toastMsg && (
        <div
          role="status"
          className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-[#123e32] text-white px-[17px] py-[11px] rounded-[12px] card-shadow z-30 no-print"
        >
          {toastMsg}
        </div>
      )}

      <DetailModal modal={modal} onClose={() => setModal({ kind: 'closed' })} />
    </div>
  );
}
