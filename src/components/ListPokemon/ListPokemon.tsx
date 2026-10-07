import { Image } from "expo-image";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View
} from "react-native";
import Pokemon from "../../interface/Pokemon";
import { alternarFavorito, buscarFavoritos } from "../../service/FavoritesStorage";
import Requests from "../../service/PokemonsRequests";

export default function ListPokemon() {
    const [pokemons, setPokemons] = useState<Pokemon[]>([]);
    const [filteredPokemons, setFilteredPokemons] = useState<Pokemon[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingSearch, setIsLoadingSearch] = useState(false);
    const [isMoreLoading, setIsMoreLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const loadFavoriteIds = async () => {
        const ids = await buscarFavoritos();
        setFavoriteIds(ids);
    };

    const handleFetchPokemon = async (currentOffset: number, append = false) => {
        try {
            if (append) {
                setIsMoreLoading(true);
            } else {
                setIsLoading(true);
            }

            const data = await Requests.fetchPokemonList(currentOffset, 20);
            if (data) {
                if (data.length < 20) {
                    setHasMore(false);
                }

                if (append) {
                    setPokemons((prev) => {
                        const newPokemons = [...prev, ...data];
                        setFilteredPokemons(newPokemons);
                        return newPokemons;
                    });
                } else {
                    setPokemons(data);
                    setFilteredPokemons(data);
                }
            }
        } catch (error) {
            console.error("Failed to fetch pokemons:", error);
        } finally {
            setIsLoading(false);
            setIsMoreLoading(false);
        }
    };

    useEffect(() => {
        loadFavoriteIds();
        handleFetchPokemon(0, false);
    }, []);

    const handleLoadMore = () => {
        if (isLoading || isMoreLoading || !hasMore || searchQuery.trim() !== "") {
            return;
        }
        handleFetchPokemon(pokemons.length, true);
    };

    const handleTextChange = (text: string) => {
        setSearchQuery(text);
        if (!text.trim()) {
            setFilteredPokemons(pokemons);
        }
    };

    const handleSearchSubmit = async () => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) {
            setFilteredPokemons(pokemons);
            return;
        }

        try {
            setIsLoadingSearch(true);
            const data = await Requests.fetchPokemonData(query);
            if (data && data.pokemon_info && data.pokemon_info.name) {
                const singlePokemon: Pokemon = {
                    pokemon_name: data.pokemon_info.name,
                    pokemon_id: data.pokemon_id,
                    pokemon_image: data.pokemon_image,
                };
                setFilteredPokemons([singlePokemon]);
            } else {
                setFilteredPokemons([]);
            }
        } catch (error) {
            console.error("Error searching pokemon:", error);
            setFilteredPokemons([]);
        } finally {
            setIsLoadingSearch(false);
        }
    };

    const handleToggleFavorite = async (pokemonId?: number) => {
        if (!pokemonId) {
            return;
        }

        const wasFavorite = favoriteIds.includes(pokemonId);
        await alternarFavorito(pokemonId);

        setFavoriteIds((prev) => {
            if (wasFavorite) {
                return prev.filter((id) => id !== pokemonId);
            }

            return [...prev, pokemonId];
        });
    };

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

    const renderFooter = () => {
        if (!isMoreLoading) return null;
        return (
            <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color="#FF3E3E" />
            </View>
        );
    };

    if (isLoading && pokemons.length === 0) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#FF3E3E" />
                <Text style={styles.loadingText}>Carregando Pokémons...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Cabecalho e Pesquisa */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Pokédex</Text>
                <TextInput
                    placeholder="Pesquisar por nome ou ID..."
                    placeholderTextColor="#A0AEC0"
                    style={styles.searchBar}
                    value={searchQuery}
                    onChangeText={handleTextChange}
                    onSubmitEditing={handleSearchSubmit}
                    returnKeyType="search"
                    autoCapitalize="none"
                    autoCorrect={false}
                    clearButtonMode="while-editing"
                />
            </View>

            {isLoadingSearch ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#FF3E3E" />
                    <Text style={styles.loadingText}>Buscando Pokémon...</Text>
                </View>
            ) : filteredPokemons.length === 0 ? (
                <View style={styles.center}>
                    <Text style={styles.noResultsText}>Nenhum Pokémon encontrado</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredPokemons}
                    keyExtractor={(item) => item.pokemon_name}
                    numColumns={2}
                    showsVerticalScrollIndicator={false}
                    columnWrapperStyle={styles.row}
                    contentContainerStyle={styles.listContent}
                    renderItem={({ item }) => {
                        const isFavorite = !!item.pokemon_id && favoriteIds.includes(item.pokemon_id);

                        return (
                            <Pressable
                                style={styles.card}
                                onPress={() => item.pokemon_id && router.push(`/pokemon/${item.pokemon_id}` as any)}
                            >
                                {/* ID Badge */}
                                <View style={styles.idBadge}>
                                    <Text style={styles.idText}>{formatId(item.pokemon_id)}</Text>
                                </View>

                                {/* Sprite */}
                                <View style={styles.imageContainer}>
                                    {item.pokemon_image ? (
                                        <Image
                                            source={{ uri: item.pokemon_image }}
                                            style={styles.pokemonImage}
                                            contentFit="contain"
                                            transition={300}
                                        />
                                    ) : (
                                        <View style={styles.imagePlaceholder} />
                                    )}
                                </View>

                                {/* Name */}
                                <View style={styles.infoContainer}>
                                    <Text style={styles.pokemonName}>
                                        {formatName(item.pokemon_name)}
                                    </Text>
                                </View>

                                {/* Favorite Button */}
                                <Pressable
                                    style={[styles.favoriteButton, isFavorite && styles.favoriteButtonActive]}
                                    onPress={(event: any) => {
                                        event?.stopPropagation?.();
                                        handleToggleFavorite(item.pokemon_id);
                                    }}
                                >
                                    <Text style={[styles.favoriteButtonText, isFavorite && styles.favoriteButtonTextActive]}>
                                        {isFavorite ? "♥ Favorito" : "♡ Favoritar"}
                                    </Text>
                                </Pressable>
                            </Pressable>
                        );
                    }}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={renderFooter}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F7FAFC",
        width: "100%",
    },
    center: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#F7FAFC",
        padding: 20,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: "#718096",
        fontWeight: "500",
    },
    noResultsText: {
        fontSize: 16,
        color: "#A0AEC0",
        fontWeight: "500",
    },
    header: {
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 16,
        backgroundColor: "#FFFFFF",
        borderBottomWidth: 1,
        borderBottomColor: "#EDF2F7",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 10,
        elevation: 2,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: "800",
        color: "#2D3748",
        marginBottom: 12,
        letterSpacing: -0.5,
    },
    searchBar: {
        height: 46,
        backgroundColor: "#EDF2F7",
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 15,
        color: "#2D3748",
        fontWeight: "500",
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
        position: "relative",
        // Soft elegant shadow
        shadowColor: "#1A202C",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 12,
        elevation: 3,
        borderWidth: 1,
        borderColor: "#EDF2F7",
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
        alignItems: "center",
        justifyContent: "center",
    },
    pokemonImage: {
        width: "100%",
        height: "100%",
    },
    imagePlaceholder: {
        width: 60,
        height: 60,
        backgroundColor: "#E2E8F0",
        borderRadius: 30,
    },
    infoContainer: {
        alignItems: "center",
        marginTop: 4,
    },
    pokemonName: {
        fontSize: 15,
        fontWeight: "600",
        color: "#2D3748",
        textAlign: "center",
    },
    favoriteButton: {
        marginTop: 12,
        backgroundColor: "#FFF5F5",
        borderWidth: 1,
        borderColor: "#FECACA",
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    favoriteButtonActive: {
        backgroundColor: "#FFE5E5",
        borderColor: "#F87171",
    },
    favoriteButtonText: {
        color: "#E53E3E",
        fontSize: 11,
        fontWeight: "700",
    },
    favoriteButtonTextActive: {
        color: "#B91C1C",
    },
    footerLoader: {
        paddingVertical: 20,
        alignItems: "center",
        justifyContent: "center",
    },
});