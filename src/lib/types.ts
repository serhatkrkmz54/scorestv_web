// Backend (Spring) auth sözleşmesiyle birebir eşleşen tipler.
export type Role = "ADMIN" | "EDITOR" | "USER";

export interface AppUser {
  id: number;
  email: string;
  displayName: string;
  role: Role;
  birthDate: string | null; // ISO yyyy-MM-dd
  age: number | null;
  country: string | null;
  /**
   * Yerel şifresi var mı? Google ile oluşturulan hesaplarda false döner —
   * profil sayfası "Şifre Değiştir" bölümünü buna göre gösterir/gizler.
   * Eski backend bu alanı döndürmezse undefined kalır (şifre bölümü gösterilir).
   */
  hasPassword?: boolean;
}

// /api/v1/auth/* başarılı yanıtı
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number; // saniye
  user: AppUser;
}

// GlobalExceptionHandler standart hata gövdesi
export interface BackendError {
  status: number;
  message: string;
  errors?: Record<string, string>;
}

export interface LoginInput {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterInput {
  email: string;
  password: string;
  displayName: string;
  birthDate: string; // yyyy-MM-dd
  country: string;
}
