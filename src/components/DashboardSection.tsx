import { motion } from 'motion/react';
import { FormEvent, useRef, useState } from 'react';
import { safeUrl } from '../data/seed';
import type {
  CatalogType,
  Destination,
  FoodItem,
  StayItem,
  TourismDatabase,
  TourPackage,
} from '../types/tourism';

interface DashboardSectionProps {
  db: TourismDatabase;
  onSaveItem: (type: CatalogType, item: Destination | FoodItem | StayItem | TourPackage) => void;
  onDeleteItem: (type: CatalogType, id: string) => void;
  onResetAll: () => void;
  onToast: (msg: string) => void;
}

const TYPE_NAMES: Record<CatalogType, string> = {
  destinations: 'destinasi',
  foods: 'kuliner',
  stays: 'akomodasi',
  packages: 'paket wisata',
};

const TAB_LABELS: { type: CatalogType; label: string }[] = [
  { type: 'destinations', label: 'Destinasi' },
  { type: 'foods', label: 'Kuliner' },
  { type: 'stays', label: 'Akomodasi' },
  { type: 'packages', label: 'Paket wisata' },
];

const REGIONS = [
  'Banda Aceh',
  'Sabang',
  'Aceh Besar',
  'Aceh Tengah',
  'Bener Meriah',
];

const CATEGORIES = [
  'alam',
  'bahari',
  'religi',
  'sejarah',
  'budaya',
  'kuliner',
  'akomodasi',
  'paket',
];

const INTERESTS = ['alam', 'bahari', 'religi', 'sejarah', 'budaya', 'kuliner'];

