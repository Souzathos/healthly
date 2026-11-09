// Tipos de dieta que um post pode marcar (RF18)
export const DIETS = ['low_carb', 'vegetarian', 'vegan', 'keto', 'gluten_free', 'high_protein'] as const

export type Diet = typeof DIETS[number]
