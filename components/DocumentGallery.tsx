import React, { useState } from 'react';
import { StoredDocument } from '../types';
import { PlusIcon, CloseIcon, UploadIcon, DocumentTextIcon, EyeIcon, DownloadIcon, XCircleIcon } from './Icons';

interface DocumentGalleryProps {
    category: 'budget' | 'orders' | 'notifications';
    documents: StoredDocument[];
    onUpload: (doc: Omit<StoredDocument, 'id' | 'uploadedAt'>) => void;
    onDelete: (docId: string) => void;
    canUpload: boolean;
}

const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

const DocumentGallery: React.FC<DocumentGalleryProps> = ({ category, documents, onUpload, onDelete, canUpload }) => {
    const [isUploadModalOpen, setUploadModalOpen] = useState(false);
    const [isViewModalOpen, setViewModalOpen] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState<StoredDocument | null>(null);

    const handleView = (doc: StoredDocument) => {
        setSelectedDocument(doc);
        setViewModalOpen(true);
    };

    return (
        <div className="card p-4 md:p-6 animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                 {canUpload && (
                    <button
                        onClick={() => setUploadModalOpen(true)}
                        className="flex items-center px-4 py-2 text-sm bg-[var(--color-primary)] text-white font-semibold rounded-lg hover:bg-[var(--color-primary-hover)] shadow-sm"
                    >
                        <UploadIcon /> Upload New
                    </button>
                )}
            </div>
            
            {documents.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {documents.map(doc => (
                        <DocumentCard key={doc.id} doc={doc} onView={handleView} onDelete={onDelete} canDelete={canUpload} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 border-2 border-dashed rounded-lg">
                    <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No documents found</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by uploading a new document.</p>
                </div>
            )}

            {isUploadModalOpen && (
                <UploadModal
                    onClose={() => setUploadModalOpen(false)}
                    onUpload={onUpload}
                    category={category}
                />
            )}
            
            {isViewModalOpen && selectedDocument && (
                <ViewModal
                    doc={selectedDocument}
                    onClose={() => setViewModalOpen(false)}
                />
            )}
        </div>
    );
};

const DocumentCard: React.FC<{ doc: StoredDocument; onView: (doc: StoredDocument) => void; onDelete: (id: string) => void, canDelete: boolean }> = ({ doc, onView, onDelete, canDelete }) => (
    <div className="group relative border rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300">
        <div className="h-40 bg-gray-100 flex items-center justify-center">
            {doc.fileType.startsWith('image/') ? (
                <img src={doc.dataUrl} alt={doc.title} className="h-full w-full object-cover" />
            ) : (
                <DocumentTextIcon className="h-16 w-16 text-gray-300" />
            )}
        </div>
        <div className="p-4 bg-white">
            <h4 className="font-bold text-gray-800 truncate" title={doc.title}>{doc.title}</h4>
            <p className="text-sm text-gray-500 h-10 overflow-hidden">{doc.description || 'No description'}</p>
            <p className="text-xs text-gray-400 mt-2">Uploaded on {new Date(doc.uploadedAt).toLocaleDateString()}</p>
        </div>
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center transition-opacity duration-300">
            <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button onClick={() => onView(doc)} className="p-3 bg-white/80 text-gray-800 rounded-full hover:bg-white" title="View"><EyeIcon/></button>
                <a href={doc.dataUrl} download={doc.fileName} className="p-3 bg-white/80 text-gray-800 rounded-full hover:bg-white" title="Download"><DownloadIcon /></a>
            </div>
        </div>
        {canDelete && <button onClick={() => onDelete(doc.id)} className="absolute top-2 right-2 p-1 bg-white/50 text-gray-700 rounded-full hover:bg-red-500 hover:text-white opacity-0 group-hover:opacity-100 transition-all"><XCircleIcon /></button>}
    </div>
);


const UploadModal: React.FC<{onClose: () => void; onUpload: DocumentGalleryProps['onUpload']; category: DocumentGalleryProps['category']}> = ({ onClose, onUpload, category }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !title) {
            setError('Title and file are required.');
            return;
        }

        try {
            const dataUrl = await fileToDataUrl(file);
            onUpload({
                title,
                description,
                category,
                fileName: file.name,
                fileType: file.type,
                dataUrl,
                uploader: { id: '', username: '' }, // Dummy uploader, parent component will overwrite this
            });
            onClose();
        } catch (err) {
            setError('Failed to read file.');
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
                <header className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold">Upload Document</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200"><CloseIcon/></button>
                </header>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div><label className="block text-sm font-medium">Title <span className="text-red-500">*</span></label><input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full mt-1 px-3 py-2 border rounded" required /></div>
                    <div><label className="block text-sm font-medium">Description</label><textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full mt-1 px-3 py-2 border rounded" rows={3}></textarea></div>
                    <div><label className="block text-sm font-medium">File <span className="text-red-500">*</span></label><input type="file" onChange={e => setFile(e.target.files ? e.target.files[0] : null)} className="w-full mt-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[var(--color-primary-light)] file:text-[var(--color-primary)] hover:file:bg-[var(--color-primary-light)]/80" required /></div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <div className="flex justify-end gap-2 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-md hover:bg-[var(--color-primary-hover)]">Upload</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ViewModal: React.FC<{ doc: StoredDocument; onClose: () => void;}> = ({ doc, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-[60] flex justify-center items-center p-4" onClick={onClose}>
        <div className="relative max-w-4xl max-h-[90vh] w-full h-full" onClick={e => e.stopPropagation()}>
            {doc.fileType.startsWith('image/') ? (
                 <img src={doc.dataUrl} alt={doc.title} className="w-full h-full object-contain" />
            ) : (
                <div className="w-full h-full bg-white rounded-lg flex flex-col items-center justify-center p-8">
                     <DocumentTextIcon className="h-24 w-24 text-gray-300" />
                     <h3 className="mt-4 text-2xl font-bold text-gray-800">{doc.title}</h3>
                     <p className="mt-2 text-lg text-gray-500">{doc.fileName}</p>
                     <p className="mt-1 text-sm text-gray-400">Preview not available for this file type.</p>
                     <a href={doc.dataUrl} download={doc.fileName} className="mt-8 flex items-center px-6 py-3 bg-[var(--color-primary)] text-white font-semibold rounded-lg hover:bg-[var(--color-primary-hover)] shadow-lg"><DownloadIcon /> Download File</a>
                </div>
            )}
             <button onClick={onClose} className="absolute -top-2 -right-2 p-2 bg-white text-gray-800 rounded-full shadow-lg hover:bg-gray-200"><CloseIcon /></button>
        </div>
    </div>
);


export default DocumentGallery;