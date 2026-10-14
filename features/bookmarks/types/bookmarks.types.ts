export type BookmarksState = {
  productIds: string[];
};

export type BookmarksActions = {
  addBookmark: (productId: string) => void;
  removeBookmark: (productId: string) => void;
  toggleBookmark: (productId: string) => void;
  isBookmarked: (productId: string) => boolean;
  clearBookmarks: () => void;
  pruneMissingBookmarks: (existingIds: string[]) => void;
};

export type BookmarksStore = BookmarksState &
  BookmarksActions & {
    hasHydrated: boolean;
    setHasHydrated: (value: boolean) => void;
  };

export const BOOKMARKS_STORAGE_KEY = "caps-store-bookmarks-v1";
