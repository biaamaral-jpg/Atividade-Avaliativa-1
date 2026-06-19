import React, { useState } from "react";
import {
    Image,
    Keyboard,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View
} from "react-native";

import { SafeAreaView } from 'react-native-safe-area-context';
import PokemonRequests from "../services/PokemonRequests";

export default function PokemonSearch() {

    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [pokemon, setPokemon] = useState<any>(null);

    const handleSearch = async () => {

        if (!searchQuery.trim()) return;

        setLoading(true);
        setErrorMsg("");
        Keyboard.dismiss();

        try {
            const result = await PokemonRequests.fetchPokemonData(searchQuery);

            if (result) {
                setPokemon(result);
                setSearchQuery("");
            } else {
                setPokemon(null);
                setErrorMsg("Pokémon não encontrado.");
            }

        } catch (error) {
            setPokemon(null);
            setErrorMsg("Erro ao buscar Pokémon.");
        } finally {
            setLoading(false);
        }
    };

    return (

        <SafeAreaView style={styles.container}>

            <Text style={styles.title}>
                PokéSearch
            </Text>

            <Text style={styles.subtitle}>
                 busque um Pokémon pelo nome ou número.
            </Text>

            <TextInput
                style={styles.input}
                placeholder="Nome ou número"
                placeholderTextColor="#888"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
            />

            <Pressable
                style={styles.button}
                onPress={handleSearch}
            >
                <Text style={styles.buttonText}>
                    {loading ? "Buscando..." : "Buscar"}
                </Text>
            </Pressable>

            {errorMsg ? (
                <Text style={styles.error}>{errorMsg}</Text>
            ) : null}

            {pokemon && (
                <View style={styles.card}>

                    <Text style={styles.foundText}>
                        Pokémon encontrado
                    </Text>

                    <Image
                        style={styles.image}
                        source={{ uri: pokemon.pokemon_image }}
                    />

                    <Text style={styles.name}>
                        {pokemon.pokemon_name}
                    </Text>

                    <Text style={styles.id}>
                        ID: #{pokemon.pokemon_id}
                    </Text>

                    <Text style={styles.typeLabel}>
                        Tipo:
                    </Text>

                    <View style={styles.typesContainer}>
                        {pokemon.types.map((type: string, index: number) => (
                            <View key={index} style={styles.typeBadge}>
                                <Text style={styles.typeText}>
                                    {type}
                                </Text>
                            </View>
                        ))}
                    </View>

                    <Text style={styles.description}>
                        {pokemon.description}
                    </Text>

                </View>
            )}

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: "#f0f4ff",
        padding: 20
    },

    title: {
        fontSize: 34,
        fontWeight: "900",
        textAlign: "center",
        color: "rgb(202, 227, 255)",
        marginTop: 10
    },

    subtitle: {
        textAlign: "center",
        color: "#666",
        marginBottom: 20
    },

    input: {
        backgroundColor: "#fff",
        borderWidth: 2,
        borderColor: "#b6ceff",
        borderRadius: 12,
        padding: 12
    },

    button: {
        backgroundColor: "#82acff",
        padding: 14,
        borderRadius: 12,
        marginTop: 10,
        alignItems: "center"
    },

    buttonText: {
        color: "rgb(255, 255, 255)",
        fontWeight: "bold"
    },

    error: {
        color: "#000000",
        textAlign: "center",
        marginTop: 10
    },

    card: {
        marginTop: 20,
        backgroundColor: "#a5c3e6ff",
        borderRadius: 20,
        padding: 22,
        alignItems: "center",
        borderWidth: 10,
        borderColor: "#ffffff"
    },

    foundText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "rgb(3, 3, 3)",
        marginBottom: 10
    },

    image: {
        width: 160,
        height: 160,
        borderWidth: 5,
        borderColor: "#ffffff",
        borderRadius: 15,
        marginBottom: 10
    },

    name: {
        fontSize: 28,
        fontWeight: "bold",
        textTransform: "capitalize"
    },

    id: {
        fontSize: 14,
        color: "#666",
        marginBottom: 10
    },

    typeLabel: {
        fontSize: 14,
        fontWeight: "bold",
        marginBottom: 5,
        color: "#333"
    },

    typesContainer: {
        flexDirection: "row",
        gap: 8,
        marginBottom: 10
    },

    typeBadge: {
        backgroundColor: "#000000",
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 20
    },

    typeText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "bold"
    },

    description: {
        textAlign: "center",
        color: "#444",
        marginTop: 10
    }

});