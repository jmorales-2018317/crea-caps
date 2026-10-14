import {
  CATALOG_IMAGES_BUCKET,
  buildStoreLogoPath,
  validateImageFile,
} from "@/lib/catalog-images";
import { parseStoreContacts } from "@/lib/store-contacts";
import { createClient as createBrowserClient } from "@/lib/supabase/client";
import type {
  StoreSettingsPublic,
  StoreSettingsUpdate,
} from "@/types/store-settings";

const STORE_SETTINGS_ID = 1;

const STORE_SETTINGS_COLUMNS =
  "store_name, description, logo_path, contacts" as const;

type StoreSettingsRow = {
  store_name: string;
  description: string | null;
  logo_path: string | null;
  contacts: unknown;
};

function mapStoreSettings(row: StoreSettingsRow): StoreSettingsPublic {
  return {
    store_name: row.store_name,
    description: row.description,
    logo_path: row.logo_path,
    contacts: parseStoreContacts(row.contacts),
  };
}

async function removeStoragePaths(
  client: ReturnType<typeof createBrowserClient>,
  paths: string[],
): Promise<void> {
  const unique = [...new Set(paths.filter((path) => path.trim().length > 0))];
  if (unique.length === 0) {
    return;
  }

  const { error } = await client.storage
    .from(CATALOG_IMAGES_BUCKET)
    .remove(unique);

  if (error) {
    throw error;
  }
}

async function selectStoreSettings(
  client: ReturnType<typeof createBrowserClient>,
): Promise<StoreSettingsPublic | null> {
  const { data, error } = await client
    .from("store_settings")
    .select(STORE_SETTINGS_COLUMNS)
    .eq("id", STORE_SETTINGS_ID)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? mapStoreSettings(data) : null;
}

/** Browser read for the dashboard configuration form. */
export async function getStoreSettingsClient(): Promise<StoreSettingsPublic | null> {
  return selectStoreSettings(createBrowserClient());
}

export async function updateStoreSettings(
  input: StoreSettingsUpdate,
): Promise<StoreSettingsPublic> {
  const client = createBrowserClient();

  const { data, error } = await client
    .from("store_settings")
    .update(input)
    .eq("id", STORE_SETTINGS_ID)
    .select(STORE_SETTINGS_COLUMNS)
    .single();

  if (error) {
    throw error;
  }

  return mapStoreSettings(data);
}

export type SaveStoreSettingsInput = {
  fields: Omit<StoreSettingsUpdate, "logo_path">;
  /** New logo file to upload. Mutually exclusive with `clearLogo`. */
  logoFile?: File | null;
  /** When true, clears `logo_path` and removes the previous object. */
  clearLogo?: boolean;
};

export async function saveStoreSettings(
  input: SaveStoreSettingsInput,
): Promise<StoreSettingsPublic> {
  const client = createBrowserClient();
  const current = await selectStoreSettings(client);
  const previousLogoPath = current?.logo_path ?? null;

  let nextLogoPath: string | null | undefined;

  if (input.clearLogo) {
    nextLogoPath = null;
  } else if (input.logoFile) {
    const validationError = validateImageFile(input.logoFile);
    if (validationError) {
      throw new Error(validationError);
    }

    const path = buildStoreLogoPath(input.logoFile);
    const { error: uploadError } = await client.storage
      .from(CATALOG_IMAGES_BUCKET)
      .upload(path, input.logoFile, {
        contentType: input.logoFile.type,
        upsert: false,
        cacheControl: "3600",
      });

    if (uploadError) {
      throw uploadError;
    }

    nextLogoPath = path;
  }

  const payload: StoreSettingsUpdate = {
    ...input.fields,
  };

  if (nextLogoPath !== undefined) {
    payload.logo_path = nextLogoPath;
  }

  try {
    const updated = await updateStoreSettings(payload);

    if (
      previousLogoPath &&
      nextLogoPath !== undefined &&
      previousLogoPath !== nextLogoPath
    ) {
      try {
        await removeStoragePaths(client, [previousLogoPath]);
      } catch {
        // Best-effort cleanup; the DB row already points at the new logo.
      }
    }

    return updated;
  } catch (error) {
    if (nextLogoPath && nextLogoPath !== previousLogoPath) {
      try {
        await removeStoragePaths(client, [nextLogoPath]);
      } catch {
        // Ignore cleanup failures after a failed update.
      }
    }
    throw error;
  }
}
