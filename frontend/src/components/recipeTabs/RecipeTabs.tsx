import { useEffect, useRef, useState } from 'react';
import { Star } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs.tsx';
import RecipeDetailDialog from '@/components/recipeDetailDialog/RecipeDetailDialog.tsx';
import RecipeList from '@/components/recipeList/RecipeList.tsx';
import {
  addFavoriteRecipe,
  getFavoriteRecipesByUserId,
  getRecipes,
  getSelectedRecipe,
  removeFavoriteRecipe,
} from '@/lib/api.ts';
import { PAGE_SIZE } from '@/constants/page.ts';

import type { Page, Recipe, RecipeTab } from '@/types/Recipe.ts';

interface RecipeTabsProps {
  appliedSearch: string;
}

export default function RecipeTabs({ appliedSearch }: RecipeTabsProps) {
  const [activeTab, setActiveTab] = useState<RecipeTab>('all');

  const [page, setPage] = useState(0);
  const [recipesPage, setRecipesPage] = useState<Page<Recipe> | null>(null);
  const [loading, setLoading] = useState(true);

  const [favoritesPageNum, setFavoritesPageNum] = useState(0);
  const [favoritesPage, setFavoritesPage] = useState<Page<Recipe> | null>(null);
  const [loadingFavorites, setLoadingFavorites] = useState(true);

  const [loadingSelectedRecipe, setLoadingSelectedRecipe] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [selectedRecipeId, setSelectedRecipeId] = useState<number | null>(null);

  const recipesRequestId = useRef(0);
  const favoritesRequestId = useRef(0);
  const selectedRecipeRequestId = useRef(0);

  useEffect(() => {
    setPage(0);
    setFavoritesPageNum(0);
  }, [appliedSearch]);

  useEffect(() => {
    const requestId = ++recipesRequestId.current;
    setLoading(true);
    getRecipes({ page, size: PAGE_SIZE, search: appliedSearch })
      .then((data) => {
        if (requestId === recipesRequestId.current) {
          setRecipesPage(data);
        }
      })
      .finally(() => setLoading(false));
  }, [page, appliedSearch]);

  useEffect(() => {
    if (activeTab !== 'favorites') {
      return;
    }
    const requestId = ++favoritesRequestId.current;
    setLoadingFavorites(true);
    getFavoriteRecipesByUserId({ page: favoritesPageNum, size: PAGE_SIZE, search: appliedSearch })
      .then((data) => {
        if (requestId === favoritesRequestId.current) {
          setFavoritesPage(data);
        }
      })
      .finally(() => setLoadingFavorites(false));
  }, [activeTab, favoritesPageNum, appliedSearch]);

  function updateFavorited(recipeId: number, favorited: boolean) {
    const applyToPage = (p: Page<Recipe> | null) =>
      p
        ? {
            ...p,
            content: p.content.map((r) => (r.id === recipeId ? { ...r, favorited } : r)),
          }
        : p;
    setRecipesPage(applyToPage);
    setFavoritesPage(applyToPage);
    setSelectedRecipe((r) => (r && r.id === recipeId ? { ...r, favorited } : r));
  }

  async function handleToggleFavorite(recipe: Recipe) {
    const nextFavorited = !recipe.favorited;
    updateFavorited(recipe.id, nextFavorited);
    try {
      if (nextFavorited) {
        await addFavoriteRecipe(recipe.id);
      } else {
        await removeFavoriteRecipe(recipe.id);
      }
    } catch {
      updateFavorited(recipe.id, recipe.favorited);
    }
  }

  useEffect(() => {
    if (selectedRecipeId === null) {
      return;
    }
    const requestId = ++selectedRecipeRequestId.current;
    setLoadingSelectedRecipe(true);
    getSelectedRecipe({ id: selectedRecipeId })
      .then((data) => {
        if (requestId === selectedRecipeRequestId.current) {
          setSelectedRecipe(data);
        }
      })
      .finally(() => setLoadingSelectedRecipe(false));
  }, [selectedRecipeId]);

  return (
    <>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="favorites">
            <Star />
            Your Favorites
          </TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <RecipeList
            recipesPage={recipesPage}
            loading={loading}
            appliedSearch={appliedSearch}
            onSelectRecipe={setSelectedRecipeId}
            onPageChange={setPage}
            onToggleFavorite={handleToggleFavorite}
            activeTab={activeTab}
          />
        </TabsContent>
        <TabsContent value="favorites">
          <RecipeList
            recipesPage={favoritesPage}
            loading={loadingFavorites}
            appliedSearch={appliedSearch}
            onSelectRecipe={setSelectedRecipeId}
            onPageChange={setFavoritesPageNum}
            onToggleFavorite={handleToggleFavorite}
            activeTab={activeTab}
          />
        </TabsContent>
      </Tabs>

      <RecipeDetailDialog
        open={selectedRecipeId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedRecipeId(null);
          }
        }}
        loading={loadingSelectedRecipe}
        recipe={selectedRecipe}
        onToggleFavorite={handleToggleFavorite}
      />
    </>
  );
}
