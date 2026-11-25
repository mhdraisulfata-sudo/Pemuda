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

  return (
    <section id="dashboard" className="py-[58px] no-print">
      <div className="w-[min(1160px,92%)] mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-5 mb-6">
          <div>
            <div className="text-[#2ab98e] font-extrabold uppercase tracking-[2px] text-[11px]">
              Demo content management
            </div>
            <h2 className="text-[clamp(25px,3vw,34px)] leading-[1.1] my-[6px] text-[#064e3b] tracking-[-0.8px] font-bold">
              Dashboard pengelola
            </h2>
            <p className="text-[#687b75] m-0 max-w-[530px]">
              CRUD lokal untuk data destinasi, kuliner, akomodasi, dan paket
              wisata. Tidak memerlukan akun.
            </p>
          </div>
          <button
            type="button"
            onClick={onResetAll}
            className="border border-[#e1ebe5] bg-white text-[#064e3b] rounded-[12px] px-4 py-[11px] font-bold hover:brightness-95 cursor-pointer self-start sm:self-auto"
          >
            Reset data contoh
          </button>
        </div>

        <div className="bg-white border border-[#e1ebe5] rounded-[18px] p-5 card-shadow">
          <div className="flex gap-[7px] flex-wrap mb-[15px]">
            {TAB_LABELS.map((tab) => (
              <button
                key={tab.type}
                type="button"
                onClick={() => handleTabChange(tab.type)}
                className={`border border-[#e1ebe5] rounded-[10px] px-3 py-2 text-[12px] font-bold cursor-pointer ${
                  adminType === tab.type
                    ? 'bg-[#064e3b] text-white'
                    : 'bg-white text-[#064e3b]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <h3 className="mt-0 mb-[14px] text-[#064e3b] font-bold text-lg">
                Kelola {TYPE_NAMES[adminType]}
              </h3>
              <form
                ref={formRef}
                onSubmit={handleSubmit}
                className="grid grid-cols-1 sm:grid-cols-2 gap-[10px]"
              >
                <div className="sm:col-span-2 grid gap-[5px] content-start">
                  <label
                    htmlFor="fName"
                    className="text-[11px] font-extrabold text-[#687b75]"
                  >
                    Nama item
                  </label>
                  <input
                    id="fName"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nama item"
                    className="w-full px-3 py-[11px] border border-[#dce8e1] rounded-[11px] bg-white text-[#17352e] outline-none"
                  />
                </div>

                {!isPackages && (
                  <div className="grid gap-[5px] content-start">
                    <label
                      htmlFor="fRegion"
                      className="text-[11px] font-extrabold text-[#687b75]"
                    >
                      Wilayah
                    </label>
                    <select
                      id="fRegion"
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      className="w-full px-3 py-[11px] border border-[#dce8e1] rounded-[11px] bg-white text-[#17352e] outline-none"
                    >
                      {REGIONS.map((r) => (
                        <option key={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                )}

                {!isPackages && !isStays && (
                  <div className="grid gap-[5px] content-start">
                    <label
                      htmlFor="fCategory"
                      className="text-[11px] font-extrabold text-[#687b75]"
                    >
                      Kategori
                    </label>
                    <select
                      id="fCategory"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-[11px] border border-[#dce8e1] rounded-[11px] bg-white text-[#17352e] outline-none"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                )}

                {isPackages && (
                  <div className="grid gap-[5px] content-start">
                    <label
                      htmlFor="fDuration"
                      className="text-[11px] font-extrabold text-[#687b75]"
                    >
                      Durasi paket
                    </label>
                    <select
                      id="fDuration"
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                      className="w-full px-3 py-[11px] border border-[#dce8e1] rounded-[11px] bg-white text-[#17352e] outline-none"
                    >
                      {[1, 2, 3, 4, 5].map((d) => (
                        <option key={d} value={d}>
                          {d} hari
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="grid gap-[5px] content-start">
                  <label
                    htmlFor="fPrice"
                    className="text-[11px] font-extrabold text-[#687b75]"
                  >
                    {priceLabel}
                  </label>
                  <input
                    id="fPrice"
                    type="number"
                    min={0}
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder={priceLabel}
                    className="w-full px-3 py-[11px] border border-[#dce8e1] rounded-[11px] bg-white text-[#17352e] outline-none"
                  />
                </div>

                {isFoods && (
                  <div className="grid gap-[5px] content-start">
                    <label
                      htmlFor="fExtra"
                      className="text-[11px] font-extrabold text-[#687b75]"
                    >
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
                      className="w-full px-3 py-[11px] border border-[#dce8e1] rounded-[11px] bg-white text-[#17352e] outline-none"
                    >
                      <option>Belum diverifikasi</option>
                      <option>Terverifikasi</option>
                      <option>Tidak diketahui</option>
                    </select>
                  </div>
                )}

                <div className="sm:col-span-2 grid gap-[5px] content-start">
                  <label
                    htmlFor="fDesc"
                    className="text-[11px] font-extrabold text-[#687b75]"
                  >
                    Deskripsi
                  </label>
                  <textarea
                    id="fDesc"
                    rows={3}
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    placeholder="Deskripsi singkat"
                    className="w-full px-3 py-[11px] border border-[#dce8e1] rounded-[11px] bg-white text-[#17352e] outline-none"
                  />
                </div>

                <div className="sm:col-span-2 grid gap-[5px] content-start">
                  <label
                    htmlFor="fImage"
                    className="text-[11px] font-extrabold text-[#687b75]"
                  >
                    URL gambar (opsional, http/https)
                  </label>
                  <input
                    id="fImage"
                    type="url"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="https://contoh.co.id/gambar.jpg"
                    className="w-full px-3 py-[11px] border border-[#dce8e1] rounded-[11px] bg-white text-[#17352e] outline-none"
                  />
                </div>

                {isPackages && (
                  <div className="sm:col-span-2 grid gap-[9px] border border-dashed border-[#e1ebe5] p-3 rounded-[12px]">
                    <div className="grid gap-[5px] content-start">
                      <label
                        htmlFor="fPackageDestinations"
                        className="text-[11px] font-extrabold text-[#687b75]"
                      >
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
                        className="w-full min-h-[104px] px-3 py-[11px] border border-[#dce8e1] rounded-[11px] bg-white text-[#17352e] outline-none"
                      >
                        {db.destinations.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.nama} — {d.wilayah}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid gap-[5px] content-start">
                      <label
                        htmlFor="fPackageInterests"
                        className="text-[11px] font-extrabold text-[#687b75]"
                      >
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
                        className="w-full min-h-[104px] px-3 py-[11px] border border-[#dce8e1] rounded-[11px] bg-white text-[#17352e] outline-none"
                      >
                        {INTERESTS.map((i) => (
                          <option key={i}>{i}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="sm:col-span-2 border-0 rounded-[12px] px-4 py-[11px] bg-[#2ab98e] text-white font-bold btn-primary-shadow hover:brightness-95 cursor-pointer"
                >
                  {editId ? 'Simpan perubahan' : 'Tambah data'}
                </button>
              </form>
              <p className="text-[11px] text-[#687b75] mt-2">
                Form menyesuaikan jenis data. Data disimpan di browser ini saja.
              </p>
            </div>

            <div>
              <h3 className="mt-0 mb-[14px] text-[#064e3b] font-bold text-lg">
                Data tersimpan
              </h3>
              <div className="max-h-[340px] overflow-auto">
                {db[adminType].length > 0 ? (
                  db[adminType].map((x) => {
                    const sub =
                      adminType === 'packages'
                        ? `${(x as TourPackage).durasi} hari · ${((x as TourPackage).minat || []).join(', ')}`
                        : `${(x as Destination).wilayah || ''} · ${(x as Destination).kategori || ''}`;
                    return (
                      <div
                        key={x.id}
                        className="flex justify-between gap-[10px] py-[10px] border-b border-[#e1ebe5] text-[13px]"
                      >
                        <span>
                          <b>{x.nama}</b>
                          <br />
                          <small className="text-[#687b75]">{sub}</small>
                        </span>
                        <span className="whitespace-nowrap flex gap-1 items-center">
                          <button
                            type="button"
                            onClick={() => handleEdit(x.id)}
                            className="border border-[#e1ebe5] bg-white rounded-[10px] px-[10px] py-2 text-[#064e3b] cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteItem(adminType, x.id)}
                            className="border border-[#e1ebe5] bg-white rounded-[10px] px-[10px] py-2 text-[#064e3b] cursor-pointer"
                          >
                            Hapus
                          </button>
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-7 text-center text-[#687b75] bg-[#f7faf8] rounded-[14px]">
                    Belum ada data.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
