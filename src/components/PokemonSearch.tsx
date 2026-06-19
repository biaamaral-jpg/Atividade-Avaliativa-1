import React, { useState } from "react";
import {
    Keyboard,
    StyleSheet,
    Text,
    TextInput,
    Image,
    View
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import PokemonRequests from "../services/PokemonRequests";

export default function PokemonSearch() {
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const [pokemon, setPokemon] = useState<{
        pokemon_name: string;
        pokemon_id: number;
        pokemon_image: string;
        types: string[];
        description?: string;
    } | null>(null);


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
                setErrorMsg("Pokémon não encontrado. Verifique o nome ou número.");
            }
        } catch (error) {
            setPokemon(null);
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, padding: 20 }}>
            <View>
                <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 10 }}>PokéSearch 🔍</Text>

                <Text style={{ marginBottom: 20 }}>
                busque um Pokémon pelo nome ou número.
                </Text>

                <TextInput
                    style={styles.input}
                    placeholder="Digite o nome ou ID (ex: bulbasaur ou 1)"
                    placeholderTextColor="#8d8d99"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    autoCapitalize="none"
                    autoCorrect={false}
                    onSubmitEditing={handleSearch}
                />

                {errorMsg ? <Text style={{ color: "red", marginTop: 10 }}>{errorMsg}</Text> : null}

                {pokemon && (
                    <View>
                        <Image
                            source={{ uri: pokemon.pokemon_image }}
                            style={{ width: 150, height: 150 }}
                        />
                        <Text style={{ fontSize: 20, fontWeight: "bold" }}>
                            {pokemon.pokemon_name} (#{pokemon.pokemon_id})
                        </Text>

                        <View style={{ flexDirection: "row", marginTop: 8 }}>
                            {pokemon.types.map((type) => (
                                <View
                                    key={type}
                                    style={{
                                        backgroundColor: TYPE_COLORS[type] || "#777",
                                        paddingVertical: 4,
                                        paddingHorizontal: 10,
                                        borderRadius: 12,
                                        marginRight: 6,
                                    }}
                                >
                                    <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 12 }}>
                                        {type.toUpperCase()}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}


            </View>
        </SafeAreaView >
    );
}

const styles = StyleSheet.create({
    input: {
        backgroundColor: "#ffffff",
        color: "#333033",
        fontSize: 16,
        borderRadius: 6,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#0f0f0f",
    },

});
const TYPE_COLORS: Record<string, string> = {
    normal: "#b5ffbf",
    fire: "#ffafac",
    water: "#92b1f7",
    electric: "#fff1b8",
    grass: "#ffd0fb",
    ice: "#bed8ff",
    fighting: "#ff8d87",
    poison: "#9abdff",
    ground: "#ffe394",
    flying: "#c4b0ff",
    psychic: "#ffaac4",
    bug: "#f6ffa0",
    rock: "#ffadc6",
    ghost: "#b3ddff",
    dragon: "#a2d5ff",
    dark: "#c1bcff",
    steel: "#ffffff",
    fairy: "#ffc5d2",
};