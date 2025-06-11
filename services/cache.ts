
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresIn: number;
}

// Storage abstraction
const secureStoreOrLocalStorage = {
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    return SecureStore.getItemAsync(key);
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
      return;
    }
    return SecureStore.setItemAsync(key, value);
  },
  deleteItem: async (key: string): Promise<void> => {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
      return;
    }
    return SecureStore.deleteItemAsync(key);
  }
};

class CacheService {
  private prefix = 'church_app_cache_';

  /**
   * Armazena dados no cache com tempo de expiração
   */
  async set<T>(key: string, data: T, expiresInMinutes: number = 30): Promise<void> {
    try {
      const cacheItem: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        expiresIn: expiresInMinutes * 60 * 1000 // Converte para millisegundos
      };

      await secureStoreOrLocalStorage.setItem(
        `${this.prefix}${key}`,
        JSON.stringify(cacheItem)
      );
    } catch (error) {
      console.error('Erro ao salvar no cache:', error);
    }
  }

  /**
   * Recupera dados do cache se ainda forem válidos
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const cached = await secureStoreOrLocalStorage.getItem(`${this.prefix}${key}`);
      
      if (!cached) {
        return null;
      }

      const cacheItem: CacheItem<T> = JSON.parse(cached);
      const now = Date.now();
      
      // Verifica se o cache ainda é válido
      if (now - cacheItem.timestamp > cacheItem.expiresIn) {
        // Cache expirado, remove
        await this.delete(key);
        return null;
      }

      return cacheItem.data;
    } catch (error) {
      console.error('Erro ao recuperar do cache:', error);
      return null;
    }
  }

  /**
   * Remove item específico do cache
   */
  async delete(key: string): Promise<void> {
    try {
      await secureStoreOrLocalStorage.deleteItem(`${this.prefix}${key}`);
    } catch (error) {
      console.error('Erro ao deletar do cache:', error);
    }
  }

  /**
   * Limpa todo o cache da aplicação
   */
  async clear(): Promise<void> {
    try {
      // Esta é uma implementação simplificada
      // Em um ambiente de produção, você poderia listar todas as chaves e remover apenas as do cache
      const keys = [
        'dashboard_data',
        'member_profile',
        'events_upcoming',
        'events_past',
        'events_all',
        'notices_all',
        'notices_important',
        'notices_regular',
        'donations',
        'church_finances',
        'birthdays'
      ];

      for (const key of keys) {
        await this.delete(key);
      }
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
    }
  }

  /**
   * Função helper para buscar dados com cache automático
   */
  async getOrFetch<T>(
    key: string,
    fetchFunction: () => Promise<T>,
    expiresInMinutes: number = 30
  ): Promise<T> {
    // Tenta buscar do cache primeiro
    const cached = await this.get<T>(key);
    if (cached !== null) {
      console.log(`Dados encontrados no cache para: ${key}`);
      return cached;
    }

    // Se não estiver em cache, busca dos dados originais
    console.log(`Cache miss para: ${key}, buscando dados...`);
    const data = await fetchFunction();
    
    // Salva no cache para próximas consultas
    await this.set(key, data, expiresInMinutes);
    
    return data;
  }
}

export const cacheService = new CacheService();
