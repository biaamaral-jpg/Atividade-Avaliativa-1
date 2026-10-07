import { Image } from "expo-image";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import Pokemon from "../interface/Pokemon";
import { buscarFavoritos, removerFavorito } from "../service/FavoritesStorage";
import Requests from "../service/PokemonsRequests";

export default function Favorites() {
    const [pokemons, setPokemons] = useState<Pokemon[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadFavorites = useCallback(async () => {
        try {
            setIsLoading(true);

            const ids = await buscarFavoritos();

            if (ids.length === 0) {
                setPokemons([]);
                return;
            }

            const results = await Promise.all(
                ids.map(async (id) => {
                    const data = await Requests.fetchPokemonData(String(id));

                    if (!data || !data.pokemon_info) {
                        return null;
                    }

                    return {
                        pokemon_name: data.pokemon_info.name,
                        pokemon_image: data.pokemon_image,
                        pokemon_id: data.pokemon_id,
                    } as Pokemon;
                })
            );

            setPokemons(results.filter((pokemon): pokemon is Pokemon => pokemon !== null));
        } catch (error) {
            console.error("Erro ao carregar favoritos:", error);
            setPokemons([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleRemoveFavorite = async (pokemonId?: number) => {
        if (!pokemonId) return;

        await removerFavorito(pokemonId);
        setPokemons((prev) => prev.filter((pokemon) => pokemon.pokemon_id !== pokemonId));
    };

    useFocusEffect(
        useCallback(() => {
            loadFavorites();
        }, [loadFavorites])
    );

    const formatName = (name: string) => {
        return name
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    };

    const formatId = (id?: number) => {
        if (!id) return "";
        return `#${String(id).padStart(3, "0")}`;
    };

    if (isLoading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#FF3E3E" />
                <Text style={styles.loadingText}>Carregando favoritos...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Favoritos</Text>
                <Text style={styles.headerSubtitle}>
                    {pokemons.length} Pokémon{pokemons.length === 1 ? "" : "s"} salvo{pokemons.length === 1 ? "" : "s"}
                </Text>
            </View>

            {pokemons.length === 0 ? (
                <View style={styles.center}>
                    <Text style={styles.emptyIcon}>♡</Text>
                    <Text style={styles.emptyTitle}>Nenhum favorito</Text>
                    <Text style={styles.emptyText}>
                        Abra um Pokémon e toque no coração para adicioná-lo aos favoritos.
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={pokemons}
                    keyExtractor={(item) => String(item.pokemon_id)}
                    numColumns={2}
                    showsVerticalScrollIndicator={false}
                    columnWrapperStyle={styles.row}
                    contentContainerStyle={styles.listContent}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <Pressable
                                style={styles.cardPressable}
                                onPress={() =>
                                    item.pokemon_id && router.push(`/pokemon/${item.pokemon_id}` as any)
                                }
                            >
                                <View style={styles.idBadge}>
                                    <Text style={styles.idText}>{formatId(item.pokemon_id)}</Text>
                                </View>

                                <View style={styles.imageContainer}>
                                    <Image
                                        source={{ uri: item.pokemon_image }}
                                        style={styles.pokemonImage}
                                        contentFit="contain"
                                    />
                                </View>

                                <Text style={styles.pokemonName}>
                                    {formatName(item.pokemon_name)}
                                </Text>
                            </Pressable>

                            <Pressable
                                style={styles.removeButton}
                                onPress={() => handleRemoveFavorite(item.pokemon_id)}
                            >
                                <Text style={styles.removeButtonText}>Remover favorito</Text>
                            </Pressable>
                        </View>
                    )}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F7FAFC",
    },
    header: {
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 16,
        backgroundColor: "#FFFFFF",
        borderBottomWidth: 1,
        borderBottomColor: "#EDF2F7",
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: "800",
        color: "#2D3748",
    },
    headerSubtitle: {
        marginTop: 4,
        fontSize: 14,
        color: "#718096",
    },
    listContent: {
        padding: 12,
        paddingBottom: 40,
    },
    row: {
        justifyContent: "space-between",
    },
    card: {
        backgroundColor: "#FFFFFF",
        flex: 1,
        margin: 6,
        borderRadius: 16,
        padding: 16,
        alignItems: "center",
        shadowColor: "#1A202C",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 12,
        elevation: 3,
        borderWidth: 1,
        borderColor: "#EDF2F7",
    },
    cardPressable: {
        width: "100%",
        alignItems: "center",
    },
    idBadge: {
        position: "absolute",
        top: 10,
        right: 10,
        backgroundColor: "#EDF2F7",
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 20,
    },
    idText: {
        fontSize: 11,
        fontWeight: "700",
        color: "#718096",
    },
    imageContainer: {
        width: 90,
        height: 90,
        marginTop: 10,
        marginBottom: 8,
    },
    pokemonImage: {
        width: "100%",
        height: "100%",
    },
    pokemonName: {
        fontSize: 15,
        fontWeight: "600",
        color: "#2D3748",
        textAlign: "center",
    },
    removeButton: {
        marginTop: 12,
        backgroundColor: "#FFF1F2",
        borderWidth: 1,
        borderColor: "#FCA5A5",
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 7,
    },
    removeButtonText: {
        color: "#BE123C",
        fontSize: 11,
        fontWeight: "700",
    },
    center: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#F7FAFC",
        padding: 30,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: "#718096",
        fontWeight: "500",
    },
    emptyIcon: {
        fontSize: 64,
        color: "#CBD5E0",
        marginBottom: 8,
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: "700",
        color: "#2D3748",
    },
    emptyText: {
        marginTop: 8,
        fontSize: 15,
        color: "#718096",
        textAlign: "center",
        lineHeight: 22,
    },
});