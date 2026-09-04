export const GALLERY_CONFIG = {
  // 1. LEBAR PANEL (Default: 0.24)
  // Semakin BESAR nilainya, panel akan semakin PANJANG/LEBAR merentang ke kanan dan kiri.
  PANEL_WIDTH: 0.21,

  // 2. TINGGI PANEL (Default: 13.5)
  // Semakin BESAR nilainya, panel akan semakin TINGGI.
  PANEL_HEIGHT: 18.5,

  // 3. POSISI AKHIR PANEL (Default: 0.36)
  // Menentukan titik berhenti panel terakhir saat *scroll* maksimal.
  // Semakin KECIL nilainya (misal 0.20), panel akan bergeser semakin jauh ke KIRI.
  // Semakin BESAR nilainya (misal 0.50),  akan bergeser semakin ke KANAN (ke tengah).
  T_LEFT: 0.37,

  // 4. LENGKUNGAN SISI KIRI (BEND)
  // Menentukan di titik mana sisi kiri panel mulai membengkok ke belakang.
  // Posisi X membentang dari -0.5 (ujung kiri) sampai 0.5 (ujung kanan).
  // Semakin BESAR nilainya (misal 0.1), semakin banyak area panel yang ikut melengkung.
  LEFT_BEND_START: -0.1,

  // Seberapa dalam/kuat lengkungan sisi kiri ke arah belakang.
  // Semakin MINUS nilainya (misal -3.0), lengkungan ke dalam dinding semakin tajam/dalam.
  // Jika diatur ke 0.0, panel akan sepenuhnya lurus/mengikuti dinding alami tanpa bengkokan.
  LEFT_BEND_AMOUNT: 0.0,

  // 5. KOREKSI KEMIRINGAN (YAW / ROTATION)
  // Panel secara alami sangat miring ke kanan mengikuti dinding melengkung.
  // Gunakan nilai ini untuk MEMUTAR seluruh panel secara fisik (dalam derajat).
  // Semakin BESAR nilainya (misal 15.0 atau 30.0), sisi kanan panel akan berputar ke arah depan.
  // Jika diatur ke 0.0, panel tidak diputar (mengikuti kemiringan dinding secara pasif).
  YAW_CORRECTION: 5.0,

  // 5.5 KOREKSI KEMIRINGAN ATAS/BAWAH (PITCH / TILT)
  // Gunakan nilai ini untuk menundukkan atau menengadahkan panel (dalam derajat).
  // Semakin BESAR nilainya (misal 10.0), bagian atas panel akan condong ke depan (menunduk).
  // Semakin MINUS nilainya (misal -10.0), bagian atas panel akan condong ke belakang (menengadah).
  PITCH_CORRECTION: -0,

  // 6. SUDUT KEMIRINGAN DINDING (DEPTH ANGLE)
  // Menentukan seberapa jauh/curam dinding dan panel menjorok ke belakang layar.
  // Semakin BESAR nilainya (misal 50.0 atau 70.0), panel akan terlihat semakin miring/tiduran ke belakang.
  // Semakin KECIL nilainya (misal 20.0), panel akan terlihat lebih rata berhadapan dengan layar.
  WALL_DEPTH_SLOPE: 50.0,

  // KONSTANTA INTERNAL (JANGAN DIUBAH KECUALI PENGEMBANG)
  START_T: 1.40, // Posisi awal panel di luar layar (kanan)
  SPACING: 1.15, // Jarak antar panel
};

// Jarak tempuh otomatis dihitung agar panel mendarat pas di T_LEFT
export const GALLERY_TRAVEL = GALLERY_CONFIG.START_T - GALLERY_CONFIG.T_LEFT + 4 * GALLERY_CONFIG.SPACING;

export const SPIDERMAN_CONFIG = {
  // 1. UKURAN / SKALA
  // Semakin BESAR nilainya, Spiderman akan semakin besar. (Default: 6.0)
  SCALE: 15.0,

  // 2. POSISI SAAT BERHENTI (TARGET Y)
  // Posisi vertikal tempat Spiderman berhenti setelah merayap naik. (Default: -1.0)
  // Semakin BESAR (mendekati 0 atau positif), posisinya semakin ke atas layar.
  TARGET_Y: 2.0,

  // 3. POSISI AWAL / SEMBUNYI (START Y)
  // Posisi vertikal tempat Spiderman mulai merayap naik. (Default: -20.0)
  START_Y: -20.0,

  // 4. POSISI HORIZONTAL & KEDALAMAN
  POS_X: 6.0,    // Kiri/Kanan (Positif = Kanan). Default: 6.0
  POS_Z: -15.0,  // Depan/Belakang dinding (Semakin minus = Semakin jauh). Default: -15.0

  // 5. ROTASI TUBUH SPIDERMAN (DALAM DERAJAT)
  // Putar tubuh Spiderman agar menempel/menghadap sesuai keinginan Anda.
  // Catatan: Jika ingin dia tegak normal, coba X: -90, Y: 180, Z: 0.
  ROT_X: -90,      // Menunduk / Menengadah (Default: 0 - perut nempel dinding)
  ROT_Y: 0,      // Menoleh Kiri / Kanan (Default: 0)
  ROT_Z: 153,    // Miring / Rolling (Default: 153 derajat, agar tubuhnya serong)
};
