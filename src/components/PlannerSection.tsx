import { Compass, Copy, Download, Plus, Printer, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useMemo, useState } from 'react';
import { rupiah, safeUrl } from '../data/seed';
import type {
  Destination,
  Itinerary,
  TourPackage,
  TripSnapshot,
} from '../types/tourism';

interface PlannerSectionProps {
  destinations: Destination[];
  packages: TourPackage[];
  itinerary: Itinerary;
  onUpdateItinerary: (next: Itinerary, saveToStorage?: boolean) => void;
  onToast: (msg: string) => void;
  onCopyFallback: (text: string) => void;
}

export function PlannerSection({
  destinations,
  packages,
  itinerary,
  onUpdateItinerary,
  onToast,
  onCopyFallback,
}: PlannerSectionProps) {
  const [selectedPlace, setSelectedPlace] = useState(
    destinations[0]?.id || ''
  );
  const [activityDay, setActivityDay] = useState(1);
  const [mealCost, setMealCost] = useState(100000);
  const [stayCost, setStayCost] = useState(350000);

  const [interestFilter, setInterestFilter] = useState('');
  const [packageDaysFilter, setPackageDaysFilter] = useState('');
  const [budgetFilter, setBudgetFilter] = useState('');

  const [printSnapshot, setPrintSnapshot] = useState<TripSnapshot | null>(null);
  const [failedPkgImages, setFailedPkgImages] = useState<Record<string, boolean>>(
    {}
  );

  const activePlaceId = destinations.some((d) => d.id === selectedPlace)
    ? selectedPlace
    : destinations[0]?.id || '';

  const destCost = useMemo(
    () =>
      itinerary.daftarAktivitas.reduce((sum, a) => {
        const dest = destinations.find((x) => x.id === a.itemId);
        return sum + (dest?.estimasiBiaya || 0);
      }, 0),
    [itinerary.daftarAktivitas, destinations]
  );

  const people = Math.max(1, itinerary.jumlahWisatawan || 1);
  const days = Math.max(1, itinerary.jumlahHari || 1);
  const mealTotal = Math.max(0, mealCost) * people * days;
  const stayTotal = Math.max(0, stayCost) * Math.max(0, days - 1);
  const grandTotal = destCost + mealTotal + stayTotal;

  const filteredPackages = useMemo(() => {
    const maxBudget = Number(budgetFilter) > 0 ? Number(budgetFilter) : Infinity;
    return packages.filter(
      (p) =>
        (!interestFilter || p.minat.includes(interestFilter)) &&
        (!packageDaysFilter || p.durasi === Number(packageDaysFilter)) &&
        p.estimasiBiaya <= maxBudget
    );
  }, [packages, interestFilter, packageDaysFilter, budgetFilter]);

  const buildSnapshot = (): TripSnapshot => {
    const activities = itinerary.daftarAktivitas.map((a) => {
      const dest = destinations.find((z) => z.id === a.itemId);
      return {
        hari: a.hari,
        itemId: a.itemId,
        nama: dest?.nama || 'Item dihapus',
        wilayah: dest?.wilayah || '',
        estimasiBiaya: dest?.estimasiBiaya || 0,
      };
    });

    return {
      namaPerjalanan: itinerary.namaPerjalanan || 'Rencana Aceh',
      tanggalMulai: itinerary.tanggalMulai || null,
      jumlahHari: days,
      jumlahWisatawan: people,
      daftarAktivitas: activities,
      ringkasanBiaya: {
        destinasi: destCost,
        makan: mealTotal,
        akomodasi: stayTotal,
        total: grandTotal,
      },
      dibuatPada: new Date().toISOString(),
      catatan: 'Simulasi demo Pemuda Aceh; harga dan data perlu verifikasi.',
    };
  };

  const handleAddActivity = () => {
    if (activityDay > itinerary.jumlahHari) {
      onToast('Pilih hari sesuai durasi perjalanan');
      return;
    }
    const dest = destinations.find((z) => z.id === activePlaceId);
    if (!dest) return;

    const next: Itinerary = {
      ...itinerary,
      daftarAktivitas: [
        ...itinerary.daftarAktivitas,
        {
          id: 'a' + Date.now(),
          hari: activityDay,
          itemId: activePlaceId,
          tipeItem: 'destinasi',
          waktu: '',
          catatan: '',
        },
      ],
    };
    onUpdateItinerary(next, true);
    onToast('Aktivitas ditambahkan');
  };

  const handleRemoveActivity = (id: string) => {
    onUpdateItinerary(
      {
        ...itinerary,
        daftarAktivitas: itinerary.daftarAktivitas.filter((a) => a.id !== id),
      },
      true
    );
  };

  const handleDownloadJson = () => {
    const snap = buildSnapshot();
    const blob = new Blob([JSON.stringify(snap, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const slug =
      snap.namaPerjalanan
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') || 'itinerary-aceh';
    a.href = url;
    a.download = `${slug}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    onToast('Itinerary diunduh sebagai JSON');
  };

  const handleCopySummary = () => {
    const s = buildSnapshot();
    const lines: string[] = [
      s.namaPerjalanan,
      s.tanggalMulai ? `Mulai: ${s.tanggalMulai}` : '',
      `${s.jumlahHari} hari · ${s.jumlahWisatawan} wisatawan`,
      '',
    ];
    for (let d = 1; d <= s.jumlahHari; d++) {
      const acts = s.daftarAktivitas.filter((a) => a.hari === d);
      lines.push(`Hari ${d}:`);
      if (acts.length) {
        acts.forEach((a) =>
          lines.push(`  - ${a.nama} (${rupiah(a.estimasiBiaya)})`)
        );
      } else {
        lines.push('  - Belum ada aktivitas');
      }
    }
    lines.push(
      '',
      `Biaya destinasi: ${rupiah(s.ringkasanBiaya.destinasi)}`,
      `Estimasi makan: ${rupiah(s.ringkasanBiaya.makan)}`,
      `Estimasi akomodasi: ${rupiah(s.ringkasanBiaya.akomodasi)}`,
      `Total estimasi: ${rupiah(s.ringkasanBiaya.total)}`,
      s.catatan
    );

    const text = lines.filter((v, i) => i !== 1 || v).join('\n');
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(text)
        .then(() => onToast('Ringkasan itinerary disalin'))
        .catch(() => onCopyFallback(text));
    } else {
      onCopyFallback(text);
    }
  };

  const handlePrint = () => {
    setPrintSnapshot(buildSnapshot());
    setTimeout(() => window.print(), 50);
  };

  const handleUsePackage = (pkg: TourPackage) => {
    const next: Itinerary = {
      ...itinerary,
      jumlahHari: pkg.durasi,
      daftarAktivitas: pkg.daftarDestinasi.map((destId, i) => ({
        id: 'a' + Date.now() + i,
        hari: Math.min(i + 1, pkg.durasi),
        itemId: destId,
        tipeItem: 'destinasi',
        waktu: '',
        catatan: '',
      })),
    };
    onUpdateItinerary(next, true);
    window.location.hash = '#planner';
    onToast('Paket dimasukkan ke itinerary');
  };

  const inputClass =
    'w-full px-3.5 py-2.5 border border-[#1d352d] rounded-lg bg-[#081310] text-[#ecf5f1] placeholder-[#728c81] text-sm outline-none focus:border-[#24b486] transition-colors';

  return (
    <>
      <section
        id="planner"
        className="bg-[#0b1814] border-y border-[#152822] py-16 no-print"
      >
        <div className="w-[min(1360px,94%)] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="mb-7"
          >
            <div className="text-[#3ad19e] font-semibold text-xs tracking-wide">
              Perencana Perjalanan
            </div>
            <h2 className="font-display text-[clamp(26px,3vw,36px)] leading-[1.15] my-1.5 text-[#ecf5f1] tracking-[-0.015em] font-semibold">
              Rancang perjalanan
            </h2>
            <p className="text-[#97b0a5] m-0 max-w-[540px] text-[15px]">
              Susun aktivitas 1–5 hari dan hitung anggaran awal perjalanan.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="bg-[#0f1f1a] border border-[#1d352d] rounded-xl p-6 card-shadow"
            >
              <h3 className="mt-0 mb-4 font-display text-[#ecf5f1] font-semibold text-lg">
                Penyusun itinerary
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <input
                  value={itinerary.namaPerjalanan}
                  onChange={(e) =>
                    onUpdateItinerary(
                      { ...itinerary, namaPerjalanan: e.target.value },
                      true
                    )
                  }
                  placeholder="Nama perjalanan"
                  className={`sm:col-span-2 ${inputClass}`}
                />
                <input
                  type="date"
                  value={itinerary.tanggalMulai}
                  onChange={(e) =>
                    onUpdateItinerary(
                      { ...itinerary, tanggalMulai: e.target.value },
                      true
                    )
                  }
                  className={inputClass}
                />
                <select
                  value={itinerary.jumlahHari}
                  onChange={(e) => {
                    const nextDays = Number(e.target.value);
                    onUpdateItinerary(
                      {
                        ...itinerary,
                        jumlahHari: nextDays,
                        daftarAktivitas: itinerary.daftarAktivitas.filter(
                          (a) => a.hari <= nextDays
                        ),
                      },
                      true
                    );
                  }}
                  className={inputClass}
                >
                  {[1, 2, 3, 4, 5].map((d) => (
                    <option key={d} value={d}>
                      {d} hari
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={itinerary.jumlahWisatawan}
                  onChange={(e) =>
                    onUpdateItinerary(
                      {
                        ...itinerary,
                        jumlahWisatawan: Math.max(
                          1,
                          Number(e.target.value) || 1
                        ),
                      },
                      true
                    )
                  }
                  placeholder="Jumlah wisatawan"
                  className={inputClass}
                />
                <select
                  value={activePlaceId}
                  onChange={(e) => setSelectedPlace(e.target.value)}
                  className={inputClass}
                >
                  {destinations.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.nama} — {d.wilayah}
                    </option>
                  ))}
                </select>
                <select
                  value={activityDay}
                  onChange={(e) => setActivityDay(Number(e.target.value))}
                  className={inputClass}
                >
                  {[1, 2, 3, 4, 5].map((d) => (
                    <option key={d} value={d}>
                      Hari {d}
                    </option>
                  ))}
                </select>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddActivity}
                  className="sm:col-span-2 inline-flex items-center justify-center gap-1.5 border-0 rounded-lg px-4 py-2.5 bg-[#24b486] text-[#041b14] text-xs font-semibold btn-primary-shadow hover:bg-[#2ec493] transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah ke itinerary</span>
                </motion.button>
              </div>

              <div className="grid gap-3 mt-5">
                {Array.from({ length: days }, (_, idx) => idx + 1).map((d) => {
                  const acts = itinerary.daftarAktivitas.filter(
                    (a) => a.hari === d
                  );
                  return (
                    <div key={d} className="grid gap-1.5">
                      <b className="text-xs font-semibold text-[#3ad19e]">
                        Hari {d}
                      </b>
                      {acts.length > 0 ? (
                        acts.map((a) => {
                          const dest = destinations.find(
                            (z) => z.id === a.itemId
                          );
                          return (
                            <motion.div
                              key={a.id}
                              initial={{ opacity: 0, x: -6 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.2 }}
                              className="flex justify-between gap-2.5 items-center bg-[#091411] border border-[#1a2f28] rounded-lg px-3 py-2.5"
                            >
                              <strong className="text-[13px] font-medium text-[#ecf5f1]">
                                {dest?.nama || 'Item dihapus'}
                              </strong>
                              <span className="flex items-center gap-2.5 text-[13px] tabular-nums text-[#b2c7be]">
                                {rupiah(dest?.estimasiBiaya || 0)}
                                <button
                                  type="button"
                                  aria-label="Hapus aktivitas"
                                  onClick={() => handleRemoveActivity(a.id)}
                                  className="border border-[#1d352d] bg-[#0f1f1a] hover:border-[#52272c] hover:text-[#f28b94] rounded-md w-7 h-7 inline-grid place-items-center text-[#97b0a5] cursor-pointer transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </span>
                            </motion.div>
                          );
                        })
                      ) : (
                        <div className="text-xs text-[#728c81]">
                          Belum ada aktivitas.
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-2 flex-wrap mt-5 pt-4 border-t border-[#182c25]">
                <button
                  type="button"
                  onClick={() => {
                    onUpdateItinerary(
                      { ...itinerary, totalAnggaran: grandTotal },
                      true
                    );
                    onToast('Itinerary tersimpan di browser');
                  }}
                  className="border border-[#244237] rounded-lg px-4 py-2 bg-[#142a23] text-[#d9f0e7] text-xs font-semibold hover:bg-[#1b382f] transition-colors cursor-pointer whitespace-nowrap"
                >
                  Simpan itinerary
                </button>
                <button
                  type="button"
                  onClick={handleDownloadJson}
                  className="inline-flex items-center gap-1.5 border border-[#1d352d] bg-[#091411] text-[#ecf5f1] rounded-lg px-4 py-2 text-xs font-semibold hover:border-[#2c5245] transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh JSON</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopySummary}
                  className="inline-flex items-center gap-1.5 border border-[#1d352d] bg-[#091411] text-[#ecf5f1] rounded-lg px-4 py-2 text-xs font-semibold hover:border-[#2c5245] transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin ringkasan</span>
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex items-center gap-1.5 border border-[#1d352d] bg-[#091411] text-[#ecf5f1] rounded-lg px-4 py-2 text-xs font-semibold hover:border-[#2c5245] transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak rencana</span>
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.4, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
              className="bg-[#0f1f1a] border border-[#1d352d] rounded-xl p-6 card-shadow"
            >
              <h3 className="mt-0 mb-4 font-display text-[#ecf5f1] font-semibold text-lg">
                Kalkulator anggaran
              </h3>
              <div className="grid gap-1 text-sm">
                <div className="flex justify-between gap-3 items-center border-b border-[#182c25] py-3">
                  <span className="text-[#b2c7be]">
                    Biaya destinasi (sesuai aktivitas)
                  </span>
                  <b className="tabular-nums text-[#ecf5f1]">{rupiah(destCost)}</b>
                </div>
                <div className="flex justify-between gap-3 items-center border-b border-[#182c25] py-3">
                  <label htmlFor="mealCost" className="text-[#b2c7be]">
                    Anggaran makan / orang / hari
                  </label>
                  <input
                    id="mealCost"
                    type="number"
                    min={0}
                    value={mealCost}
                    onChange={(e) => setMealCost(Number(e.target.value) || 0)}
                    className="max-w-[140px] tabular-nums w-full px-3 py-2 border border-[#1d352d] rounded-lg bg-[#081310] text-[#ecf5f1] text-sm outline-none focus:border-[#24b486]"
                  />
                </div>
                <div className="flex justify-between gap-3 items-center border-b border-[#182c25] py-3">
                  <label htmlFor="stayCost" className="text-[#b2c7be]">
                    Akomodasi / kamar / malam
                  </label>
                  <input
                    id="stayCost"
                    type="number"
                    min={0}
                    value={stayCost}
                    onChange={(e) => setStayCost(Number(e.target.value) || 0)}
                    className="max-w-[140px] tabular-nums w-full px-3 py-2 border border-[#1d352d] rounded-lg bg-[#081310] text-[#ecf5f1] text-sm outline-none focus:border-[#24b486]"
                  />
                </div>
                <div className="flex justify-between gap-3 items-center border-b border-[#182c25] py-3">
                  <span className="text-[#b2c7be]">Estimasi makan</span>
                  <b className="tabular-nums text-[#ecf5f1]">{rupiah(mealTotal)}</b>
                </div>
                <div className="flex justify-between gap-3 items-center border-b border-[#182c25] py-3">
                  <span className="text-[#b2c7be]">
                    Estimasi akomodasi (1 kamar)
                  </span>
                  <b className="tabular-nums text-[#ecf5f1]">{rupiah(stayTotal)}</b>
                </div>
                <div className="flex justify-between gap-3 items-center py-4">
                  <span className="font-semibold text-[#ecf5f1]">
                    Total estimasi
                  </span>
                  <span className="font-display text-[26px] font-semibold text-[#3ad19e] tabular-nums">
                    {rupiah(grandTotal)}
                  </span>
                </div>
                <p className="text-xs text-[#97b0a5] bg-[#091411] border border-[#1a2f28] px-3.5 py-3 rounded-lg m-0 leading-relaxed">
                  Seluruh harga adalah simulasi, bukan penawaran resmi. Biaya
                  transportasi antarkota, tiket aktual, dan pengeluaran pribadi
                  belum termasuk.
                </p>
              </div>
            </motion.div>
          </div>

          <div className="bg-[#0f1f1a] border border-[#1d352d] rounded-xl p-6 card-shadow mt-5">
            <div className="mb-4">
              <h3 className="m-0 font-display text-[#ecf5f1] font-semibold text-lg">
                Rekomendasi paket wisata
              </h3>
              <p className="text-xs text-[#97b0a5] mt-1 mb-0">
                Mencocokkan minat, durasi, dan batas anggaran secara otomatis.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-4">
              <select
                value={interestFilter}
                onChange={(e) => setInterestFilter(e.target.value)}
                className={inputClass}
              >
                <option value="">Semua minat</option>
                <option>alam</option>
                <option>bahari</option>
                <option>religi</option>
                <option>sejarah</option>
                <option>budaya</option>
                <option>kuliner</option>
              </select>
              <select
                value={packageDaysFilter}
                onChange={(e) => setPackageDaysFilter(e.target.value)}
                className={inputClass}
              >
                <option value="">Durasi apa saja</option>
                {[1, 2, 3, 4, 5].map((d) => (
                  <option key={d} value={String(d)}>
                    {d} hari
                  </option>
                ))}
              </select>
              <input
                type="number"
                min={0}
                value={budgetFilter}
                onChange={(e) => setBudgetFilter(e.target.value)}
                placeholder="Batas anggaran (Rp)"
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredPackages.length > 0 ? (
                filteredPackages.map((p) => {
                  const pkgImg = !failedPkgImages[p.id]
                    ? safeUrl(p.imageUrl)
                    : '';
                  return (
                    <motion.article
                      key={p.id}
                      whileHover={{ y: -3 }}
                      transition={{ duration: 0.2 }}
                      className="bg-[#091411] border border-[#1d352d] hover:border-[#2c5245] rounded-xl overflow-hidden transition-colors flex flex-col"
                    >
                      <div className="aspect-[4/3] photo-gradient relative overflow-hidden">
                        {pkgImg ? (
                          <img
                            src={pkgImg}
                            alt={p.nama}
                            referrerPolicy="no-referrer"
                            onError={() =>
                              setFailedPkgImages((prev) => ({
                                ...prev,
                                [p.id]: true,
                              }))
                            }
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#7bc9ad]">
                            <Compass className="w-7 h-7 opacity-80" strokeWidth={1.6} />
                          </div>
                        )}
                      </div>
                      <div className="p-5 flex-1 flex flex-col">
                        <div className="text-xs text-[#3ad19e] font-medium tabular-nums">
                          Paket wisata · {p.durasi} hari
                        </div>
                        <h3 className="mt-1.5 mb-1.5 text-[17px] font-semibold text-[#ecf5f1]">
                          {p.nama}
                        </h3>
                        <p className="text-[#b2c7be] text-[13px] my-2 flex-1">
                          {p.deskripsi}
                        </p>
                        <div className="text-[#97b0a5] text-xs mb-4">
                          Minat: {p.minat.join(', ')}
                        </div>
                        <div className="pt-3.5 border-t border-[#182c25] flex justify-between items-center gap-2">
                          <div className="tabular-nums">
                            <b className="font-semibold text-[#ecf5f1] text-sm">
                              {rupiah(p.estimasiBiaya)}
                            </b>
                            <span className="text-[11px] text-[#849f93] ml-1.5">
                              simulasi
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleUsePackage(p)}
                            className="border border-[#244237] rounded-lg px-4 py-2 bg-[#142a23] text-[#d9f0e7] text-xs font-semibold hover:bg-[#1b382f] transition-colors cursor-pointer whitespace-nowrap"
                          >
                            Gunakan paket
                          </button>
                        </div>
                      </div>
                    </motion.article>
                  );
                })
              ) : (
                <div className="col-span-full p-8 text-center text-[#97b0a5] bg-[#091411] border border-[#1d352d] rounded-xl">
                  Belum ada paket yang cocok. Coba longgarkan minat, durasi, atau
                  anggaran.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="print-sheet-wrapper">
        {printSnapshot && (
          <div id="printSheet" className="print-sheet">
            <h1>{printSnapshot.namaPerjalanan}</h1>
            <div className="psmeta">
              Pemuda Aceh · Rencana perjalanan
              {printSnapshot.tanggalMulai
                ? ` · Mulai ${printSnapshot.tanggalMulai}`
                : ''}{' '}
              · {printSnapshot.jumlahHari} hari ·{' '}
              {printSnapshot.jumlahWisatawan} wisatawan
            </div>
            <h2>Itinerary</h2>
            <table>
              <thead>
                <tr>
                  <th>Hari</th>
                  <th>Aktivitas</th>
                  <th>Wilayah</th>
                  <th>Estimasi</th>
                </tr>
              </thead>
              <tbody>
                {printSnapshot.daftarAktivitas.length > 0 ? (
                  printSnapshot.daftarAktivitas.map((a, idx) => (
                    <tr key={idx}>
                      <td>Hari {a.hari}</td>
                      <td>{a.nama}</td>
                      <td>{a.wilayah}</td>
                      <td>{rupiah(a.estimasiBiaya)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4}>Belum ada aktivitas.</td>
                  </tr>
                )}
              </tbody>
            </table>
            <h2>Ringkasan anggaran</h2>
            <table>
              <tbody>
                <tr>
                  <th>Biaya destinasi</th>
                  <td>{rupiah(printSnapshot.ringkasanBiaya.destinasi)}</td>
                </tr>
                <tr>
                  <th>Estimasi makan</th>
                  <td>{rupiah(printSnapshot.ringkasanBiaya.makan)}</td>
                </tr>
                <tr>
                  <th>Estimasi akomodasi (1 kamar)</th>
                  <td>{rupiah(printSnapshot.ringkasanBiaya.akomodasi)}</td>
                </tr>
                <tr>
                  <th>Total estimasi</th>
                  <td>{rupiah(printSnapshot.ringkasanBiaya.total)}</td>
                </tr>
              </tbody>
            </table>
            <div className="pstotal">
              Total: {rupiah(printSnapshot.ringkasanBiaya.total)}
            </div>
            <p className="psnote">
              {printSnapshot.catatan} Biaya transportasi antarkota dan
              pengeluaran pribadi belum termasuk.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
