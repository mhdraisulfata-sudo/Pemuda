import type {
  CatalogType,
  Itinerary,
  Language,
  TourismDatabase,
} from '../types/tourism';

export const SEED_DB: TourismDatabase = {
  destinations: [
    {
      id: 'd1',
      nama: 'Masjid Raya Baiturrahman',
      kategori: 'religi',
      wilayah: 'Banda Aceh',
      deskripsi:
        'Ikon kota Banda Aceh dengan arsitektur megah dan nilai sejarah yang kuat.',
      imageUrl:
        'https://commons.wikimedia.org/wiki/Special:FilePath/Masjid_Raya_Baiturrahman_di_Banda_Aceh.jpg?width=960',
      sumberFoto:
        'https://commons.wikimedia.org/wiki/File:Masjid_Raya_Baiturrahman_di_Banda_Aceh.jpg',
      alamat: 'Banda Aceh, Aceh',
      mapsUrl:
        'https://www.google.com/maps/search/?api=1&query=Masjid+Raya+Baiturrahman',
      estimasiBiaya: 0,
      fasilitas: ['Area publik', 'Area parkir'],
      fasilitasIbadah: ['Masjid', 'Tempat wudu'],
      unggulan: true,
      catatanVerifikasi:
        'Informasi fasilitas dan akses perlu dikonfirmasi sebelum kunjungan.',
    },
    {
      id: 'd2',
      nama: 'Museum Tsunami Aceh',
      kategori: 'sejarah',
      wilayah: 'Banda Aceh',
      deskripsi:
        'Ruang edukasi dan refleksi untuk mengenang peristiwa tsunami 2004.',
      imageUrl:
        'https://commons.wikimedia.org/wiki/Special:FilePath/Aceh_Tsunami_Museum_site_visit%3B_February_2020_%2803%29.jpg?width=960',
      sumberFoto:
        'https://commons.wikimedia.org/wiki/File:Aceh_Tsunami_Museum_site_visit;_February_2020_(03).jpg',
      alamat: 'Banda Aceh, Aceh',
      mapsUrl:
        'https://www.google.com/maps/search/?api=1&query=Museum+Tsunami+Aceh',
      estimasiBiaya: 20000,
      fasilitas: ['Ruang pamer', 'Area edukasi'],
      fasilitasIbadah: ['Musala (perlu konfirmasi)'],
      unggulan: true,
      catatanVerifikasi: 'Jam buka dan tarif dapat berubah; periksa kanal resmi.',
    },
    {
      id: 'd3',
      nama: 'Kapal PLTD Apung',
      kategori: 'sejarah',
      wilayah: 'Banda Aceh',
      deskripsi:
        'Situs memorial kapal besar yang terdorong ke daratan saat tsunami.',
      imageUrl:
        'https://commons.wikimedia.org/wiki/Special:FilePath/PLTD_Apung.jpg?width=960',
      sumberFoto: 'https://commons.wikimedia.org/wiki/File:PLTD_Apung.jpg',
      alamat: 'Banda Aceh, Aceh',
      mapsUrl:
        'https://www.google.com/maps/search/?api=1&query=Kapal+PLTD+Apung',
      estimasiBiaya: 10000,
      fasilitas: ['Area memorial', 'Spot foto'],
      fasilitasIbadah: ['Masjid di kawasan sekitar'],
      unggulan: false,
      catatanVerifikasi: 'Akses dan kondisi kunjungan perlu diverifikasi.',
    },
    {
      id: 'd4',
      nama: 'Pantai Lampuuk',
      kategori: 'bahari',
      wilayah: 'Aceh Besar',
      deskripsi: 'Kawasan pantai dengan garis pasir dan panorama pesisir.',
      imageUrl:
        'https://commons.wikimedia.org/wiki/Special:FilePath/Pantai_Lampuuk_Aceh.jpg?width=960',
      sumberFoto:
        'https://commons.wikimedia.org/wiki/File:Pantai_Lampuuk_Aceh.jpg',
      alamat: 'Lhoknga, Aceh Besar',
      mapsUrl:
        'https://www.google.com/maps/search/?api=1&query=Pantai+Lampuuk+Aceh',
      estimasiBiaya: 10000,
      fasilitas: ['Area pantai', 'Warung lokal'],
      fasilitasIbadah: ['Musala/masjid sekitar (perlu konfirmasi)'],
      unggulan: true,
      catatanVerifikasi: 'Fasilitas dan kondisi ombak/cuaca perlu diperiksa.',
    },
    {
      id: 'd5',
      nama: 'Air Terjun Suhom',
      kategori: 'alam',
      wilayah: 'Aceh Besar',
      deskripsi:
        'Alternatif wisata alam dengan suasana hijau di kawasan Lhoong.',
      imageUrl:
        'https://commons.wikimedia.org/wiki/Special:FilePath/Air_terjun_mini_di_aceh_besar_-_panoramio.jpg?width=960',
      sumberFoto:
        'https://commons.wikimedia.org/wiki/File:Air_terjun_mini_di_aceh_besar_-_panoramio.jpg',
      fotoIlustrasi: true,
      alamat: 'Lhoong, Aceh Besar',
      mapsUrl:
        'https://www.google.com/maps/search/?api=1&query=Air+Terjun+Suhom',
      estimasiBiaya: 10000,
      fasilitas: ['Area alam', 'Parkir (perlu konfirmasi)'],
      fasilitasIbadah: ['Masjid di permukiman sekitar'],
      unggulan: false,
      catatanVerifikasi: 'Akses jalan dan fasilitas perlu dikonfirmasi.',
    },
    {
      id: 'd6',
      nama: 'Pulau Weh / Iboih',
      kategori: 'bahari',
      wilayah: 'Sabang',
      deskripsi:
        'Kawasan bahari populer untuk menikmati laut dan aktivitas pesisir.',
      imageUrl:
        'https://commons.wikimedia.org/wiki/Special:FilePath/Iboih_beach%2C_Sabang%2C_Aceh%3B_August_2010.jpg?width=960',
      sumberFoto:
        'https://commons.wikimedia.org/wiki/File:Iboih_beach,_Sabang,_Aceh;_August_2010.jpg',
      alamat: 'Iboih, Sabang',
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Iboih+Sabang',
      estimasiBiaya: 50000,
      fasilitas: ['Pesisir', 'Operator aktivitas (perlu konfirmasi)'],
      fasilitasIbadah: ['Masjid di kawasan permukiman'],
      unggulan: true,
      catatanVerifikasi:
        'Operator, tarif, cuaca, dan fasilitas harus diverifikasi.',
    },
    {
      id: 'd7',
      nama: 'Pantai Sumur Tiga',
      kategori: 'bahari',
      wilayah: 'Sabang',
      deskripsi: 'Pantai di Pulau Weh dengan pemandangan laut dan suasana santai.',
      imageUrl:
        'https://commons.wikimedia.org/wiki/Special:FilePath/Pantai_Anoi_Itam.jpg?width=960',
      sumberFoto:
        'https://commons.wikimedia.org/wiki/File:Pantai_Anoi_Itam.jpg',
      fotoIlustrasi: true,
      alamat: 'Sabang, Aceh',
      mapsUrl:
        'https://www.google.com/maps/search/?api=1&query=Pantai+Sumur+Tiga+Sabang',
      estimasiBiaya: 10000,
      fasilitas: ['Area pantai'],
      fasilitasIbadah: ['Masjid di sekitar permukiman'],
      unggulan: false,
      catatanVerifikasi: 'Informasi akses dan fasilitas perlu dikonfirmasi.',
    },
    {
      id: 'd8',
      nama: 'Danau Laut Tawar',
      kategori: 'alam',
      wilayah: 'Aceh Tengah',
      deskripsi:
        'Danau dataran tinggi dengan lanskap pegunungan dan budaya Gayo.',
      imageUrl:
        'https://commons.wikimedia.org/wiki/Special:FilePath/Danau_Laut_Tawar%2C_Takengon%2C_Aceh_Tengah.jpg?width=960',
      sumberFoto:
        'https://commons.wikimedia.org/wiki/File:Danau_Laut_Tawar,_Takengon,_Aceh_Tengah.jpg',
      alamat: 'Takengon, Aceh Tengah',
      mapsUrl:
        'https://www.google.com/maps/search/?api=1&query=Danau+Laut+Tawar',
      estimasiBiaya: 15000,
      fasilitas: ['Area tepi danau', 'Kuliner sekitar'],
      fasilitasIbadah: ['Masjid di kawasan sekitar'],
      unggulan: true,
      catatanVerifikasi: 'Kondisi lokasi dan tarif perlu diverifikasi.',
    },
    {
      id: 'd9',
      nama: 'Pantan Terong',
      kategori: 'alam',
      wilayah: 'Aceh Tengah',
      deskripsi:
        'Titik pandang dataran tinggi untuk menikmati panorama kawasan Takengon.',
      imageUrl:
        'https://commons.wikimedia.org/wiki/Special:FilePath/Pantan_Terong_Aceh.jpg?width=960',
      sumberFoto:
        'https://commons.wikimedia.org/wiki/File:Pantan_Terong_Aceh.jpg',
      alamat: 'Takengon, Aceh Tengah',
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Pantan+Terong',
      estimasiBiaya: 15000,
      fasilitas: ['Area pandang'],
      fasilitasIbadah: ['Fasilitas ibadah terdekat perlu dikonfirmasi'],
      unggulan: true,
      catatanVerifikasi:
        'Cuaca, akses, dan fasilitas perlu dicek sebelum berangkat.',
    },
    {
      id: 'd10',
      nama: 'Bur Telege',
      kategori: 'budaya',
      wilayah: 'Bener Meriah',
      deskripsi:
        'Kawasan dataran tinggi dengan lanskap alam dan suasana Gayo.',
      imageUrl:
        'https://commons.wikimedia.org/wiki/Special:FilePath/Dataran_tinggi_Gayo.jpg?width=960',
      sumberFoto:
        'https://commons.wikimedia.org/wiki/File:Dataran_tinggi_Gayo.jpg',
      fotoIlustrasi: true,
      alamat: 'Bener Meriah, Aceh',
      mapsUrl:
        'https://www.google.com/maps/search/?api=1&query=Bur+Telege+Bener+Meriah',
      estimasiBiaya: 10000,
      fasilitas: ['Area wisata alam'],
      fasilitasIbadah: ['Masjid di kawasan sekitar'],
      unggulan: false,
      catatanVerifikasi: 'Detail akses dan fasilitas perlu dikonfirmasi.',
    },
    {
      id: 'd11',
      nama: 'Pesona perkebunan kopi Gayo',
      kategori: 'budaya',
      wilayah: 'Bener Meriah',
      deskripsi:
        'Inspirasi pengalaman mengenal kopi Gayo dan lanskap perkebunan lokal.',
      imageUrl:
        'https://commons.wikimedia.org/wiki/Special:FilePath/Kopi_Luwak_Gayo%2C_Takengon%2C_Aceh.jpg?width=960',
      sumberFoto:
        'https://commons.wikimedia.org/wiki/File:Kopi_Luwak_Gayo,_Takengon,_Aceh.jpg',
      fotoIlustrasi: true,
      alamat: 'Bener Meriah, Aceh',
      mapsUrl:
        'https://www.google.com/maps/search/?api=1&query=Perkebunan+Kopi+Gayo+Bener+Meriah',
      estimasiBiaya: 25000,
      fasilitas: ['Pengalaman edukasi (simulasi)'],
      fasilitasIbadah: ['Fasilitas ibadah perlu dikonfirmasi'],
      unggulan: false,
      catatanVerifikasi: 'Kunjungan kebun memerlukan izin pemilik/pengelola.',
    },
    {
      id: 'd12',
      nama: 'Rumoh Aceh / Museum Aceh',
      kategori: 'budaya',
      wilayah: 'Banda Aceh',
      deskripsi:
        'Mengenal arsitektur tradisional dan warisan budaya Aceh.',
      imageUrl:
        'https://commons.wikimedia.org/wiki/Special:FilePath/Rumoh_Aceh.JPG?width=960',
      sumberFoto: 'https://commons.wikimedia.org/wiki/File:Rumoh_Aceh.JPG',
      alamat: 'Banda Aceh, Aceh',
      mapsUrl:
        'https://www.google.com/maps/search/?api=1&query=Museum+Aceh+Rumoh+Aceh',
      estimasiBiaya: 10000,
      fasilitas: ['Area pamer budaya'],
      fasilitasIbadah: ['Musala (perlu konfirmasi)'],
      unggulan: false,
      catatanVerifikasi: 'Jam operasional dan fasilitas perlu dicek.',
    },
  ],
  foods: [
    {
      id: 'f1',
      nama: 'Mie Aceh',
      kategori: 'kuliner',
      wilayah: 'Banda Aceh',
      harga: 25000,
      imageUrl:
        'https://commons.wikimedia.org/wiki/Special:FilePath/Mie_Aceh.jpg?width=960',
      sumberFoto: 'https://commons.wikimedia.org/wiki/File:Mie_Aceh.jpg',
      statusSertifikasiHalal: 'Belum diverifikasi',
      sumberVerifikasi: 'Belum ada dokumen resmi pada data demo',
      kontak: '6281234500001',
      catatan:
        'Harga dan kontak simulasi. Tanyakan bahan dan proses kepada penjual.',
    },
    {
      id: 'f2',
      nama: 'Kopi Gayo',
      kategori: 'produk UMKM',
      wilayah: 'Bener Meriah',
      harga: 65000,
      imageUrl:
        'https://commons.wikimedia.org/wiki/Special:FilePath/Kopi_gayo.jpg?width=960',
      sumberFoto: 'https://commons.wikimedia.org/wiki/File:Kopi_gayo.jpg',
      statusSertifikasiHalal: 'Belum diverifikasi',
      sumberVerifikasi: 'Belum ada dokumen resmi pada data demo',
      kontak: '6281234500002',
      catatan:
        'Harga dan kontak simulasi; status produk perlu dicek pada sumber resmi.',
    },
    {
      id: 'f3',
      nama: 'Kuah Beulangong',
      kategori: 'kuliner',
      wilayah: 'Aceh Besar',
      harga: 35000,
      imageUrl:
        'https://commons.wikimedia.org/wiki/Special:FilePath/Kuah_Beulangong.JPG?width=960',
      sumberFoto: 'https://commons.wikimedia.org/wiki/File:Kuah_Beulangong.JPG',
      statusSertifikasiHalal: 'Tidak diketahui',
      sumberVerifikasi: 'Tidak tersedia',
      kontak: '6281234500003',
      catatan: 'Harga dan kontak simulasi; konfirmasi bahan dan penyajian.',
    },
  ],
  stays: [
    {
      id: 's1',
      nama: 'Penginapan contoh Banda Aceh',
      wilayah: 'Banda Aceh',
      hargaPerMalam: 350000,
      fasilitas: ['Wi-Fi', 'Parkir'],
      fasilitasRamahMuslim: [
        'Arah kiblat (perlu konfirmasi)',
        'Dekat tempat ibadah',
      ],
      imageUrl:
        'https://commons.wikimedia.org/wiki/Special:FilePath/Hotel_room_interior_at_hotel_Radisson_Blu_Oulu.jpg?width=960',
      sumberFoto:
        'https://commons.wikimedia.org/wiki/File:Hotel_room_interior_at_hotel_Radisson_Blu_Oulu.jpg',
      fotoIlustrasi: true,
      kontak: '6281234500011',
      catatan: 'Nama, tarif, fasilitas, dan kontak simulasi.',
    },
    {
      id: 's2',
      nama: 'Homestay contoh Sabang',
      wilayah: 'Sabang',
      hargaPerMalam: 450000,
      fasilitas: ['Area keluarga', 'Parkir'],
      fasilitasRamahMuslim: [
        'Pilihan makanan halal sekitar (perlu konfirmasi)',
      ],
      imageUrl:
        'https://commons.wikimedia.org/wiki/Special:FilePath/Beach_and_bungalow._Eriyadu%2C_Maldives.jpg?width=960',
      sumberFoto:
        'https://commons.wikimedia.org/wiki/File:Beach_and_bungalow._Eriyadu,_Maldives.jpg',
      fotoIlustrasi: true,
      kontak: '6281234500012',
      catatan: 'Nama, tarif, fasilitas, dan kontak simulasi.',
    },
    {
      id: 's3',
      nama: 'Guesthouse contoh Takengon',
      wilayah: 'Aceh Tengah',
      hargaPerMalam: 300000,
      fasilitas: ['Wi-Fi', 'Area duduk'],
      fasilitasRamahMuslim: ['Informasi arah kiblat atas permintaan'],
      imageUrl:
        'https://commons.wikimedia.org/wiki/Special:FilePath/Blue_Mountain_Homestay_Inakanahalli_Coorg_Jun24_A7CR_01433.jpg?width=960',
      sumberFoto:
        'https://commons.wikimedia.org/wiki/File:Blue_Mountain_Homestay_Inakanahalli_Coorg_Jun24_A7CR_01433.jpg',
      fotoIlustrasi: true,
      kontak: '6281234500013',
      catatan: 'Nama, tarif, fasilitas, dan kontak simulasi.',
    },
  ],
  packages: [
    {
      id: 'p1',
      nama: 'Jejak Sejarah Banda Aceh',
      imageUrl:
        'https://commons.wikimedia.org/wiki/Special:FilePath/Masjid_Raya_Baiturrahman_di_Banda_Aceh.jpg?width=960',
      sumberFoto:
        'https://commons.wikimedia.org/wiki/File:Masjid_Raya_Baiturrahman_di_Banda_Aceh.jpg',
      durasi: 1,
      daftarDestinasi: ['d1', 'd2', 'd3'],
      estimasiBiaya: 180000,
      deskripsi: 'Menyusuri ikon religi dan sejarah kota.',
      minat: ['religi', 'sejarah'],
    },
    {
      id: 'p2',
      nama: 'Bahari Sabang',
      imageUrl:
        'https://commons.wikimedia.org/wiki/Special:FilePath/Iboih_beach%2C_Sabang%2C_Aceh%3B_August_2010.jpg?width=960',
      sumberFoto:
        'https://commons.wikimedia.org/wiki/File:Iboih_beach,_Sabang,_Aceh;_August_2010.jpg',
      durasi: 2,
      daftarDestinasi: ['d6', 'd7'],
      estimasiBiaya: 650000,
      deskripsi: 'Inspirasi perjalanan pesisir dan bahari Pulau Weh.',
      minat: ['bahari', 'alam'],
    },
    {
      id: 'p3',
      nama: 'Jelajah Dataran Tinggi Gayo',
      imageUrl:
        'https://commons.wikimedia.org/wiki/Special:FilePath/Danau_Laut_Tawar%2C_Takengon%2C_Aceh_Tengah.jpg?width=960',
      sumberFoto:
        'https://commons.wikimedia.org/wiki/File:Danau_Laut_Tawar,_Takengon,_Aceh_Tengah.jpg',
      durasi: 3,
      daftarDestinasi: ['d8', 'd9', 'd10', 'd11'],
      estimasiBiaya: 850000,
      deskripsi: 'Panorama dan budaya dataran tinggi Aceh.',
      minat: ['alam', 'budaya', 'kuliner'],
    },
  ],
};

