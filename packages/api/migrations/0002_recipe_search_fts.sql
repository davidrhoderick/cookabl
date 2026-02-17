-- Create FTS5 virtual table for recipe search with group metadata
CREATE VIRTUAL TABLE IF NOT EXISTS recipe_search_fts USING fts5(
  recipe_id UNINDEXED,
  name,
  description,
  ingredients,
  instructions,
  categories,
  group_ids UNINDEXED,
  content='recipe_search_fts',
  content_rowid='rowid'
);

-- Create triggers to keep the search index updated
-- Insert trigger
CREATE TRIGGER IF NOT EXISTS recipe_search_fts_insert AFTER INSERT ON recipes
BEGIN
  INSERT INTO recipe_search_fts (
    recipe_id,
    name,
    description,
    ingredients,
    instructions,
    categories,
    group_ids
  )
  SELECT 
    NEW.id,
    NEW.name,
    NEW.description,
    -- Concatenate all ingredient names
    COALESCE(
      (SELECT GROUP_CONCAT(name, ' ') 
       FROM recipe_ingredients 
       WHERE recipe_id = NEW.id 
       ORDER BY name), 
      ''
    ),
    -- Concatenate all step instructions
    COALESCE(
      (SELECT GROUP_CONCAT(instruction, ' ') 
       FROM recipe_steps 
       WHERE recipe_id = NEW.id 
       ORDER BY step_number), 
      ''
    ),
    -- Concatenate all category names
    COALESCE(
      (SELECT GROUP_CONCAT(name, ' ') 
       FROM recipe_categories 
       WHERE recipe_id = NEW.id 
       ORDER BY name), 
      ''
    ),
    -- Concatenate all group IDs for access control
    COALESCE(
      (SELECT GROUP_CONCAT(group_id, ',') 
       FROM recipe_groups 
       WHERE recipe_id = NEW.id), 
      ''
  );
END;

-- Delete trigger
CREATE TRIGGER IF NOT EXISTS recipe_search_fts_delete AFTER DELETE ON recipes
BEGIN
  DELETE FROM recipe_search_fts WHERE recipe_id = OLD.id;
END;

-- Update trigger
CREATE TRIGGER IF NOT EXISTS recipe_search_fts_update AFTER UPDATE ON recipes
BEGIN
  DELETE FROM recipe_search_fts WHERE recipe_id = OLD.id;
  INSERT INTO recipe_search_fts (
    recipe_id,
    name,
    description,
    ingredients,
    instructions,
    categories,
    group_ids
  )
  SELECT 
    NEW.id,
    NEW.name,
    NEW.description,
    -- Concatenate all ingredient names
    COALESCE(
      (SELECT GROUP_CONCAT(name, ' ') 
       FROM recipe_ingredients 
       WHERE recipe_id = NEW.id 
       ORDER BY name), 
      ''
    ),
    -- Concatenate all step instructions
    COALESCE(
      (SELECT GROUP_CONCAT(instruction, ' ') 
       FROM recipe_steps 
       WHERE recipe_id = NEW.id 
       ORDER BY step_number), 
      ''
    ),
    -- Concatenate all category names
    COALESCE(
      (SELECT GROUP_CONCAT(name, ' ') 
       FROM recipe_categories 
       WHERE recipe_id = NEW.id 
       ORDER BY name), 
      ''
    ),
    -- Concatenate all group IDs for access control
    COALESCE(
      (SELECT GROUP_CONCAT(group_id, ',') 
       FROM recipe_groups 
       WHERE recipe_id = NEW.id), 
      ''
  );
END;

-- Triggers for ingredient changes
CREATE TRIGGER IF NOT EXISTS recipe_search_fts_ingredient_insert AFTER INSERT ON recipe_ingredients
BEGIN
  DELETE FROM recipe_search_fts WHERE recipe_id = NEW.recipe_id;
  INSERT INTO recipe_search_fts (
    recipe_id,
    name,
    description,
    ingredients,
    instructions,
    categories,
    group_ids
  )
  SELECT 
    r.id,
    r.name,
    r.description,
    COALESCE(
      (SELECT GROUP_CONCAT(name, ' ') 
       FROM recipe_ingredients 
       WHERE recipe_id = r.id 
       ORDER BY name), 
      ''
    ),
    COALESCE(
      (SELECT GROUP_CONCAT(instruction, ' ') 
       FROM recipe_steps 
       WHERE recipe_id = r.id 
       ORDER BY step_number), 
      ''
    ),
    COALESCE(
      (SELECT GROUP_CONCAT(name, ' ') 
       FROM recipe_categories 
       WHERE recipe_id = r.id 
       ORDER BY name), 
      ''
    ),
    COALESCE(
      (SELECT GROUP_CONCAT(group_id, ',') 
       FROM recipe_groups 
       WHERE recipe_id = r.id), 
      ''
  )
  FROM recipes r WHERE r.id = NEW.recipe_id;
