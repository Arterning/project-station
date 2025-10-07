import sqlite3
import os
from flask import Flask, render_template, request, redirect, url_for, flash, abort
from datetime import datetime
from collections import defaultdict

# --- Configuration ---
DATABASE_FILE = 'projects.db'
SQL_INIT_FILE = os.path.join('sql', 'init.sql')
SECRET_KEY = os.urandom(24) # For flashing messages

# --- App Initialization ---
app = Flask(__name__)
app.config['SECRET_KEY'] = SECRET_KEY

# --- Database Functions ---
def get_db_connection():
    """Creates a database connection."""
    conn = sqlite3.connect(DATABASE_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def initialize_database():
    """Initializes the database using the SQL script if the DB file doesn't exist."""
    if not os.path.exists(DATABASE_FILE):
        print(f"Database file not found. Creating and initializing database at '{DATABASE_FILE}'...")
        try:
            conn = get_db_connection()
            with open(SQL_INIT_FILE, 'r') as f:
                conn.executescript(f.read())
            conn.commit()
            conn.close()
            print("Database initialized successfully.")
        except Exception as e:
            print(f"Error initializing database: {e}")
            if os.path.exists(DATABASE_FILE):
                os.remove(DATABASE_FILE)

def get_project(project_id):
    """Gets a single project by its ID."""
    conn = get_db_connection()
    project = conn.execute('SELECT * FROM projects WHERE id = ?', (project_id,)).fetchone()
    conn.close()
    if project is None:
        abort(404)
    return project

# --- Routes ---
@app.route('/')
def index():
    """Homepage: Displays all projects."""
    conn = get_db_connection()
    projects = conn.execute('SELECT * FROM projects ORDER BY created_at DESC').fetchall()
    conn.close()
    return render_template('index.html', projects=projects)

@app.route('/new', methods=['GET', 'POST'])
def create_project():
    """Page for creating a new project."""
    if request.method == 'POST':
        project_name = request.form.get('project_name')
        if not project_name:
            flash('Project Name is a required field.', 'error')
            return render_template('new_project.html')

        try:
            conn = get_db_connection()
            conn.execute(
                """
                INSERT INTO projects (project_name, code_repository, idea, description, status, start_date)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (
                    project_name,
                    request.form.get('code_repository'),
                    request.form.get('idea'),
                    request.form.get('description'),
                    request.form.get('status', 'idea'),
                    datetime.now()
                )
            )
            conn.commit()
            conn.close()
            flash(f"Project '{project_name}' created successfully!", 'success')
        except sqlite3.Error as e:
            flash(f"Database error: {e}", 'error')
        
        return redirect(url_for('index'))

    return render_template('new_project.html')

@app.route('/project/<int:project_id>', methods=['GET', 'POST'])
def project_detail(project_id):
    """Displays and handles updates for a single project."""
    project = get_project(project_id)

    if request.method == 'POST': # This handles the main project details update
        project_name = request.form.get('project_name')
        if not project_name:
            flash('Project Name cannot be empty.', 'error')
            return redirect(url_for('project_detail', project_id=project_id))

        try:
            conn = get_db_connection()
            conn.execute(
                """
                UPDATE projects SET
                    project_name = ?, code_repository = ?, idea = ?, description = ?,
                    market_research = ?, competitor_research = ?, status = ?,
                    start_date = ?, due_date = ?
                WHERE id = ?
                """,
                (
                    project_name,
                    request.form.get('code_repository'),
                    request.form.get('idea'),
                    request.form.get('description'),
                    request.form.get('market_research'),
                    request.form.get('competitor_research'),
                    request.form.get('status'),
                    request.form.get('start_date'),
                    request.form.get('due_date'),
                    project_id
                )
            )
            conn.commit()
            conn.close()
            flash('Project updated successfully!', 'success')
        except sqlite3.Error as e:
            flash(f"Database error on update: {e}", 'error')
        
        return redirect(url_for('project_detail', project_id=project_id))

    # GET request: Fetch all related data for the tabs
    conn = get_db_connection()
    research_materials = conn.execute('SELECT * FROM research_materials WHERE project_id = ? ORDER BY saved_at DESC', (project_id,)).fetchall()
    tasks = conn.execute('SELECT * FROM tasks WHERE project_id = ? ORDER BY created_at DESC', (project_id,)).fetchall()
    conn.close()
    
    project_dict = dict(project)
    return render_template('project_detail.html', project=project_dict, research_materials=research_materials, tasks=tasks)

# --- Research Materials Routes ---
@app.route('/project/<int:project_id>/research/add', methods=['POST'])
def add_research(project_id):
    title = request.form.get('title')
    url = request.form.get('url')
    summary = request.form.get('summary')

    if not title or not url:
        flash('Title and URL are required for research materials.', 'error')
    else:
        try:
            conn = get_db_connection()
            conn.execute(
                'INSERT INTO research_materials (project_id, title, url, summary) VALUES (?, ?, ?, ?)',
                (project_id, title, url, summary)
            )
            conn.commit()
            conn.close()
            flash('Research material added.', 'success')
        except sqlite3.Error as e:
            flash(f"Database error: {e}", 'error')
            
    return redirect(url_for('project_detail', project_id=project_id, _anchor='research'))

@app.route('/research/<int:material_id>/delete', methods=['POST'])
def delete_research(material_id):
    project_id = request.form.get('project_id')
    try:
        conn = get_db_connection()
        conn.execute('DELETE FROM research_materials WHERE id = ?', (material_id,))
        conn.commit()
        conn.close()
        flash('Research material deleted.', 'success')
    except sqlite3.Error as e:
        flash(f"Database error: {e}", 'error')
        
    return redirect(url_for('project_detail', project_id=project_id, _anchor='research'))

# --- Tasks Routes ---
@app.route('/project/<int:project_id>/task/add', methods=['POST'])
def add_task(project_id):
    task_name = request.form.get('task_name')
    if not task_name:
        flash('Task name is required.', 'error')
    else:
        try:
            conn = get_db_connection()
            conn.execute(
                'INSERT INTO tasks (project_id, task_name, status, notes, due_date) VALUES (?, ?, ?, ?, ?)',
                (
                    project_id,
                    task_name,
                    request.form.get('status'),
                    request.form.get('notes'),
                    request.form.get('due_date') or None # Handle empty date
                )
            )
            conn.commit()
            conn.close()
            flash('Task added.', 'success')
        except sqlite3.Error as e:
            flash(f"Database error: {e}", 'error')

    return redirect(url_for('project_detail', project_id=project_id, _anchor='tasks'))

@app.route('/task/<int:task_id>/edit', methods=['POST'])
def edit_task(task_id):
    project_id = request.form.get('project_id')
    new_status = request.form.get('status')
    completed_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S") if new_status == 'done' else None
    
    try:
        conn = get_db_connection()
        conn.execute(
            'UPDATE tasks SET status = ?, completed_at = ? WHERE id = ?',
            (new_status, completed_at, task_id)
        )
        conn.commit()
        conn.close()
        flash('Task status updated.', 'success')
    except sqlite3.Error as e:
        flash(f"Database error: {e}", 'error')
        
    return redirect(url_for('project_detail', project_id=project_id, _anchor='tasks'))

@app.route('/task/<int:task_id>/delete', methods=['POST'])
def delete_task(task_id):
    project_id = request.form.get('project_id')
    try:
        conn = get_db_connection()
        conn.execute('DELETE FROM tasks WHERE id = ?', (task_id,))
        conn.commit()
        conn.close()
        flash('Task deleted.', 'success')
    except sqlite3.Error as e:
        flash(f"Database error: {e}", 'error')

    return redirect(url_for('project_detail', project_id=project_id, _anchor='tasks'))

# --- Keyword Routes ---
@app.route('/keywords')
def keywords_index():
    """Keywords dashboard: Displays all keywords in a nested structure."""
    conn = get_db_connection()
    keywords_raw = conn.execute('SELECT * FROM keywords ORDER BY keyword_text').fetchall()
    projects = conn.execute('SELECT id, project_name FROM projects ORDER BY project_name').fetchall()
    conn.close()

    keywords_by_id = {kw['id']: dict(kw, children=[]) for kw in keywords_raw}
    broad_keywords = []
    for kw in keywords_by_id.values():
        if kw['parent_id'] is None:
            broad_keywords.append(kw)
        else:
            if kw['parent_id'] in keywords_by_id:
                keywords_by_id[kw['parent_id']]['children'].append(kw)

    return render_template('keywords/index.html', broad_keywords=broad_keywords, projects=projects)

@app.route('/keywords/add', methods=['POST'])
def add_keyword():
    """Handles the form for adding a new broad keyword and its long-tails."""
    project_id = request.form.get('project_id')
    broad_keyword_text = request.form.get('keyword_text')
    long_tail_keywords_raw = request.form.get('long_tail_keywords', '')
    
    if not broad_keyword_text:
        flash('Project and Broad Keyword are required fields.', 'error')
        return redirect(url_for('keywords_index'))

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # Insert the broad keyword first
        cursor.execute(
            """
            INSERT INTO keywords (project_id, keyword_text, competition_level, competitor_analysis)
            VALUES (?, ?, ?, ?)
            """,
            (
                project_id,
                broad_keyword_text,
                request.form.get('competition_level'),
                request.form.get('competitor_analysis')
            )
        )
        parent_id = cursor.lastrowid

        # Insert long-tail keywords
        long_tail_keywords = [lt.strip() for lt in long_tail_keywords_raw.splitlines() if lt.strip()]
        for lt_keyword in long_tail_keywords:
            cursor.execute(
                """
                INSERT INTO keywords (project_id, keyword_text, parent_id, competition_level, competitor_analysis)
                VALUES (?, ?, ?, ?, ?)
                """,
                (project_id, lt_keyword, parent_id, None, None) # Child keywords inherit competition from parent
            )
        
        conn.commit()
        flash(f"Keyword '{broad_keyword_text}' and its long-tails added successfully!", 'success')

    except sqlite3.IntegrityError:
        flash(f"Error: Keyword '{broad_keyword_text}' already exists.", 'error')
    except sqlite3.Error as e:
        flash(f"Database error: {e}", 'error')
    finally:
        conn.close()

    return redirect(url_for('keywords_index'))

@app.route('/keyword/<int:keyword_id>')
def keyword_detail(keyword_id):
    """Displays details for a single keyword."""
    conn = get_db_connection()
    keyword = conn.execute('SELECT * FROM keywords WHERE id = ?', (keyword_id,)).fetchone()
    
    if keyword is None:
        abort(404)

    children = conn.execute('SELECT * FROM keywords WHERE parent_id = ?', (keyword_id,)).fetchall()
    
    parent = None
    if keyword['parent_id']:
        parent = conn.execute('SELECT * FROM keywords WHERE id = ?', (keyword['parent_id'],)).fetchone()
        
    conn.close()
    
    return render_template('keywords/detail.html', keyword=keyword, children=children, parent=parent)

# --- Main Execution ---
if __name__ == '__main__':
    initialize_database()
    app.run(debug=True)
