/**
 * Service de stockage prêt pour la production
 * Gère localStorage avec gestion d'erreurs, validation et repli
 */

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'candidate_access_token',
  LEGACY_ACCESS_TOKEN: 'accessToken',
  USER_CVS: 'user_cvs',
  LEGACY_CV_DRAFT: 'latest_cv_draft',
} as const;

class StorageService {
  /**
   * Récupère une valeur localStorage de manière sûre
   */
  getItem<T>(key: string, defaultValue: T | null = null): T | null {
    if (typeof window === 'undefined') return defaultValue;
    
    try {
      const item = localStorage.getItem(key);
      if (!item) return defaultValue;
      
      // Tente un parsing JSON
      try {
        return JSON.parse(item) as T;
      } catch {
        // Retourne en chaîne si ce n'est pas du JSON
        return item as unknown as T;
      }
    } catch (error) {
      console.error(`Erreur de lecture localStorage (${key}) :`, error);
      return defaultValue;
    }
  }

  /**
   * Enregistre une valeur localStorage de manière sûre
   */
  setItem(key: string, value: any): boolean {
    if (typeof window === 'undefined') return false;
    
    try {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      localStorage.setItem(key, stringValue);
      return true;
    } catch (error) {
      console.error(`Erreur d'écriture localStorage (${key}) :`, error);
      
      // Vérifie si le quota est dépassé
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.warn('Quota localStorage dépassé. Nettoyage des anciennes données...');
        this.clearOldData();
        
        // Réessaie après nettoyage
        try {
          const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
          localStorage.setItem(key, stringValue);
          return true;
        } catch {
          return false;
        }
      }
      
      return false;
    }
  }

  /**
   * Supprime une valeur localStorage
   */
  removeItem(key: string): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Erreur de suppression localStorage (${key}) :`, error);
    }
  }

  /**
   * Efface toutes les données de l'application
   */
  clear(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Erreur lors du nettoyage de localStorage :', error);
    }
  }

  /**
   * Supprime les anciennes données inutilisées pour libérer de l'espace
   */
  private clearOldData(): void {
    // Supprime les anciennes clés
    this.removeItem(STORAGE_KEYS.LEGACY_CV_DRAFT);
    
    // Peut accueillir d'autres règles de nettoyage
  }

  /**
   * Retourne la taille du stockage en octets
   */
  getStorageSize(): number {
    if (typeof window === 'undefined') return 0;
    
    let total = 0;
    try {
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          total += localStorage[key].length + key.length;
        }
      }
    } catch (error) {
      console.error('Erreur lors du calcul de la taille du stockage :', error);
    }
    return total;
  }

  /**
   * Vérifie si le stockage est disponible
   */
  isAvailable(): boolean {
    if (typeof window === 'undefined') return false;
    
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }
}

export const storage = new StorageService();
export { STORAGE_KEYS };
