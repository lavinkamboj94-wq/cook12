
import { GoogleGenAI, Type, Modality } from '@google/genai';
import { Recipe } from '../types';

// Assumes API_KEY is set in the environment
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const recipeSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: 'The title of the recipe.' },
    description: { type: Type.STRING, description: 'A short, enticing description of the dish.' },
    ingredients: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'The list of ingredients, including quantities.'
    },
    instructions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'The step-by-step instructions for preparing the dish.'
    },
  },
  required: ['title', 'description', 'ingredients', 'instructions'],
};

export async function generateRecipe(ingredients: string): Promise<Recipe> {
  const prompt = `You are a creative chef specializing in using leftover ingredients. Based on the following ingredients, create a delicious recipe.

Ingredients:
${ingredients}

Provide the response in the specified JSON format. Ensure the recipe is creative, easy to follow, and primarily uses the ingredients provided. You can assume basic pantry staples like salt, pepper, oil, and water are available.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: recipeSchema,
      },
    });

    const jsonText = response.text.trim();
    const recipeData = JSON.parse(jsonText);
    
    if (
      !recipeData.title || 
      !recipeData.description || 
      !Array.isArray(recipeData.ingredients) || 
      !Array.isArray(recipeData.instructions)
    ) {
      throw new Error("AI response did not match the expected format.");
    }

    return recipeData as Recipe;
  } catch (error) {
    console.error("Error generating recipe:", error);
    throw new Error("Failed to generate recipe. The AI might be busy, or the ingredients might be too unusual. Please try again.");
  }
}

export async function generateRecipeImage(recipeTitle: string, recipeDescription: string): Promise<string> {
  const prompt = `A delicious, professionally photographed image of "${recipeTitle}". ${recipeDescription}. Realistic, vibrant colors, mouth-watering, food photography style.`;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [{ text: prompt }],
        },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
            const base64ImageBytes: string = part.inlineData.data;
            return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
        }
    }
    throw new Error("No image was generated.");
  } catch (error) {
      console.error("Error generating recipe image:", error);
      throw new Error("Failed to generate an image for the recipe.");
  }
}