END;

CREATE TRIGGER IF NOT EXISTS recipe_search_fts_ingredient_delete AFTER DELETE ON recipe_ingredients
BEGIN
  DELETE FROM recipe_search_fts WHERE recipe_id = OLD.recipe_id;
  INSERT INTO recipe_search_fts (
    recipe_id,
    name,
    description,
    ingredients,
    instructions,
    categories,
    group_ids
  )
  SELECT 
    r.id,
    r.name,
    r.description,
    COALESCE(
      (SELECT GROUP_CONCAT(name, ' ') 
       FROM recipe_ingredients 
       WHERE recipe_id = r.id 
       ORDER BY name), 
      ''
    ),
    COALESCE(
      (SELECT GROUP_CONCAT(instruction, ' ') 
       FROM recipe_steps 
       WHERE recipe_id = r.id 
       ORDER BY step_number), 
      ''
    ),
    COALESCE(
      (SELECT GROUP_CONCAT(name, ' ') 
       FROM recipe_categories 
       WHERE recipe_id = r.id 
       ORDER BY name), 
      ''
    ),
    COALESCE(
      (SELECT GROUP_CONCAT(group_id, ',') 
       FROM recipe_groups 
       WHERE recipe_id = r.id), 
      ''
  )
  FROM recipes r WHERE r.id = OLD.recipe_id;
END;

-- Triggers for step changes
CREATE TRIGGER IF NOT EXISTS recipe_search_fts_step_insert AFTER INSERT ON recipe_steps
BEGIN
  DELETE FROM recipe_search_fts WHERE recipe_id = NEW.recipe_id;
  INSERT INTO recipe_search_fts (
    recipe_id,
    name,
    description,
    ingredients,
    instructions,
    categories,
    group_ids
  )
  SELECT 
    r.id,
    r.name,
    r.description,
    COALESCE(
      (SELECT GROUP_CONCAT(name, ' ') 
       FROM recipe_ingredients 
       WHERE recipe_id = r.id 
       ORDER BY name), 
      ''
    ),
    COALESCE(
      (SELECT GROUP_CONCAT(instruction, ' ') 
       FROM recipe_steps 
       WHERE recipe_id = r.id 
       ORDER BY step_number), 
      ''
    ),
    COALESCE(
      (SELECT GROUP_CONCAT(name, ' ') 
       FROM recipe_categories 
       WHERE recipe_id = r.id 
       ORDER BY name), 
      ''
    ),
    COALESCE(
      (SELECT GROUP_CONCAT(group_id, ',') 
       FROM recipe_groups 
       WHERE recipe_id = r.id), 
      ''
  )
  FROM recipes r WHERE r.id = NEW.recipe_id;
END;

CREATE TRIGGER IF NOT EXISTS recipe_search_fts_step_delete AFTER DELETE ON recipe_steps
BEGIN
  DELETE FROM recipe_search_fts WHERE recipe_id = OLD.recipe_id;
  INSERT INTO recipe_search_fts (
    recipe_id,
    name,
    description,
    ingredients,
    instructions,
    categories,
    group_ids
  )
  SELECT 
    r.id,
    r.name,
    r.description,
    COALESCE(
      (SELECT GROUP_CONCAT(name, ' ') 
       FROM recipe_ingredients 
       WHERE recipe_id = r.id 
       ORDER BY name), 
      ''
    ),
    COALESCE(
      (SELECT GROUP_CONCAT(instruction, ' ') 
       FROM recipe_steps 
       WHERE recipe_id = r.id 
       ORDER BY step_number), 
      ''
    ),
    COALESCE(
      (SELECT GROUP_CONCAT(name, ' ') 
       FROM recipe_categories 
       WHERE recipe_id = r.id 
       ORDER BY name), 
      ''
    ),
    COALESCE(
      (SELECT GROUP_CONCAT(group_id, ',') 
       FROM recipe_groups 
       WHERE recipe_id = r.id), 
      ''
  )
  FROM recipes r WHERE r.id = OLD.recipe_id;
END;

