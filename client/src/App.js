import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// --- Helper Functions & Constants ---
const API_URL = 'http://localhost:5000'; // Your backend URL

// Function to format file size for display
const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

// --- SVG Icons ---
const FileIcon = ({ mimeType }) => {
  let icon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
  );
  if (mimeType.startsWith('image/')) icon = <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
  if (mimeType.startsWith('audio/')) icon = <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" /></svg>;
  if (mimeType.startsWith('video/')) icon = <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
  return icon;
};

// --- Components ---

// 1. Lock Screen Component
const LockScreen = ({ onUnlock }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API_URL}/api/auth`, { password });
      if (res.data.success) {
        onUnlock();
      }
    } catch (err) {
      setError('Incorrect password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="w-full max-w-md p-8 space-y-8 bg-gray-800 rounded-2xl shadow-lg">
        <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight">Secure Vault</h1>
            <p className="mt-2 text-gray-400">Enter your password to access.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition" required />
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button type="submit" disabled={isLoading} className="w-full py-3 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 disabled:bg-blue-400 transition-all">
            {isLoading ? 'Unlocking...' : 'Unlock'}
          </button>
        </form>
      </div>
    </div>
  );
};

// 2. Notepad Component (New)
const Notepad = () => {
    const [notes, setNotes] = useState([]);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [error, setError] = useState('');

    // Function to fetch notes from the backend
    const fetchNotes = useCallback(async () => {
        try {
            const response = await axios.get(`${API_URL}/api/notes`);
            setNotes(response.data);
        } catch (err) {
            setError('Could not fetch notes.');
        }
    }, []);

    // Fetch notes when the component mounts
    useEffect(() => {
        fetchNotes();
    }, [fetchNotes]);

    // Handler to save a new note
    const handleSaveNote = async (e) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) {
            setError('Title and content cannot be empty.');
            return;
        }
        try {
            await axios.post(`${API_URL}/api/notes`, { title, content });
            setTitle('');
            setContent('');
            setError('');
            fetchNotes(); // Refresh notes list after saving
        } catch (err) {
            setError('Failed to save note.');
        }
    };

    // Handler to delete a note
    const handleDeleteNote = async (id) => {
        try {
            await axios.delete(`${API_URL}/api/notes/${id}`);
            fetchNotes(); // Refresh notes list after deleting
        } catch (err) {
            setError('Failed to delete note.');
        }
    };

    return (
        <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Notepad</h2>
            {/* Form to add a new note */}
            <form onSubmit={handleSaveNote} className="bg-white p-6 rounded-lg shadow-lg mb-8">
                <h3 className="text-xl font-semibold mb-4 text-gray-700">Add a New Note or Checklist</h3>
                <div className="space-y-4">
                    <input type="text" placeholder="Note Title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <textarea placeholder="Write your note, tasks, or checklist here..." value={content} onChange={(e) => setContent(e.target.value)} rows="4" className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                </div>
                {error && <p className="text-red-500 mt-2">{error}</p>}
                <button type="submit" className="mt-4 px-6 py-2 font-semibold text-white bg-indigo-500 rounded-lg hover:bg-indigo-600 transition-all">Save Note</button>
            </form>

            {/* Display existing notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {notes.map(note => (
                    <div key={note._id} className="bg-white rounded-lg shadow-lg p-5 flex flex-col justify-between hover:shadow-xl transition-shadow">
                        <div>
                            <h4 className="font-bold text-lg text-gray-800 mb-2">{note.title}</h4>
                            {/* whitespace-pre-wrap preserves line breaks for checklists */}
                            <p className="text-gray-600 whitespace-pre-wrap">{note.content}</p>
                        </div>
                        <div className="flex justify-between items-center mt-4 pt-4 border-t">
                            <p className="text-xs text-gray-400">{new Date(note.createdAt).toLocaleDateString()}</p>
                            <button onClick={() => handleDeleteNote(note._id)} className="text-red-500 hover:text-red-700 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};


// 3. Main Application Component
const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');

  const fetchFiles = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/api/files`);
      setFiles(response.data);
    } catch (err) {
      setError('Could not fetch files.');
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchFiles();
    }
  }, [isAuthenticated, fetchFiles]);
  
  const handleFileChange = (e) => setSelectedFile(e.target.files[0]);

  const handleUpload = async () => {
    if (!selectedFile) return;
    const formData = new FormData();
    formData.append('file', selectedFile);
    setUploading(true);
    setUploadProgress(0);
    setError('');
    try {
      await axios.post(`${API_URL}/api/upload`, formData, {
        onUploadProgress: (e) => setUploadProgress(Math.round((e.loaded * 100) / e.total)),
      });
      fetchFiles();
      setSelectedFile(null);
    } catch (err) {
      setError('File upload failed.');
    } finally {
      setUploading(false);
    }
  };

  if (!isAuthenticated) {
    return <LockScreen onUnlock={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <header className="bg-white shadow-md sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">My Secure Vault</h1>
          <button onClick={() => setIsAuthenticated(false)} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition">Lock</button>
        </div>
      </header>
      
      <main className="container mx-auto p-4 md:p-8">
        {/* File Upload Section */}
        <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Upload a New File</h2>
            <div className="flex items-center space-x-4">
                <label className="w-full flex items-center px-4 py-3 bg-white text-blue-500 rounded-lg shadow-lg tracking-wide uppercase border border-blue-500 cursor-pointer hover:bg-blue-500 hover:text-white transition-all">
                    <svg className="w-8 h-8" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M16.88 9.1A4 4 0 0 1 16 17H5a5 5 0 0 1-1-9.9V7a3 3 0 0 1 4.52-2.59A4.98 4.98 0 0 1 17 8c0 .38-.04.74-.12 1.1zM11 11h3l-4 4-4-4h3V7h2v4z" /></svg>
                    <span className="ml-4 text-base leading-normal">{selectedFile ? selectedFile.name : 'Select a file'}</span>
                    <input type='file' className="hidden" onChange={handleFileChange} />
                </label>
                <button onClick={handleUpload} disabled={!selectedFile || uploading} className="px-6 py-3 font-semibold text-white bg-green-500 rounded-lg hover:bg-green-600 disabled:bg-gray-400 transition-all">
                    {uploading ? 'Uploading...' : 'Upload'}
                </button>
            </div>
            {uploading && <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4"><div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div></div>}
            {error && <p className="text-red-500 mt-4">{error}</p>}
        </div>

        {/* Files Grid */}
        <div>
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Your Files</h2>
            {files.length === 0 ? <p className="text-center text-gray-500">No files uploaded yet.</p> : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {files.map(file => (
                        <div key={file._id} className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform transform hover:-translate-y-1">
                            <div className="p-4 flex flex-col items-center justify-center bg-gray-50 border-b"><FileIcon mimeType={file.mimeType} /></div>
                            <div className="p-4">
                                <p className="font-semibold text-gray-800 truncate" title={file.originalName}>{file.originalName}</p>
                                <p className="text-sm text-gray-500">{formatBytes(file.size)}</p>
                                <a href={`${API_URL}/uploads/${file.filename}`} download={file.originalName} target="_blank" rel="noopener noreferrer" className="block w-full mt-4 text-center bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition">Download</a>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
        
        {/* Divider */}
        <hr className="my-12 border-t-2 border-gray-200" />

        {/* Notepad Section */}
        <Notepad />
      </main>
    </div>
  );
};

export default App;