export const DB_KEYS: CatalogType[] = [
  'destinations',
  'foods',
  'stays',
  'packages',
];

export const DEFAULT_ITINERARY: Itinerary = {
  namaPerjalanan: '',
  tanggalMulai: '',
  jumlahHari: 3,
  jumlahWisatawan: 2,
  daftarAktivitas: [],
};

export const TRANSLATIONS: Record<
  Language,
  {
    navDest: string;
    navFav: string;
    navFood: string;
    navStay: string;
    navPlan: string;
    explore: string;
    favButton: string;
  }
> = {
  id: {
    navDest: 'Destinasi',
    navFav: 'Favorit',
    navFood: 'Kuliner',
    navStay: 'Akomodasi',
    navPlan: 'Rencana Trip',
    explore: 'Jelajahi',
    favButton: '♥ Favorit',
  },
  en: {
    navDest: 'Destinations',
    navFav: 'Favorites',
    navFood: 'Food',
    navStay: 'Stays',
    navPlan: 'Trip Planner',
    explore: 'Explore',
    favButton: '♥ Favorites',
  },
};

export function rupiah(n: number | undefined): string {
  return 'Rp' + Number(n || 0).toLocaleString('id-ID');
}

export function safeUrl(u: string | undefined): string {
  const s = String(u || '').trim();
  if (!s) return '';
  try {
    const url = new URL(s, window.location.href);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
  } catch {
    return '';
  }
}

export function loadDatabase(): TourismDatabase {
  try {
    const raw = localStorage.getItem('he_db');
    if (!raw) return structuredClone(SEED_DB);
    const parsed = JSON.parse(raw) as Partial<TourismDatabase>;
    if (!parsed || !DB_KEYS.every((k) => Array.isArray(parsed[k]))) {
      return structuredClone(SEED_DB);
    }
    const merged = parsed as TourismDatabase;
    DB_KEYS.forEach((k) => {
      SEED_DB[k].forEach((seedItem) => {
        const existing = merged[k].find((y) => y.id === seedItem.id);
        if (existing) {
          if (!existing.imageUrl && seedItem.imageUrl) {
            existing.imageUrl = seedItem.imageUrl;
          }
          if (!existing.sumberFoto && seedItem.sumberFoto) {
            existing.sumberFoto = seedItem.sumberFoto;
          }
          if (
            existing.fotoIlustrasi === undefined &&
            seedItem.fotoIlustrasi !== undefined
          ) {
            existing.fotoIlustrasi = seedItem.fotoIlustrasi;
          }
        }
      });
    });
    return merged;
  } catch {
    return structuredClone(SEED_DB);
  }
}
