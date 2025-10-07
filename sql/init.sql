-- sql/init.sql
-- Personal Project Management System Schema for SQLite

-- PRAGMA foreign_keys=ON; -- It's good practice to enable foreign key constraints.
-- You might need to execute this command separately when connecting to the database.

-- =================================================================
-- Projects Table
-- Stores information about each project.
-- =================================================================
CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_name TEXT NOT NULL,
    code_repository TEXT,
    idea TEXT,
    description TEXT,
    market_research TEXT,
    competitor_research TEXT,
    -- Suggested statuses: 'idea', 'planning', 'in_progress', 'completed', 'archived'
    status TEXT NOT NULL DEFAULT 'idea',
    start_date DATETIME,
    due_date DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Trigger to automatically update the updated_at timestamp for projects
CREATE TRIGGER IF NOT EXISTS trigger_projects_updated_at
AFTER UPDATE ON projects
FOR EACH ROW
BEGIN
    UPDATE projects SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

-- =================================================================
-- Research Materials Table
-- Stores web pages, articles, and other research materials related to a project.
-- =================================================================
CREATE TABLE IF NOT EXISTS research_materials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    summary TEXT,
    saved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
);

-- Trigger to automatically update the updated_at timestamp for research_materials
CREATE TRIGGER IF NOT EXISTS trigger_research_materials_updated_at
AFTER UPDATE ON research_materials
FOR EACH ROW
BEGIN
    UPDATE research_materials SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

-- =================================================================
-- Tasks Table
-- Stores tasks for each project.
-- =================================================================
CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    task_name TEXT NOT NULL,
    -- Suggested statuses: 'todo', 'in_progress', 'done', 'blocked'
    status TEXT NOT NULL DEFAULT 'todo',
    notes TEXT,
    -- Suggested priorities: 1 (Low), 2 (Medium), 3 (High)
    priority INTEGER DEFAULT 2,
    due_date DATETIME,
    completed_at DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
);

-- Trigger to automatically update the updated_at timestamp for tasks
CREATE TRIGGER IF NOT EXISTS trigger_tasks_updated_at
AFTER UPDATE ON tasks
FOR EACH ROW
BEGIN
    UPDATE tasks SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

-- =================================================================
-- Keywords Table
-- Stores keywords, supporting a parent-child relationship for broad and long-tail keywords.
-- =================================================================
CREATE TABLE IF NOT EXISTS keywords (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER,
    keyword_text TEXT NOT NULL UNIQUE,
    -- If parent_id is NULL, it's a broad keyword. Otherwise, it's a long-tail keyword.
    parent_id INTEGER,
    -- Suggested values: 'Low', 'Medium', 'High'
    competition_level TEXT,
    -- Storing as TEXT for flexibility, e.g., JSON string of date/value pairs
    search_trend TEXT,
    competitor_analysis TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES keywords (id) ON DELETE CASCADE
);

-- Trigger to automatically update the updated_at timestamp for keywords
CREATE TRIGGER IF NOT EXISTS trigger_keywords_updated_at
AFTER UPDATE ON keywords
FOR EACH ROW
BEGIN
    UPDATE keywords SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;