
import React, { useState, useCallback } from 'react';
import { generateRecipe, generateRecipeImage } from './services/geminiService';
import { Recipe } from './types';
import { ChefHatIcon, SpinnerIcon } from './components/icons';

// --- Helper Components (defined outside main App component) ---

const Header: React.FC = () => (
  <header className="bg-white shadow-md p-4 mb-8">
    <div className="container mx-auto flex items-center justify-center space-x-3">
      <ChefHatIcon className="w-8 h-8 text-green-600" />
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight">
        AI Leftover Cookbook
      </h1>
    </div>
  </header>
);

interface IngredientInputProps {
  ingredients: string;
  setIngredients: (value: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
}

const IngredientInput: React.FC<IngredientInputProps> = ({ ingredients, setIngredients, onGenerate, isLoading }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg h-full flex flex-col">
    <h2 className="text-xl font-semibold text-gray-700 mb-4">Your Leftover Ingredients</h2>
    <p className="text-gray-500 mb-4 text-sm">List your ingredients below, separated by commas or on new lines.</p>
    <textarea
      value={ingredients}
      onChange={(e) => setIngredients(e.target.value)}
      placeholder="e.g., chicken breast, tomatoes, rice, onion"
      className="w-full h-48 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-shadow duration-200 resize-none flex-grow"
      disabled={isLoading}
    />
    <button
      onClick={onGenerate}
      disabled={isLoading}
      className="mt-4 w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center transition-colors duration-300 transform hover:scale-105"
    >
      {isLoading ? (
        <>
          <SpinnerIcon className="w-5 h-5 mr-2 animate-spin" />
          Creating...
        </>
      ) : (
        'Generate Recipe'
      )}
    </button>
  </div>
);

interface RecipeDisplayProps {
  recipe: Recipe | null;
  imageUrl: string | null;
  isLoading: boolean;
  error: string | null;
}

const RecipeDisplay: React.FC<RecipeDisplayProps> = ({ recipe, imageUrl, isLoading, error }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg h-full overflow-y-auto min-h-[500px]">
    {isLoading && !recipe && (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <SpinnerIcon className="w-12 h-12 animate-spin text-green-600 mb-4" />
        <p className="text-lg font-semibold">Our AI chef is thinking...</p>
        <p>This may take a moment.</p>
      </div>
    )}
    
    {error && (
      <div className="flex flex-col items-center justify-center h-full text-red-500 bg-red-50 p-4 rounded-lg">
        <h3 className="font-bold text-lg mb-2">Oops! Something went wrong.</h3>
        <p>{error}</p>
      </div>
    )}

    {!isLoading && !recipe && !error && (
      <div className="flex flex-col items-center justify-center h-full text-gray-400 text-center">
          <ChefHatIcon className="w-16 h-16 mb-4"/>
          <h2 className="text-xl font-semibold">Your recipe will appear here</h2>
          <p className="mt-2">Enter some ingredients to get started!</p>
      </div>
    )}
    
    {recipe && (
      <article className="prose max-w-none">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">{recipe.title}</h2>
        <p className="text-gray-600 italic mb-6">{recipe.description}</p>
        
        {isLoading && !imageUrl ? (
           <div className="w-full bg-gray-200 animate-pulse rounded-lg aspect-video mb-6"></div>
        ) : imageUrl ? (
          <img src={imageUrl} alt={recipe.title} className="w-full rounded-lg shadow-md mb-6 object-cover aspect-video" />
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-semibold text-gray-700 mb-3 border-b-2 border-green-200 pb-2">Ingredients</h3>
            <ul className="list-disc pl-5 space-y-1">
              {recipe.ingredients.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-700 mb-3 border-b-2 border-green-200 pb-2">Instructions</h3>
            <ol className="list-decimal pl-5 space-y-2">
              {recipe.instructions.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          </div>
        </div>
      </article>
    )}
  </div>
);


// --- Main App Component ---

const App: React.FC = () => {
  const [ingredients, setIngredients] = useState<string>('');
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateRecipe = useCallback(async () => {
    if (!ingredients.trim()) {
      setError('Please enter some ingredients.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setRecipe(null);
    setImageUrl(null);

    try {
      const newRecipe = await generateRecipe(ingredients);
      setRecipe(newRecipe);

      try {
        const newImageUrl = await generateRecipeImage(newRecipe.title, newRecipe.description);
        setImageUrl(newImageUrl);
      } catch (imageError) {
        console.error(imageError);
        setError("Couldn't generate an image, but here is the recipe!");
      }

    } catch (e) {
      const err = e as Error;
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [ingredients]);

  return (
    <div className="min-h-screen font-sans text-gray-900 bg-slate-50">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <IngredientInput 
            ingredients={ingredients}
            setIngredients={setIngredients}
            onGenerate={handleGenerateRecipe}
            isLoading={isLoading}
          />
          <RecipeDisplay 
            recipe={recipe}
            imageUrl={imageUrl}
            isLoading={isLoading}
            error={error}
          />
        </div>
      </main>
    </div>
  );
};

export default App;
