CREATE TABLE IF NOT EXISTS recipe_categories (
  id TEXT PRIMARY KEY NOT NULL,
  recipe_id TEXT NOT NULL,
  name TEXT NOT NULL,
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_recipe_categories_unique ON recipe_categories(recipe_id, name);