export function DashboardSection({
  db,
  onSaveItem,
  onDeleteItem,
  onResetAll,
  onToast,
}: DashboardSectionProps) {
  const [adminType, setAdminType] = useState<CatalogType>('destinations');
  const [editId, setEditId] = useState('');
  const [name, setName] = useState('');
  const [region, setRegion] = useState('Banda Aceh');
  const [category, setCategory] = useState('alam');
  const [duration, setDuration] = useState(3);
  const [price, setPrice] = useState('');
  const [halalStatus, setHalalStatus] = useState<
    'Terverifikasi' | 'Belum diverifikasi' | 'Tidak diketahui'
  >('Belum diverifikasi');
  const [desc, setDesc] = useState('');
  const [image, setImage] = useState('');
  const [pkgDestinations, setPkgDestinations] = useState<string[]>([]);
  const [pkgInterests, setPkgInterests] = useState<string[]>([]);

  const formRef = useRef<HTMLFormElement | null>(null);

  const resetForm = (nextType: CatalogType = adminType) => {
    setEditId('');
    setName('');
    setRegion('Banda Aceh');
    setCategory(nextType === 'stays' ? 'akomodasi' : 'alam');
    setDuration(3);
    setPrice('');
    setHalalStatus('Belum diverifikasi');
    setDesc('');
    setImage('');
    setPkgDestinations([]);
    setPkgInterests([]);
  };

  const handleTabChange = (type: CatalogType) => {
    setAdminType(type);
    resetForm(type);
  };

  const handleEdit = (id: string) => {
    const item = db[adminType].find((x) => x.id === id);
    if (!item) return;

    setEditId(id);
    setName(item.nama || '');
    setDesc(
      (item as Destination).deskripsi ||
        (item as FoodItem).catatan ||
        (item as StayItem).catatan ||
        ''
    );
    setImage(item.imageUrl || '');

    if (adminType === 'packages') {
      const p = item as TourPackage;
      setPrice(String(p.estimasiBiaya ?? ''));
      setDuration(p.durasi || 1);
      setPkgDestinations(p.daftarDestinasi || []);
      setPkgInterests(p.minat || []);
    } else if (adminType === 'destinations') {
      const d = item as Destination;
      setPrice(String(d.estimasiBiaya ?? ''));
      setRegion(d.wilayah || 'Banda Aceh');
      setCategory(d.kategori || 'alam');
    } else if (adminType === 'foods') {
      const f = item as FoodItem;
      setPrice(String(f.harga ?? ''));
      setRegion(f.wilayah || 'Banda Aceh');
      setCategory(f.kategori || 'kuliner');
      setHalalStatus(
        ['Terverifikasi', 'Belum diverifikasi', 'Tidak diketahui'].includes(
          f.statusSertifikasiHalal
        )
          ? f.statusSertifikasiHalal
          : 'Belum diverifikasi'
      );
    } else {
      const s = item as StayItem;
      setPrice(String(s.hargaPerMalam ?? ''));
      setRegion(s.wilayah || 'Banda Aceh');
      setCategory(s.kategori || 'akomodasi');
    }

    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      onToast('Nama item wajib diisi');
      return;
    }

    const id = editId || 'new' + Date.now();
    const numPrice = Math.max(0, Number(price) || 0);
    const trimmedDesc = desc.trim();
    const validImg = safeUrl(image);

    if (adminType === 'destinations') {
      const next: Destination = {
        id,
        nama: trimmedName,
        wilayah: region,
        kategori: category,
        imageUrl: validImg,
        deskripsi: trimmedDesc,
        alamat: `${region}, Aceh`,
        mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trimmedName + ' Aceh')}`,
        estimasiBiaya: numPrice,
        fasilitas: ['Informasi fasilitas perlu dikonfirmasi'],
        fasilitasIbadah: ['Perlu konfirmasi'],
        unggulan: false,
        catatanVerifikasi:
          'Data dimasukkan melalui dashboard demo; verifikasi sebelum publikasi.',
      };
      onSaveItem('destinations', next);
    } else if (adminType === 'foods') {
      const next: FoodItem = {
        id,
        nama: trimmedName,
        wilayah: region,
        kategori: category,
        imageUrl: validImg,
        harga: numPrice,
        statusSertifikasiHalal: halalStatus,
        sumberVerifikasi: 'Perlu dilengkapi dengan sumber resmi',
        kontak: '6281234500099',
        catatan: `${trimmedDesc} (Kontak dan harga simulasi)`.trim(),
      };
      onSaveItem('foods', next);
    } else if (adminType === 'stays') {
      const next: StayItem = {
        id,
        nama: trimmedName,
        wilayah: region,
        kategori: 'akomodasi',
        imageUrl: validImg,
        hargaPerMalam: numPrice,
        fasilitas: ['Perlu konfirmasi'],
        fasilitasRamahMuslim: ['Perlu konfirmasi'],
        kontak: '6281234500099',
        catatan: `${trimmedDesc} (Kontak dan harga simulasi)`.trim(),
      };
      onSaveItem('stays', next);
    } else {
      if (pkgDestinations.length === 0 || pkgInterests.length === 0) {
        onToast('Paket memerlukan minimal satu destinasi dan satu minat');
        return;
      }
      const next: TourPackage = {
        id,
        nama: trimmedName,
        wilayah: '',
        kategori: 'paket',
        imageUrl: validImg,
        durasi: Math.max(1, Math.min(5, duration || 1)),
        daftarDestinasi: pkgDestinations,
        estimasiBiaya: numPrice,
        deskripsi: trimmedDesc || 'Paket wisata contoh.',
        minat: pkgInterests,
      };
      onSaveItem('packages', next);
    }

    resetForm();
    onToast('Data tersimpan di browser');
  };

  const isPackages = adminType === 'packages';
  const isFoods = adminType === 'foods';
  const isStays = adminType === 'stays';
  const priceLabel = isPackages
    ? 'Estimasi biaya paket (Rp)'
    : isStays
      ? 'Harga per malam (Rp)'
      : isFoods
        ? 'Harga (Rp)'
        : 'Estimasi biaya (Rp)';

  const inputClass =
    'w-full px-3.5 py-2.5 border border-slate-200 rounded-lg bg-slate-50 text-[#0f2438] placeholder-slate-400 text-sm outline-none focus:border-[#f59e0b] focus:bg-white transition-colors';
  const labelClass = 'text-xs font-semibold text-slate-600';

  return (
    <section id="dashboard" className="py-16 bg-white no-print">
      <div className="w-[min(1260px,94%)] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-5 mb-7"
        >
          <div>
            <div className="text-[#d97706] font-semibold text-xs tracking-wide">
              Manajemen Konten Lokal
            </div>
            <h2 className="font-display text-[clamp(26px,3vw,36px)] leading-[1.15] my-1.5 text-[#0f2438] tracking-[-0.015em] font-semibold">
              Dashboard pengelola
            </h2>
            <p className="text-slate-600 m-0 max-w-[540px] text-[15px]">
              CRUD lokal untuk data destinasi, kuliner, akomodasi, dan paket
              wisata. Tidak memerlukan akun.
            </p>
          </div>
          <button
            type="button"
            onClick={onResetAll}
            className="border border-slate-200 bg-white text-[#0f2438] rounded-full px-4 py-2 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer self-start sm:self-auto whitespace-nowrap"
          >
            Reset data contoh
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white border border-slate-200 rounded-xl p-6 card-shadow"
        >
          <div className="inline-flex items-center gap-1 p-1 bg-slate-100 border border-slate-200 rounded-lg flex-wrap mb-6">
            {TAB_LABELS.map((tab) => (
              <button
                key={tab.type}
                type="button"
                onClick={() => handleTabChange(tab.type)}
                className={`rounded-md px-3.5 py-1.5 text-xs font-semibold cursor-pointer transition-colors whitespace-nowrap ${
                  adminType === tab.type
                    ? 'bg-[#0f2438] text-white'
                    : 'bg-transparent text-slate-600 hover:text-[#0f2438]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="mt-0 mb-4 font-display text-[#0f2438] font-semibold text-lg">
                Kelola {TYPE_NAMES[adminType]}
              </h3>
              <form
                ref={formRef}
                onSubmit={handleSubmit}
                className="grid grid-cols-1 sm:grid-cols-2 gap-3"
              >
                <div className="sm:col-span-2 grid gap-1.5 content-start">
                  <label htmlFor="fName" className={labelClass}>
                    Nama item
                  </label>
                  <input
                    id="fName"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nama item"
                    className={inputClass}
                  />
                </div>

                {!isPackages && (
                  <div className="grid gap-1.5 content-start">
                    <label htmlFor="fRegion" className={labelClass}>
                      Wilayah
                    </label>
                    <select
                      id="fRegion"
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      className={inputClass}
                    >
                      {REGIONS.map((r) => (
                        <option key={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                )}

                {!isPackages && !isStays && (
                  <div className="grid gap-1.5 content-start">
                    <label htmlFor="fCategory" className={labelClass}>
                      Kategori
                    </label>
                    <select
                      id="fCategory"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className={inputClass}
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                )}

                {isPackages && (
                  <div className="grid gap-1.5 content-start">
                    <label htmlFor="fDuration" className={labelClass}>
                      Durasi paket
                    </label>
                    <select
                      id="fDuration"
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                      className={inputClass}
                    >
                      {[1, 2, 3, 4, 5].map((d) => (
                        <option key={d} value={d}>
                          {d} hari
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="grid gap-1.5 content-start">
                  <label htmlFor="fPrice" className={labelClass}>
                    {priceLabel}
                  </label>
                  <input
                    id="fPrice"
                    type="number"
                    min={0}
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder={priceLabel}
                    className={inputClass}
                  />
                </div>

                {isFoods && (
                  <div className="grid gap-1.5 content-start">
                    <label htmlFor="fExtra" className={labelClass}>
                      Status sertifikasi halal
                    </label>
                    <select
                      id="fExtra"
                      value={halalStatus}
                      onChange={(e) =>
                        setHalalStatus(
                          e.target.value as
                            | 'Terverifikasi'
                            | 'Belum diverifikasi'
                            | 'Tidak diketahui'
                        )
                      }
                      className={inputClass}
                    >
                      <option>Belum diverifikasi</option>
                      <option>Terverifikasi</option>
                      <option>Tidak diketahui</option>
                    </select>
                  </div>
                )}

                <div className="sm:col-span-2 grid gap-1.5 content-start">
                  <label htmlFor="fDesc" className={labelClass}>
                    Deskripsi
                  </label>
                  <textarea
                    id="fDesc"
                    rows={3}
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    placeholder="Deskripsi singkat"
                    className={inputClass}
                  />
                </div>

                <div className="sm:col-span-2 grid gap-1.5 content-start">
                  <label htmlFor="fImage" className={labelClass}>
                    URL gambar (opsional, http/https)
                  </label>
                  <input
                    id="fImage"
                    type="url"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="https://contoh.co.id/gambar.jpg"
                    className={inputClass}
                  />
                </div>

                {isPackages && (
                  <div className="sm:col-span-2 grid gap-2.5 border border-dashed border-slate-300 p-3.5 rounded-xl">
                    <div className="grid gap-1.5 content-start">
                      <label htmlFor="fPackageDestinations" className={labelClass}>
                        Destinasi dalam paket (pilih minimal satu)
                      </label>
                      <select
                        id="fPackageDestinations"
                        multiple
                        value={pkgDestinations}
                        onChange={(e) =>
                          setPkgDestinations(
                            Array.from(e.target.selectedOptions).map(
                              (o) => o.value
                            )
                          )
                        }
                        className={`${inputClass} min-h-[104px]`}
                      >
                        {db.destinations.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.nama} — {d.wilayah}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid gap-1.5 content-start">
                      <label htmlFor="fPackageInterests" className={labelClass}>
                        Minat paket (pilih minimal satu)
                      </label>
                      <select
                        id="fPackageInterests"
                        multiple
                        value={pkgInterests}
                        onChange={(e) =>
                          setPkgInterests(
                            Array.from(e.target.selectedOptions).map(
                              (o) => o.value
                            )
                          )
                        }
                        className={`${inputClass} min-h-[104px]`}
                      >
                        {INTERESTS.map((i) => (
                          <option key={i}>{i}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                <motion.button
                  type="submit"
                  whileTap={{ scale: 0.98 }}
                  className="sm:col-span-2 border-0 rounded-full px-4 py-2.5 bg-[#f59e0b] text-white text-xs font-semibold btn-primary-shadow hover:bg-[#d97706] transition-colors cursor-pointer"
                >
                  {editId ? 'Simpan perubahan' : 'Tambah data'}
                </motion.button>
              </form>
              <p className="text-xs text-slate-500 mt-2.5">
                Form menyesuaikan jenis data. Data disimpan di browser ini saja.
              </p>
            </div>

            <div>
              <h3 className="mt-0 mb-4 font-display text-[#0f2438] font-semibold text-lg">
                Data tersimpan
              </h3>
              <div className="max-h-[380px] overflow-auto pr-1">
                {db[adminType].length > 0 ? (
                  db[adminType].map((x) => {
                    const sub =
                      adminType === 'packages'
                        ? `${(x as TourPackage).durasi} hari · ${((x as TourPackage).minat || []).join(', ')}`
                        : `${(x as Destination).wilayah || ''} · ${(x as Destination).kategori || ''}`;
                    return (
                      <div
                        key={x.id}
                        className="flex justify-between gap-2.5 py-3 border-b border-slate-100 text-[13px] items-center"
                      >
                        <span className="min-w-0">
                          <b className="text-[#0f2438] font-semibold block truncate">
                            {x.nama}
                          </b>
                          <small className="text-slate-500 text-xs">{sub}</small>
                        </span>
                        <span className="whitespace-nowrap flex gap-1.5 items-center shrink-0">
                          <button
                            type="button"
                            onClick={() => handleEdit(x.id)}
                            className="border border-slate-200 bg-slate-50 hover:bg-slate-100 rounded-lg px-3 py-1.5 text-xs font-medium text-[#0f2438] cursor-pointer transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteItem(adminType, x.id)}
                            className="border border-slate-200 bg-slate-50 hover:border-rose-300 hover:text-rose-600 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 cursor-pointer transition-colors"
                          >
                            Hapus
                          </button>
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center text-slate-500 bg-slate-50 border border-slate-200 rounded-xl">
                    Belum ada data.
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