-- Triggers for category changes
CREATE TRIGGER IF NOT EXISTS recipe_search_fts_category_insert AFTER INSERT ON recipe_categories
BEGIN
  DELETE FROM recipe_search_fts WHERE recipe_id = NEW.recipe_id;
  INSERT INTO recipe_search_fts (
    recipe_id,
    name,
    description,
    ingredients,
    instructions,
    categories,
    group_ids
  )
  SELECT 
    r.id,
    r.name,
    r.description,
    COALESCE(
      (SELECT GROUP_CONCAT(name, ' ') 
       FROM recipe_ingredients 
       WHERE recipe_id = r.id 
       ORDER BY name), 
      ''
    ),
    COALESCE(
      (SELECT GROUP_CONCAT(instruction, ' ') 
       FROM recipe_steps 
       WHERE recipe_id = r.id 
       ORDER BY step_number), 
      ''
    ),
    COALESCE(
      (SELECT GROUP_CONCAT(name, ' ') 
       FROM recipe_categories 
       WHERE recipe_id = r.id 
       ORDER BY name), 
      ''
    ),
    COALESCE(
      (SELECT GROUP_CONCAT(group_id, ',') 
       FROM recipe_groups 
       WHERE recipe_id = r.id), 
      ''
  )
  FROM recipes r WHERE r.id = NEW.recipe_id;
END;

CREATE TRIGGER IF NOT EXISTS recipe_search_fts_category_delete AFTER DELETE ON recipe_categories
BEGIN
  DELETE FROM recipe_search_fts WHERE recipe_id = OLD.recipe_id;
  INSERT INTO recipe_search_fts (
    recipe_id,
    name,
    description,
    ingredients,
    instructions,
    categories,
    group_ids
  )
  SELECT 
    r.id,
    r.name,
    r.description,
    COALESCE(
      (SELECT GROUP_CONCAT(name, ' ') 
       FROM recipe_ingredients 
       WHERE recipe_id = r.id 
       ORDER BY name), 
      ''
    ),
    COALESCE(
      (SELECT GROUP_CONCAT(instruction, ' ') 
       FROM recipe_steps 
       WHERE recipe_id = r.id 
       ORDER BY step_number), 
      ''
    ),
    COALESCE(
      (SELECT GROUP_CONCAT(name, ' ') 
       FROM recipe_categories 
       WHERE recipe_id = r.id 
       ORDER BY name), 
      ''
    ),
    COALESCE(
      (SELECT GROUP_CONCAT(group_id, ',') 
       FROM recipe_groups 
       WHERE recipe_id = r.id), 
      ''
  )
  FROM recipes r WHERE r.id = OLD.recipe_id;
END;

-- Trigger for group changes (important for access control)
CREATE TRIGGER IF NOT EXISTS recipe_search_fts_group_insert AFTER INSERT ON recipe_groups
BEGIN
  DELETE FROM recipe_search_fts WHERE recipe_id = NEW.recipe_id;
  INSERT INTO recipe_search_fts (
    recipe_id,
    name,
    description,
    ingredients,
    instructions,
    categories,
    group_ids
  )
  SELECT 
    r.id,
    r.name,
    r.description,
    COALESCE(
      (SELECT GROUP_CONCAT(name, ' ') 
       FROM recipe_ingredients 
       WHERE recipe_id = r.id 
       ORDER BY name), 
      ''
    ),
    COALESCE(
      (SELECT GROUP_CONCAT(instruction, ' ') 
       FROM recipe_steps 
       WHERE recipe_id = r.id 
       ORDER BY step_number), 
      ''
    ),
    COALESCE(
      (SELECT GROUP_CONCAT(name, ' ') 
       FROM recipe_categories 
       WHERE recipe_id = r.id 
       ORDER BY name), 
      ''
    ),
    COALESCE(
      (SELECT GROUP_CONCAT(group_id, ',') 
       FROM recipe_groups 
       WHERE recipe_id = r.id), 
      ''
  )
  FROM recipes r WHERE r.id = NEW.recipe_id;
END;

CREATE TRIGGER IF NOT EXISTS recipe_search_fts_group_delete AFTER DELETE ON recipe_groups
BEGIN
  DELETE FROM recipe_search_fts WHERE recipe_id = OLD.recipe_id;
  INSERT INTO recipe_search_fts (
    recipe_id,
    name,
    description,
    ingredients,
    instructions,
    categories,
    group_ids
  )
  SELECT 
    r.id,
    r.name,
    r.description,
    COALESCE(
      (SELECT GROUP_CONCAT(name, ' ') 
       FROM recipe_ingredients 
       WHERE recipe_id = r.id 
       ORDER BY name), 
      ''
    ),
    COALESCE(
      (SELECT GROUP_CONCAT(instruction, ' ') 
       FROM recipe_steps 
       WHERE recipe_id = r.id 
       ORDER BY step_number), 
      ''
    ),
    COALESCE(
      (SELECT GROUP_CONCAT(name, ' ') 
       FROM recipe_categories 
       WHERE recipe_id = r.id 
       ORDER BY name), 
      ''
    ),
    COALESCE(
      (SELECT GROUP_CONCAT(group_id, ',') 
       FROM recipe_groups 
       WHERE recipe_id = r.id), 
      ''
  )
  FROM recipes r WHERE r.id = OLD.recipe_id;
END;
