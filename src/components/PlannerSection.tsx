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

  return (
    <>
      <section id="planner" className="bg-[#edf6f1] py-[58px] no-print">
        <div className="w-[min(1160px,92%)] mx-auto">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-5 mb-6">
            <div>
              <div className="text-[#2ab98e] font-extrabold uppercase tracking-[2px] text-[11px]">
                Plan your journey
              </div>
              <h2 className="text-[clamp(25px,3vw,34px)] leading-[1.1] my-[6px] text-[#064e3b] tracking-[-0.8px] font-bold">
                Rancang perjalanan
              </h2>
              <p className="text-[#687b75] m-0 max-w-[530px]">
                Susun aktivitas 1–5 hari dan hitung anggaran awal perjalanan.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-white border border-[#e1ebe5] rounded-[18px] p-5 card-shadow">
              <h3 className="mt-0 mb-[14px] text-[#064e3b] font-bold text-lg">
                ✦ Itinerary planner
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-[10px]">
                <input
                  value={itinerary.namaPerjalanan}
                  onChange={(e) =>
                    onUpdateItinerary(
                      { ...itinerary, namaPerjalanan: e.target.value },
                      true
                    )
                  }
                  placeholder="Nama perjalanan"
                  className="sm:col-span-2 w-full px-3 py-[11px] border border-[#dce8e1] rounded-[11px] bg-white text-[#17352e] outline-none focus:border-[#19a7a0]"
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
                  className="w-full px-3 py-[11px] border border-[#dce8e1] rounded-[11px] bg-white text-[#17352e] outline-none focus:border-[#19a7a0]"
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
                  className="w-full px-3 py-[11px] border border-[#dce8e1] rounded-[11px] bg-white text-[#17352e] outline-none focus:border-[#19a7a0]"
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
                  className="w-full px-3 py-[11px] border border-[#dce8e1] rounded-[11px] bg-white text-[#17352e] outline-none focus:border-[#19a7a0]"
                />
                <select
                  value={activePlaceId}
                  onChange={(e) => setSelectedPlace(e.target.value)}
                  className="w-full px-3 py-[11px] border border-[#dce8e1] rounded-[11px] bg-white text-[#17352e] outline-none focus:border-[#19a7a0]"
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
                  className="w-full px-3 py-[11px] border border-[#dce8e1] rounded-[11px] bg-white text-[#17352e] outline-none focus:border-[#19a7a0]"
                >
                  {[1, 2, 3, 4, 5].map((d) => (
                    <option key={d} value={d}>
                      Hari {d}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleAddActivity}
                  className="sm:col-span-2 border-0 rounded-[12px] px-4 py-[11px] bg-[#2ab98e] text-white font-bold btn-primary-shadow hover:brightness-95 cursor-pointer"
                >
                  + Tambah ke itinerary
                </button>
              </div>

              <div className="grid gap-[10px] mt-[15px]">
                {Array.from({ length: days }, (_, idx) => idx + 1).map((d) => {
                  const acts = itinerary.daftarAktivitas.filter(
                    (a) => a.hari === d
                  );
                  return (
                    <div key={d} className="grid gap-[6px]">
                      <b className="text-[#064e3b]">Hari {d}</b>
                      {acts.length > 0 ? (
                        acts.map((a) => {
                          const dest = destinations.find(
                            (z) => z.id === a.itemId
                          );
                          return (
                            <div
                              key={a.id}
                              className="flex justify-between gap-[10px] items-center bg-[#f6faf7] rounded-[11px] px-3 py-[10px]"
                            >
                              <strong className="text-[13px]">
                                {dest?.nama || 'Item dihapus'}
                              </strong>
                              <span className="flex items-center gap-2 text-[13px]">
                                {rupiah(dest?.estimasiBiaya || 0)}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveActivity(a.id)}
                                  className="border border-[#e1ebe5] bg-white rounded-[10px] px-[10px] py-[6px] text-[#064e3b] cursor-pointer"
                                >
                                  ✕
                                </button>
                              </span>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-[11px] text-[#687b75]">
                          Belum ada aktivitas.
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => {
                  onUpdateItinerary({ ...itinerary, totalAnggaran: grandTotal }, true);
                  onToast('Itinerary tersimpan di browser');
                }}
                className="mt-3 border-0 rounded-[12px] px-4 py-[11px] bg-[#e8f4ee] text-[#064e3b] font-bold hover:brightness-95 cursor-pointer"
              >
                Simpan itinerary
              </button>

              <div className="flex gap-2 flex-wrap mt-3">
                <button
                  type="button"
                  onClick={handleDownloadJson}
                  className="border border-[#e1ebe5] bg-white text-[#064e3b] rounded-[12px] px-4 py-[11px] font-bold hover:brightness-95 cursor-pointer"
                >
                  ↓ Unduh JSON
                </button>
                <button
                  type="button"
                  onClick={handleCopySummary}
                  className="border-0 rounded-[12px] px-4 py-[11px] bg-[#e8f4ee] text-[#064e3b] font-bold hover:brightness-95 cursor-pointer"
                >
                  ⧉ Salin ringkasan
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="border-0 rounded-[12px] px-4 py-[11px] bg-[#e8f4ee] text-[#064e3b] font-bold hover:brightness-95 cursor-pointer"
                >
                  ⎙ Cetak rencana
                </button>
              </div>
            </div>

            <div className="bg-white border border-[#e1ebe5] rounded-[18px] p-5 card-shadow">
              <h3 className="mt-0 mb-[14px] text-[#064e3b] font-bold text-lg">
                ◈ Kalkulator anggaran
              </h3>
              <div className="grid gap-[10px]">
                <div className="flex justify-between gap-3 items-center border-b border-[#edf2ee] py-[10px]">
                  <span>Biaya destinasi (sesuai aktivitas)</span>
                  <b>{rupiah(destCost)}</b>
                </div>
                <div className="flex justify-between gap-3 items-center border-b border-[#edf2ee] py-[10px]">
                  <label htmlFor="mealCost">
                    Anggaran makan / orang / hari
                  </label>
                  <input
                    id="mealCost"
                    type="number"
                    min={0}
                    value={mealCost}
                    onChange={(e) => setMealCost(Number(e.target.value) || 0)}
                    className="max-w-[140px] w-full px-3 py-[11px] border border-[#dce8e1] rounded-[11px] bg-white text-[#17352e] outline-none"
                  />
                </div>
                <div className="flex justify-between gap-3 items-center border-b border-[#edf2ee] py-[10px]">
                  <label htmlFor="stayCost">Akomodasi / kamar / malam</label>
                  <input
                    id="stayCost"
                    type="number"
                    min={0}
                    value={stayCost}
                    onChange={(e) => setStayCost(Number(e.target.value) || 0)}
                    className="max-w-[140px] w-full px-3 py-[11px] border border-[#dce8e1] rounded-[11px] bg-white text-[#17352e] outline-none"
                  />
                </div>
                <div className="flex justify-between gap-3 items-center border-b border-[#edf2ee] py-[10px]">
                  <span>Estimasi makan</span>
                  <b>{rupiah(mealTotal)}</b>
                </div>
                <div className="flex justify-between gap-3 items-center border-b border-[#edf2ee] py-[10px]">
                  <span>Estimasi akomodasi (1 kamar)</span>
                  <b>{rupiah(stayTotal)}</b>
                </div>
                <div className="flex justify-between gap-3 items-center py-[10px]">
                  <span>
                    <b>Total estimasi</b>
                  </span>
                  <span className="text-[25px] font-black text-[#064e3b]">
                    {rupiah(grandTotal)}
                  </span>
                </div>
                <p className="text-[11px] text-[#687b75] bg-[#f2f7f3] px-3 py-[10px] rounded-[10px] m-0">
                  Seluruh harga adalah simulasi, bukan penawaran resmi. Biaya
                  transportasi antarkota, tiket aktual, dan pengeluaran pribadi
                  belum termasuk.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#e1ebe5] rounded-[18px] p-5 card-shadow mt-5">
            <div className="mb-3">
              <h3 className="m-0 text-[#064e3b] font-bold text-lg">
                Rekomendasi paket wisata
              </h3>
              <p className="text-[11px] text-[#687b75] m-0">
                Rule-based: mencocokkan minat, durasi, dan batas anggaran.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-[10px] my-[18px]">
              <select
                value={interestFilter}
                onChange={(e) => setInterestFilter(e.target.value)}
                className="w-full px-3 py-[11px] border border-[#dce8e1] rounded-[11px] bg-white text-[#17352e] outline-none"
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
                className="w-full px-3 py-[11px] border border-[#dce8e1] rounded-[11px] bg-white text-[#17352e] outline-none"
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
                className="w-full px-3 py-[11px] border border-[#dce8e1] rounded-[11px] bg-white text-[#17352e] outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[18px]">
              {filteredPackages.length > 0 ? (
                filteredPackages.map((p) => {
                  const pkgImg = !failedPkgImages[p.id]
                    ? safeUrl(p.imageUrl)
                    : '';
                  return (
                    <article
                      key={p.id}
                      className="bg-white border border-[#e1ebe5] rounded-[18px] overflow-hidden card-shadow transition-transform duration-200 hover:-translate-y-[3px]"
                    >
                      <div className="h-[170px] photo-gradient grid place-items-center text-[54px] relative">
                        {pkgImg ? (
                          <img
                            src={pkgImg}
                            alt={p.nama}
                            onError={() =>
                              setFailedPkgImages((prev) => ({
                                ...prev,
                                [p.id]: true,
                              }))
                            }
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        ) : (
                          <span>🧭</span>
                        )}
                        <small className="absolute bottom-[10px] left-[12px] z-[2] bg-[#ffffffdf] rounded-full px-[9px] py-[5px] text-[10px] font-extrabold text-[#064e3b]">
                          Paket wisata
                        </small>
                      </div>
                      <div className="p-4">
                        <span className="inline-flex rounded-full bg-[#e9f5ef] text-[#064e3b] px-[9px] py-1 text-[10px] font-extrabold">
                          {p.durasi} hari
                        </span>
                        <h3 className="mt-2 mb-[5px] text-[18px] font-bold text-[#064e3b]">
                          {p.nama}
                        </h3>
                        <p className="text-[#5c7169] text-[13px] my-[10px]">
                          {p.deskripsi}
                        </p>
                        <div className="text-[#687b75] text-[12px]">
                          Minat: {p.minat.join(', ')}
                        </div>
                        <div className="flex justify-between items-center gap-2 mt-[14px]">
                          <b className="font-[850] text-[#064e3b] text-[13px]">
                            {rupiah(p.estimasiBiaya)}{' '}
                            <small className="text-[11px] font-normal text-[#687b75]">
                              simulasi
                            </small>
                          </b>
                          <button
                            type="button"
                            onClick={() => handleUsePackage(p)}
                            className="border-0 rounded-[12px] px-4 py-[11px] bg-[#e8f4ee] text-[#064e3b] font-bold hover:brightness-95 cursor-pointer"
                          >
                            Gunakan paket
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })
              ) : (
                <div className="col-span-full p-7 text-center text-[#687b75] bg-[#f7faf8] rounded-[14px]">
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
