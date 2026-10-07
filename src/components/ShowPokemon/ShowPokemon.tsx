import Pokemon from "@/src/interface/Pokemon";
import { Image } from "expo-image";
import { Pressable, ScrollView, Text, View } from "react-native";

interface ShowPokemonProps {
    pokemon: Pokemon;
    isFavorite?: boolean;
    onToggleFavorite?: () => void;
}

const formatName = (name: string) =>
    name
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

const getTypeColor = (type?: string) => {
    const palette: Record<string, string> = {
        normal: '#A8A878',
        fire: '#F08030',
        water: '#6890F0',
        electric: '#F8D030',
        grass: '#78C850',
        ice: '#98D8D8',
        fighting: '#C03028',
        poison: '#A040A0',
        ground: '#E0C068',
        flying: '#A890F0',
        psychic: '#F85888',
        bug: '#A8B820',
        rock: '#B8A038',
        ghost: '#705898',
        dragon: '#7038F8',
        dark: '#705848',
        steel: '#B8B8D0',
        fairy: '#EE99AC',
    };

    return palette[type ?? 'normal'] ?? '#A8A878';
};

export default function ShowPokemon({ pokemon, isFavorite = false, onToggleFavorite }: ShowPokemonProps) {
    const types = pokemon.types ? [pokemon.types.type1, pokemon.types.type2].filter(Boolean) : [];

    return (
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
            <View style={{ alignItems: 'center', marginBottom: 12 }}>
                <Pressable
                    onPress={onToggleFavorite}
                    style={{
                        backgroundColor: isFavorite ? '#FFE5E5' : '#FFF5F5',
                        borderWidth: 1,
                        borderColor: isFavorite ? '#F87171' : '#FECACA',
                        borderRadius: 999,
                        paddingHorizontal: 18,
                        paddingVertical: 10,
                        alignSelf: 'center',
                    }}
                >
                    <Text style={{ color: isFavorite ? '#B91C1C' : '#E53E3E', fontWeight: '700' }}>
                        {isFavorite ? '♥ Favorito' : '♡ Adicionar aos favoritos'}
                    </Text>
                </Pressable>
            </View>

            <Text style={{ fontSize: 28, fontWeight: '800', textAlign: 'center', color: '#1A202C' }}>
                {formatName(pokemon.pokemon_name)}
            </Text>
            <Text style={{ fontSize: 16, color: '#718096', textAlign: 'center', marginBottom: 16 }}>
                Pokédex #{pokemon.pokemon_id}
            </Text>

            <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 12 }}>
                {pokemon.pokemon_image ? (
                    <Image
                        source={{ uri: pokemon.pokemon_image }}
                        style={{ width: 220, height: 220 }}
                        contentFit="contain"
                        transition={200}
                    />
                ) : (
                    <View style={{ width: 180, height: 180, backgroundColor: '#E2E8F0', borderRadius: 90 }} />
                )}
            </View>

            {types.length > 0 && (
                <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
                    {types.map((type) => (
                        <View
                            key={type}
                            style={{
                                paddingHorizontal: 14,
                                paddingVertical: 8,
                                borderRadius: 999,
                                backgroundColor: getTypeColor(type),
                                marginHorizontal: 6,
                                marginBottom: 8,
                            }}
                        >
                            <Text style={{ color: '#FFF', fontWeight: '700', textTransform: 'capitalize' }}>{type}</Text>
                        </View>
                    ))}
                </View>
            )}

            <View
                style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 18,
                    padding: 18,
                    marginBottom: 18,
                    boxShadow: '0px 2px 8px rgba(0,0,0,0.08)',
                    elevation: 3,
                }}
            >
                <Text style={{ fontSize: 18, fontWeight: '700', color: '#2D3748', marginBottom: 10 }}>Descrição</Text>
                <Text style={{ fontSize: 15, lineHeight: 22, color: '#4A5568' }}>
                    {pokemon.description || 'Sem descrição disponível para este Pokémon.'}
                </Text>
            </View>

            <View
                style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 18,
                    padding: 18,
                    marginBottom: 18,
                    boxShadow: '0px 2px 8px rgba(0,0,0,0.08)',
                    elevation: 3,
                }}
            >
                <Text style={{ fontSize: 18, fontWeight: '700', color: '#2D3748', marginBottom: 12 }}>Informações</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text style={{ color: '#718096' }}>Altura</Text>
                    <Text style={{ fontWeight: '600', color: '#2D3748' }}>{pokemon.height ? `${(pokemon.height / 10).toFixed(1)} m` : 'N/A'}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text style={{ color: '#718096' }}>Peso</Text>
                    <Text style={{ fontWeight: '600', color: '#2D3748' }}>{pokemon.weight ? `${(pokemon.weight / 10).toFixed(1)} kg` : 'N/A'}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text style={{ color: '#718096' }}>Tipos</Text>
                    <Text style={{ fontWeight: '600', color: '#2D3748' }}>
                        {types.length ? types.join(', ') : 'N/A'}
                    </Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ color: '#718096' }}>Habilidades</Text>
                    <Text style={{ fontWeight: '600', color: '#2D3748', textAlign: 'right', flex: 1, marginLeft: 12 }}>
                        {pokemon.abilities && pokemon.abilities.length ? pokemon.abilities.join(', ') : 'N/A'}
                    </Text>
                </View>
            </View>

            <View
                style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 18,
                    padding: 18,
                    boxShadow: '0px 2px 8px rgba(0,0,0,0.08)',
                    elevation: 3,
                }}
            >
                <Text style={{ fontSize: 18, fontWeight: '700', color: '#2D3748', marginBottom: 12 }}>Status</Text>
                {pokemon.stats && pokemon.stats.length ? (
                    pokemon.stats.map((stat) => (
                        <View key={stat.name} style={{ marginBottom: 10 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                                <Text style={{ fontSize: 13, color: '#4A5568', textTransform: 'capitalize' }}>{stat.name}</Text>
                                <Text style={{ fontSize: 13, fontWeight: '700', color: '#2D3748' }}>{stat.value}</Text>
                            </View>
                            <View style={{ height: 8, backgroundColor: '#EDF2F7', borderRadius: 999 }}>
                                <View
                                    style={{
                                        width: `${Math.min(stat.value, 100)}%`,
                                        height: 8,
                                        backgroundColor: stat.value > 70 ? '#48BB78' : '#F6AD55',
                                        borderRadius: 999,
                                    }}
                                />
                            </View>
                        </View>
                    ))
                ) : (
                    <Text style={{ color: '#718096' }}>Sem status disponível.</Text>
                )}
            </View>
        </ScrollView>
    );
}