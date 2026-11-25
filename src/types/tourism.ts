export type CatalogType = 'destinations' | 'foods' | 'stays' | 'packages';
export type FavoritableType = 'destinations' | 'foods' | 'stays';
export type Language = 'id' | 'en';

export interface Destination {
  id: string;
  nama: string;
  kategori: string;
  wilayah: string;
  deskripsi: string;
  imageUrl?: string;
  sumberFoto?: string;
  fotoIlustrasi?: boolean;
  alamat: string;
  mapsUrl?: string;
  estimasiBiaya: number;
  fasilitas: string[];
  fasilitasIbadah: string[];
  unggulan: boolean;
  catatanVerifikasi?: string;
}

export interface FoodItem {
  id: string;
  nama: string;
  kategori: string;
  wilayah: string;
  harga: number;
  imageUrl?: string;
  sumberFoto?: string;
  fotoIlustrasi?: boolean;
  statusSertifikasiHalal: 'Terverifikasi' | 'Belum diverifikasi' | 'Tidak diketahui';
  sumberVerifikasi?: string;
  kontak?: string;
  catatan?: string;
}

export interface StayItem {
  id: string;
  nama: string;
  kategori?: string;
  wilayah: string;
  hargaPerMalam: number;
  fasilitas: string[];
  fasilitasRamahMuslim: string[];
  imageUrl?: string;
  sumberFoto?: string;
  fotoIlustrasi?: boolean;
  kontak?: string;
  catatan?: string;
}

export interface TourPackage {
  id: string;
  nama: string;
  imageUrl?: string;
  sumberFoto?: string;
  fotoIlustrasi?: boolean;
  durasi: number;
  daftarDestinasi: string[];
  estimasiBiaya: number;
  deskripsi: string;
  minat: string[];
  wilayah?: string;
  kategori?: string;
}

export interface TourismDatabase {
  destinations: Destination[];
  foods: FoodItem[];
  stays: StayItem[];
  packages: TourPackage[];
}

export interface FavoriteItem {
  id: string;
  itemId: string;
  tipeItem: FavoritableType;
  tanggalDitambahkan: string;
}

export interface ActivityItem {
  id: string;
  hari: number;
  itemId: string;
  tipeItem: string;
  waktu: string;
  catatan: string;
}

export interface Itinerary {
  namaPerjalanan: string;
  tanggalMulai: string;
  jumlahHari: number;
  jumlahWisatawan: number;
  daftarAktivitas: ActivityItem[];
  totalAnggaran?: number;
}

export interface TripSnapshot {
  namaPerjalanan: string;
  tanggalMulai: string | null;
  jumlahHari: number;
  jumlahWisatawan: number;
  daftarAktivitas: {
    hari: number;
    itemId: string;
    nama: string;
    wilayah: string;
    estimasiBiaya: number;
  }[];
  ringkasanBiaya: {
    destinasi: number;
    makan: number;
    akomodasi: number;
    total: number;
  };
  dibuatPada: string;
  catatan: string;
}
