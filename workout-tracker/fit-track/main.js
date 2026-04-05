const STORAGE_KEY = 'fittrack_workouts';
let editingId = null;
let chartInstance = null;

// --- Data Persistence ---
function getWorkouts() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
}

function saveWorkouts(workouts) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workouts));
}

// --- Navigation Logic ---
function navigate(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
    
    const targetPage = document.getElementById('page-' + page);
    const targetLink = document.querySelector(`.nav-links a[data-page="${page}"]`);
    
    if (targetPage) targetPage.classList.add('active');
    if (targetLink) targetLink.classList.add('active');

    if (page === 'home') renderHome();
    if (page === 'log') renderLog();
    if (page === 'progress') renderProgress();
}

// --- UI Helpers ---
function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
}

function formatDate(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function toggleForm() {
    const form = document.getElementById('add-form');
    if (form.classList.contains('open')) {
        form.classList.remove('open');
        resetForm();
    } else {
        form.classList.add('open');
        document.getElementById('field-exercise').focus();
    }
}

function resetForm() {
    document.getElementById('workout-form').reset();
    document.getElementById('field-date').value = new Date().toISOString().split('T')[0];
    document.getElementById('form-title').textContent = 'Add Workout';
    document.getElementById('form-submit-btn').textContent = 'Save Workout';
    editingId = null;
}

// --- Renderers ---
function renderHome() {
    const workouts = getWorkouts();
    document.getElementById('stat-total').textContent = workouts.length;

    const uniqueExercises = new Set(workouts.map(w => w.exercise.toLowerCase()));
    document.getElementById('stat-exercises').textContent = uniqueExercises.size;

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const thisWeek = workouts.filter(w => new Date(w.date) >= oneWeekAgo);
    document.getElementById('stat-week').textContent = thisWeek.length;

    const recentList = document.getElementById('recent-list');
    if (workouts.length === 0) {
        recentList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🏋️</div>
                <p>No workouts yet. Log your first one!</p>
                <button class="btn btn-primary" id="empty-state-log-btn">Go to Workout Log</button>
            </div>`;
        // Attach listener to the dynamically created button
        document.getElementById('empty-state-log-btn').onclick = () => navigate('log');
        return;
    }

    const recent = workouts.slice(0, 5);
    recentList.innerHTML = recent.map(w => `
        <div class="recent-item">
            <div>
                <div class="recent-item-name">${w.exercise}</div>
                <div class="recent-item-meta">${w.sets} sets × ${w.reps} reps${w.weight ? ' · ' + w.weight + ' lbs' : ''}</div>
            </div>
            <div class="recent-item-date">${formatDate(w.date)}</div>
        </div>
    `).join('');
}

function renderLog() {
    const workouts = getWorkouts();
    const search = document.getElementById('filter-search').value.toLowerCase();
    const dateVal = document.getElementById('filter-date').value;
    const sort = document.getElementById('filter-sort').value;

    let filtered = workouts.filter(w => {
        const matchSearch = !search || w.exercise.toLowerCase().includes(search);
        const matchDate = !dateVal || w.date === dateVal;
        return matchSearch && matchDate;
    });

    if (sort === 'date-asc') filtered.sort((a, b) => a.date.localeCompare(b.date));
    if (sort === 'date-desc') filtered.sort((a, b) => b.date.localeCompare(a.date));
    if (sort === 'exercise') filtered.sort((a, b) => a.exercise.localeCompare(b.exercise));
    if (sort === 'weight') filtered.sort((a, b) => (Number(b.weight) || 0) - (Number(a.weight) || 0));

    const tbody = document.getElementById('workout-tbody');
    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="table-empty">No workouts found.</td></tr>`;
        return;
    }

    tbody.innerHTML = filtered.map(w => `
        <tr>
            <td><strong>${w.exercise}</strong></td>
            <td>${w.sets}</td>
            <td>${w.reps}</td>
            <td>${w.weight ? w.weight + ' lbs' : '—'}</td>
            <td><span class="badge badge-green">${formatDate(w.date)}</span></td>
            <td>
                <button class="btn-icon edit-action" data-id="${w.id}" title="Edit">📝</button>
                <button class="btn-icon danger delete-action" data-id="${w.id}" title="Delete">🗑️</button>
            </td>
        </tr>
    `).join('');
}

// --- Action Handlers ---
function handleFormSubmit(e) {
    e.preventDefault();
    const exercise = document.getElementById('field-exercise').value.trim();
    const sets = document.getElementById('field-sets').value.trim();
    const reps = document.getElementById('field-reps').value.trim();
    const weight = document.getElementById('field-weight').value.trim();
    const date = document.getElementById('field-date').value;

    if (editingId) {
        const workouts = getWorkouts().map(w => w.id === editingId ? { ...w, exercise, sets, reps, weight, date } : w);
        saveWorkouts(workouts);
        showToast('Workout updated!');
    } else {
        const workouts = getWorkouts();
        workouts.unshift({ id: Date.now().toString(), exercise, sets, reps, weight, date });
        saveWorkouts(workouts);
        showToast('Workout saved!');
    }

    document.getElementById('add-form').classList.remove('open');
    resetForm();
    renderLog();
}

function startEdit(id) {
    const workout = getWorkouts().find(w => w.id === id);
    if (!workout) return;
    editingId = id;
    document.getElementById('field-exercise').value = workout.exercise;
    document.getElementById('field-sets').value = workout.sets;
    document.getElementById('field-reps').value = workout.reps;
    document.getElementById('field-weight').value = workout.weight || '';
    document.getElementById('field-date').value = workout.date;
    document.getElementById('form-title').textContent = 'Edit Workout';
    document.getElementById('form-submit-btn').textContent = 'Update Workout';
    document.getElementById('add-form').classList.add('open');
    document.getElementById('field-exercise').focus();
}

function handleDelete(id) {
    if (!confirm('Delete this workout?')) return;
    const workouts = getWorkouts().filter(w => w.id !== id);
    saveWorkouts(workouts);
    showToast('Workout deleted.');
    renderLog();
}

// --- Progress & Charts ---
function renderProgress() {
    const workouts = getWorkouts();
    const uniqueEx = new Set(workouts.map(w => w.exercise.toLowerCase()));
    const totalWeight = workouts.reduce((sum, w) => sum + (Number(w.weight) || 0) * Number(w.sets) * Number(w.reps), 0);
    
    document.getElementById('prog-total').textContent = workouts.length;
    document.getElementById('prog-exercises').textContent = uniqueEx.size;
    document.getElementById('prog-volume').textContent = totalWeight.toLocaleString();

    const sel = document.getElementById('exercise-select');
    const current = sel.value;
    sel.innerHTML = '<option value="">— Select exercise —</option>';
    [...uniqueEx].sort().forEach(ex => {
        const opt = document.createElement('option');
        opt.value = ex;
        opt.textContent = ex.charAt(0).toUpperCase() + ex.slice(1);
        sel.appendChild(opt);
    });
    if (current) sel.value = current;

    renderChart();
    renderPersonalBests();
}

function renderChart() {
    const exercise = document.getElementById('exercise-select').value;
    const ctx = document.getElementById('progress-chart').getContext('2d');
    if (chartInstance) chartInstance.destroy();

    if (!exercise) return;

    const filtered = getWorkouts()
        .filter(w => w.exercise.toLowerCase() === exercise)
        .sort((a, b) => a.date.localeCompare(b.date));

    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: filtered.map(w => formatDate(w.date)),
            datasets: [{
                label: 'Weight (lbs)',
                data: filtered.map(w => Number(w.weight) || 0),
                borderColor: '#EF4444',
                tension: 0.3
            }]
        }
    });
}

