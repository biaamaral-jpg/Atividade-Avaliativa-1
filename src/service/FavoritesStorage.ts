import { Platform } from "react-native";
import * as FileSystem from "expo-file-system/legacy";

const FAVORITES_FILE = `${FileSystem.documentDirectory}favoritos.json`;
const WEB_STORAGE_KEY = "pokeapp_favoritos";

interface FavoritesFile {
    favoritos: number[];
}

function normalizarFavoritos(data: unknown): number[] {
    if (!data || typeof data !== "object" || !("favoritos" in data)) {
        return [];
    }

    const favoritos = (data as FavoritesFile).favoritos;

    if (!Array.isArray(favoritos)) {
        return [];
    }

    return [...new Set(
        favoritos
            .map(Number)
            .filter((id) => Number.isInteger(id) && id > 0)
    )];
}

function lerFavoritosWeb(): number[] {
    if (typeof localStorage === "undefined") {
        return [];
    }

    try {
        const content = localStorage.getItem(WEB_STORAGE_KEY);

        if (!content) {
            return [];
        }

        return normalizarFavoritos(JSON.parse(content));
    } catch (error) {
        console.error("Erro ao ler favoritos no Web:", error);
        return [];
    }
}

function salvarFavoritosWeb(favoritos: number[]) {
    if (typeof localStorage === "undefined") {
        return;
    }

    const data: FavoritesFile = {
        favoritos: normalizarFavoritos({ favoritos }),
    };

    localStorage.setItem(WEB_STORAGE_KEY, JSON.stringify(data, null, 2));
}

async function garantirArquivoNativo() {
    const info = await FileSystem.getInfoAsync(FAVORITES_FILE);

    if (!info.exists) {
        const initialData: FavoritesFile = {
            favoritos: [],
        };

        await FileSystem.writeAsStringAsync(
            FAVORITES_FILE,
            JSON.stringify(initialData, null, 2)
        );
    }
}

async function lerFavoritosNativo(): Promise<number[]> {
    await garantirArquivoNativo();

    try {
        const content = await FileSystem.readAsStringAsync(FAVORITES_FILE);
        return normalizarFavoritos(JSON.parse(content));
    } catch (error) {
        console.error("Erro ao ler favoritos.json:", error);
        return [];
    }
}

async function salvarFavoritosNativo(favoritos: number[]) {
    const data: FavoritesFile = {
        favoritos: normalizarFavoritos({ favoritos }),
    };

    await FileSystem.writeAsStringAsync(
        FAVORITES_FILE,
        JSON.stringify(data, null, 2)
    );
}

export async function buscarFavoritos(): Promise<number[]> {
    if (Platform.OS === "web") {
        return lerFavoritosWeb();
    }

    return lerFavoritosNativo();
}

export async function ehFavorito(id: number): Promise<boolean> {
    const favoritos = await buscarFavoritos();
    return favoritos.includes(id);
}

export async function adicionarFavorito(id: number): Promise<void> {
    const favoritos = await buscarFavoritos();

    if (favoritos.includes(id)) {
        return;
    }

    const novosFavoritos = [...favoritos, id];

    if (Platform.OS === "web") {
        salvarFavoritosWeb(novosFavoritos);
    } else {
        await salvarFavoritosNativo(novosFavoritos);
    }
}

export async function removerFavorito(id: number): Promise<void> {
    const favoritos = await buscarFavoritos();
    const novosFavoritos = favoritos.filter((favoritoId) => favoritoId !== id);

    if (Platform.OS === "web") {
        salvarFavoritosWeb(novosFavoritos);
    } else {
        await salvarFavoritosNativo(novosFavoritos);
    }
}

export async function alternarFavorito(id: number): Promise<boolean> {
    const favorito = await ehFavorito(id);

    if (favorito) {
        await removerFavorito(id);
        return false;
    }

    await adicionarFavorito(id);
    return true;
}