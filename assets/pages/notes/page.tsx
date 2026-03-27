import React, { useState, useEffect } from 'react';

interface User {
    id: number;
    email: string;
}

interface Note {
    id: number;
    title: string;
    content: string;
    category: string;
    status: string;
    createdAt: string;
}

interface Props {
    user: User;
    onLogout: () => void;
}

const STATUSES = ['new', 'todo', 'done'];
const CATEGORIES = ['Work', 'Personal', 'Shopping', 'Health', 'Other'];

const STATUS_LABELS: Record<string, string> = {
    new: 'New',
    todo: 'To Do',
    done: 'Done',
};

const emptyForm = { title: '', content: '', category: 'Work', status: 'new' };

const NotesPage: React.FC<Props> = ({ user, onLogout }) => {
    const [notes, setNotes] = useState<Note[]>([]);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingNote, setEditingNote] = useState<Note | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [formError, setFormError] = useState('');
    const [loading, setLoading] = useState(false);

    const fetchNotes = () => {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (filterStatus) params.set('status', filterStatus);
        if (filterCategory) params.set('category', filterCategory);

        fetch(`/api/notes?${params.toString()}`, { credentials: 'include' })
            .then(res => res.json())
            .then(data => setNotes(Array.isArray(data) ? data : []))
            .catch(() => {});
    };

    useEffect(() => {
        fetchNotes();
    }, [search, filterStatus, filterCategory]);

    const openCreateModal = () => {
        setEditingNote(null);
        setForm(emptyForm);
        setFormError('');
        setShowModal(true);
    };

    const openEditModal = (note: Note) => {
        setEditingNote(note);
        setForm({
            title: note.title,
            content: note.content,
            category: note.category,
            status: note.status,
        });
        setFormError('');
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingNote(null);
        setForm(emptyForm);
        setFormError('');
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');
        setLoading(true);

        const url = editingNote ? `/api/notes/${editingNote.id}` : '/api/notes';
        const method = editingNote ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            const data = await res.json();

            if (!res.ok) {
                setFormError(data.error || 'Something went wrong.');
            } else {
                closeModal();
                fetchNotes();
            }
        } catch (err) {
            setFormError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this note?')) {
            return;
        }

        try {
            await fetch(`/api/notes/${id}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            fetchNotes();
        } catch (err) {}
    };

    return (
        <div className="app">
            <header className="header">
                <div className="header__inner">
                    <h1 className="header__logo">AJE Notes</h1>
                    <div className="header__user">
                        <span>{user.email}</span>
                        <button className="btn btn--outline" onClick={onLogout}>Logout</button>
                    </div>
                </div>
            </header>

            <main className="main">
                <div className="toolbar">
                    <input
                        type="text"
                        className="form-input toolbar__search"
                        placeholder="Search notes..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />

                    <select
                        className="form-input toolbar__select"
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                    >
                        <option value="">All Statuses</option>
                        {STATUSES.map(s => (
                            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                        ))}
                    </select>

                    <select
                        className="form-input toolbar__select"
                        value={filterCategory}
                        onChange={e => setFilterCategory(e.target.value)}
                    >
                        <option value="">All Categories</option>
                        {CATEGORIES.map(c => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>

                    <button className="btn btn--primary" onClick={openCreateModal}>
                        + New Note
                    </button>
                </div>

                {notes.length === 0 ? (
                    <div className="empty-state">
                        <p>No notes found. Create your first note!</p>
                    </div>
                ) : (
                    <div className="notes-grid">
                        {notes.map(note => (
                            <div key={note.id} className="note-card">
                                <div className="note-card__header">
                                    <h3 className="note-card__title">{note.title}</h3>
                                    <span className={`badge badge--${note.status}`}>
                                        {STATUS_LABELS[note.status]}
                                    </span>
                                </div>
                                <p className="note-card__content">{note.content}</p>
                                <div className="note-card__footer">
                                    <span className="note-card__category">{note.category}</span>
                                    <span className="note-card__date">{new Date(note.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="note-card__actions">
                                    <button className="btn btn--small btn--outline" onClick={() => openEditModal(note)}>
                                        Edit
                                    </button>
                                    <button className="btn btn--small btn--danger" onClick={() => handleDelete(note.id)}>
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal__header">
                            <h2 className="modal__title">{editingNote ? 'Edit Note' : 'New Note'}</h2>
                            <button className="modal__close" onClick={closeModal}>×</button>
                        </div>

                        {formError && <div className="alert alert--error">{formError}</div>}

                        <form onSubmit={handleFormSubmit}>
                            <div className="form-group">
                                <label className="form-label">Title</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={form.title}
                                    onChange={e => setForm({ ...form, title: e.target.value })}
                                    placeholder="Note title"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Content</label>
                                <textarea
                                    className="form-input form-textarea"
                                    value={form.content}
                                    onChange={e => setForm({ ...form, content: e.target.value })}
                                    placeholder="Write your note here..."
                                    rows={5}
                                    required
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Category</label>
                                    <select
                                        className="form-input"
                                        value={form.category}
                                        onChange={e => setForm({ ...form, category: e.target.value })}
                                    >
                                        {CATEGORIES.map(c => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Status</label>
                                    <select
                                        className="form-input"
                                        value={form.status}
                                        onChange={e => setForm({ ...form, status: e.target.value })}
                                    >
                                        {STATUSES.map(s => (
                                            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="modal__footer">
                                <button type="button" className="btn btn--outline" onClick={closeModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn--primary" disabled={loading}>
                                    {loading ? 'Saving...' : (editingNote ? 'Update Note' : 'Create Note')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotesPage;