function renderPersonalBests() {
    const bests = {};
    getWorkouts().forEach(w => {
        const key = w.exercise.toLowerCase();
        const weight = Number(w.weight) || 0;
        if (!bests[key] || weight > bests[key].weight) {
            bests[key] = { exercise: w.exercise, weight, sets: w.sets, reps: w.reps, date: w.date };
        }
    });

    const tbody = document.getElementById('pb-tbody');
    const entries = Object.values(bests).sort((a, b) => b.weight - a.weight);
    tbody.innerHTML = entries.map(b => `
        <tr>
            <td><strong>${b.exercise}</strong></td>
            <td>${b.weight} lbs</td>
            <td>${b.sets} × ${b.reps}</td>
            <td>${formatDate(b.date)}</td>
        </tr>
    `).join('') || '<tr><td colspan="4" class="table-empty">No data yet.</td></tr>';
}

// --- Event Listeners Setup ---
document.addEventListener('DOMContentLoaded', () => {
    // Nav Links
    document.querySelectorAll('.nav-links a').forEach(a => {
        a.addEventListener('click', e => {
            e.preventDefault();
            navigate(a.dataset.page);
        });
    });

    // Logo & Hero Buttons
    document.getElementById('logo-link').addEventListener('click', e => {
        e.preventDefault();
        navigate('home');
    });
    document.getElementById('hero-log-btn').onclick = () => navigate('log');
    document.getElementById('hero-prog-btn').onclick = () => navigate('progress');
    document.getElementById('view-all-btn').onclick = () => navigate('log');

    // Form Events
    document.getElementById('toggle-form-btn').onclick = toggleForm;
    document.getElementById('cancel-form-btn').onclick = toggleForm;
    document.getElementById('workout-form').onsubmit = handleFormSubmit;

    // Filters
    ['filter-search', 'filter-date', 'filter-sort'].forEach(id => {
        document.getElementById(id).oninput = renderLog;
    });

    document.getElementById('clear-filters-btn').onclick = () => {
        document.getElementById('filter-search').value = '';
        document.getElementById('filter-date').value = '';
        document.getElementById('filter-sort').value = 'date-desc';
        renderLog();
    };

    // Table Actions (Delegation)
    document.getElementById('workout-tbody').addEventListener('click', e => {
        const editBtn = e.target.closest('.edit-action');
        const deleteBtn = e.target.closest('.delete-action');
        if (editBtn) startEdit(editBtn.dataset.id);
        if (deleteBtn) handleDelete(deleteBtn.dataset.id);
    });

    // Progress
    document.getElementById('exercise-select').onchange = renderChart;

    // Set default date
    document.getElementById('field-date').value = new Date().toISOString().split('T')[0];

    navigate('home');
});