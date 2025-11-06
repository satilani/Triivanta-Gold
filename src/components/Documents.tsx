import React, { useState, useMemo, useRef } from 'react';
import Card from './ui/Card';
import { DOCUMENT_DATA } from '../constants';
import { DocumentFolder, ProjectDocument } from '../types';

const FileIcon: React.FC<{ type: ProjectDocument['type'] }> = ({ type }) => {
    const baseClass = "h-6 w-6 mr-3 flex-shrink-0";
    switch(type) {
        case 'PDF': return <svg xmlns="http://www.w3.org/2000/svg" className={`${baseClass} text-red-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
        case 'JPG':
        case 'PNG': return <svg xmlns="http://www.w3.org/2000/svg" className={`${baseClass} text-sky-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
        case 'DOCX': return <svg xmlns="http://www.w3.org/2000/svg" className={`${baseClass} text-blue-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
        default: return <svg xmlns="http://www.w3.org/2000/svg" className={`${baseClass} text-slate-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>;
    }
}

const UploadModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onUpload: (file: File, linkedTo: string) => void;
    documentToReplace?: ProjectDocument | null;
}> = ({ isOpen, onClose, onUpload, documentToReplace }) => {
    const [file, setFile] = useState<File | null>(null);
    const [linkedTo, setLinkedTo] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (file) {
            onUpload(file, linkedTo);
            handleClose();
        }
    };
    
    const handleClose = () => {
        setFile(null);
        setLinkedTo('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={handleClose}>
            <div className="bg-white dark:bg-brand-secondary p-8 rounded-lg shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-brand-text">{documentToReplace ? `Replace "${documentToReplace.name}"` : 'Upload New Document'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-brand-text-secondary mb-1">File</label>
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 dark:border-brand-border border-dashed rounded-md cursor-pointer hover:border-brand-accent"
                        >
                            <div className="space-y-1 text-center">
                                <svg className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <div className="flex text-sm text-slate-500 dark:text-brand-text-secondary">
                                    <span className="relative rounded-md font-medium text-brand-accent hover:text-brand-accent-light focus-within:outline-none">
                                        <span>{file ? 'Change file' : 'Upload a file'}</span>
                                        <input ref={fileInputRef} id="file-upload" name="file-upload" type="file" className="sr-only" onChange={(e) => setFile(e.target.files?.[0] || null)} required />
                                    </span>
                                    <p className="pl-1">or drag and drop</p>
                                </div>
                                {file ? <p className="text-xs text-slate-800 dark:text-brand-text">{file.name}</p> : <p className="text-xs text-slate-500">PNG, JPG, PDF up to 10MB</p>}
                            </div>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="linkedTo" className="block text-sm font-medium text-slate-600 dark:text-brand-text-secondary mb-1">Link to (optional)</label>
                        <input type="text" id="linkedTo" value={linkedTo} onChange={e => setLinkedTo(e.target.value)} placeholder="e.g., Plot A-01 or Lead 3" className="w-full bg-slate-50 dark:bg-brand-dark border border-slate-300 dark:border-brand-border text-slate-800 dark:text-brand-text placeholder-slate-400 dark:placeholder-slate-500 rounded-md p-2 focus:ring-brand-accent focus:border-brand-accent" />
                    </div>
                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={handleClose} className="px-4 py-2 rounded-md text-slate-600 dark:text-brand-text-secondary hover:bg-slate-100 dark:hover:bg-brand-border">Cancel</button>
                        <button type="submit" className="px-4 py-2 rounded-md bg-brand-accent text-white font-bold hover:bg-brand-accent-light disabled:bg-slate-400" disabled={!file}>
                            {documentToReplace ? 'Replace Document' : 'Add Document'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ConfirmDeleteModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    documentName: string;
}> = ({ isOpen, onClose, onConfirm, documentName }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-brand-secondary p-8 rounded-lg shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-brand-text">Confirm Deletion</h2>
                <p className="text-slate-600 dark:text-brand-text-secondary mb-6">Are you sure you want to remove the document <strong className="text-slate-800 dark:text-brand-text">"{documentName}"</strong>? This action cannot be undone.</p>
                <div className="flex justify-end space-x-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-slate-600 dark:text-brand-text-secondary hover:bg-slate-100 dark:hover:bg-brand-border">Cancel</button>
                    <button onClick={onConfirm} className="px-4 py-2 rounded-md bg-red-600 text-white font-bold hover:bg-red-700">Remove</button>
                </div>
            </div>
        </div>
    );
};


const Documents: React.FC = () => {
    const [folders, setFolders] = useState<DocumentFolder[]>(DOCUMENT_DATA);
    const [selectedFolderId, setSelectedFolderId] = useState<string>(DOCUMENT_DATA[0].id);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<{key: keyof ProjectDocument; direction: 'asc' | 'desc'} | null>({key: 'uploadDate', direction: 'desc'});
    
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [documentToReplace, setDocumentToReplace] = useState<ProjectDocument | null>(null);
    const [documentToDelete, setDocumentToDelete] = useState<ProjectDocument | null>(null);
    
    const selectedFolder = folders.find(f => f.id === selectedFolderId);

    const filteredAndSortedDocuments = useMemo(() => {
        if (!selectedFolder) return [];
        
        let docs = selectedFolder.documents.filter(doc => 
            doc.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (sortConfig !== null) {
            docs.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }

        return docs;
    }, [selectedFolder, searchTerm, sortConfig]);

    const handleSort = (key: keyof ProjectDocument) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const handleUpload = (file: File, linkedTo: string) => {
        const newDoc: ProjectDocument = {
            id: `doc-${Date.now()}`,
            name: file.name,
            type: (file.name.split('.').pop()?.toUpperCase() as ProjectDocument['type']) || 'PDF',
            size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
            uploadDate: new Date().toISOString().split('T')[0],
            linkedTo: linkedTo || undefined,
        };
    
        setFolders(currentFolders => currentFolders.map(folder => {
            if (folder.id === selectedFolderId) {
                const updatedDocuments = documentToReplace
                    ? folder.documents.map(d => d.id === documentToReplace.id ? newDoc : d)
                    : [...folder.documents, newDoc];
                return { ...folder, documents: updatedDocuments };
            }
            return folder;
        }));
    };

    const handleDelete = () => {
        if (!documentToDelete) return;
        setFolders(currentFolders => currentFolders.map(folder => {
            if (folder.id === selectedFolderId) {
                return { ...folder, documents: folder.documents.filter(d => d.id !== documentToDelete.id) };
            }
            return folder;
        }));
        setDocumentToDelete(null);
    };

    return (
        <>
            <div className="flex flex-col md:flex-row gap-8">
                <div className="md:w-64 flex-shrink-0">
                    <Card className="p-4">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-brand-text mb-4">Folders</h2>
                        <ul>
                            {folders.map(folder => (
                                <li key={folder.id} 
                                    onClick={() => setSelectedFolderId(folder.id)}
                                    className={`flex items-center p-3 my-1 rounded-lg cursor-pointer transition-colors ${selectedFolderId === folder.id ? 'bg-brand-accent/10 text-brand-accent' : 'text-slate-500 dark:text-brand-text-secondary hover:bg-slate-100 dark:hover:bg-brand-border/50'}`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
                                    <span className="font-medium">{folder.name}</span>
                                </li>
                            ))}
                        </ul>
                    </Card>
                </div>
                <div className="flex-grow">
                    <Card>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-brand-text">{selectedFolder?.name}</h2>
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <div className="relative w-full sm:w-64">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                        <svg className="w-5 h-5 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                                    </div>
                                    <input 
                                        type="text" 
                                        placeholder="Search documents..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="bg-white dark:bg-brand-secondary border border-slate-300 dark:border-brand-border text-slate-900 dark:text-brand-text placeholder-slate-400 dark:placeholder-slate-500 text-sm rounded-lg focus:ring-brand-accent focus:border-brand-accent block w-full pl-10 p-2.5"
                                    />
                                </div>
                                 <button onClick={() => { setDocumentToReplace(null); setIsUploadModalOpen(true); }} className="bg-brand-accent hover:bg-brand-accent-light text-white font-bold py-2.5 px-4 rounded-lg flex items-center justify-center transition-colors text-sm whitespace-nowrap">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                    Upload
                                </button>
                            </div>
                        </div>

                         <div className="overflow-x-auto relative border border-slate-200 dark:border-brand-border rounded-lg">
                            <table className="min-w-full divide-y divide-slate-200 dark:divide-brand-border">
                                <thead className="bg-slate-100 dark:bg-slate-900/60">
                                    <tr>
                                        {([
                                            { key: 'name', label: 'Name'},
                                            { key: 'size', label: 'Size'},
                                            { key: 'uploadDate', label: 'Upload Date'},
                                            { key: 'linkedTo', label: 'Linked To'},
                                        ] as {key: keyof ProjectDocument, label: string}[]).map(({key, label}) => (
                                            <th key={key} scope="col" onClick={() => handleSort(key)} className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-brand-text-secondary uppercase tracking-wider cursor-pointer">
                                                <div className="flex items-center">
                                                    <span>{label}</span>
                                                    {sortConfig?.key === key && (
                                                        <span className="ml-1 text-base leading-none">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                                                    )}
                                                </div>
                                            </th>
                                        ))}
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-brand-text-secondary uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-brand-secondary divide-y divide-slate-200 dark:divide-brand-border">
                                    {filteredAndSortedDocuments.map(doc => (
                                        <tr key={doc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <FileIcon type={doc.type} />
                                                    <span className="font-medium text-slate-800 dark:text-brand-text">{doc.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-brand-text-secondary">{doc.size}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-brand-text-secondary">{new Date(doc.uploadDate).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-brand-text-secondary">{doc.linkedTo || '—'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => { setDocumentToReplace(doc); setIsUploadModalOpen(true); }} className="text-brand-accent hover:text-brand-accent-light dark:text-brand-accent-light dark:hover:text-white" title="Replace document">
                                                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5M4 20h5v-5M20 4h-5v5" /></svg>
                                                    </button>
                                                    <button onClick={() => setDocumentToDelete(doc)} className="text-red-500 hover:text-red-400" title="Remove document">
                                                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            </div>

            <UploadModal 
                isOpen={isUploadModalOpen} 
                onClose={() => setIsUploadModalOpen(false)}
                onUpload={handleUpload}
                documentToReplace={documentToReplace}
            />

            {documentToDelete && (
                 <ConfirmDeleteModal
                    isOpen={!!documentToDelete}
                    onClose={() => setDocumentToDelete(null)}
                    onConfirm={handleDelete}
                    documentName={documentToDelete.name}
                />
            )}
        </>
    );
};

export default Documents;