import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Contract } from '../types';
import { CloseIcon, PlusIcon, UploadIcon, TrashIcon, InfoIcon, DownloadIcon, EditIcon, ClipboardCheckIcon, XCircleIcon } from './Icons';
import * as Papa from 'papaparse';
import * as XLSX from 'xlsx';


interface ContractManagerProps {
    isOpen: boolean;
    onClose: () => void;
    contracts: Contract[];
    setContracts: (value: Contract[] | ((val: Contract[]) => Contract[])) => void;
    logAction: (action: string, details?: Record<string, any>) => void;
    setNotification: (notification: { message: string; type: 'success' | 'error' } | null) => void;
}

const emptyContract: Omit<Contract, 'contract_id' | 'contractor_id'> = {
    sanctioned_no: '',
    contractor_name: '',
    from_location: '',
    to_location: '',
    rate_per_kg: 0,
    effective_date: new Date().toISOString().split('T')[0],
    status: 'Active',
};


const ContractManager: React.FC<ContractManagerProps> = ({ isOpen, onClose, contracts, setContracts, logAction, setNotification }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [uploadStatus, setUploadStatus] = useState({ error: '', success: '', inProgress: false });
    const [selectedContractIds, setSelectedContractIds] = useState<Set<number>>(new Set());
    const mergeFileInputRef = useRef<HTMLInputElement>(null);
    const replaceFileInputRef = useRef<HTMLInputElement>(null);

    const [editingId, setEditingId] = useState<number | null>(null);
    const [editedContract, setEditedContract] = useState<Contract | null>(null);

    useEffect(() => {
        if (isOpen) {
            setSearchQuery('');
            setSelectedContractIds(new Set());
            setUploadStatus({ error: '', success: '', inProgress: false });
            setEditingId(null);
            setEditedContract(null);
        }
    }, [isOpen]);

    const filteredContracts = useMemo(() => {
        const sortedContracts = [...contracts].sort((a, b) => a.contractor_name.localeCompare(b.contractor_name) || a.from_location.localeCompare(b.from_location));
        if (!searchQuery) return sortedContracts;
        const lowercasedQuery = searchQuery.toLowerCase();
        return sortedContracts.filter(c => 
            c.sanctioned_no.toLowerCase().includes(lowercasedQuery) ||
            c.contractor_name.toLowerCase().includes(lowercasedQuery) ||
            c.from_location.toLowerCase().includes(lowercasedQuery) ||
            c.to_location.toLowerCase().includes(lowercasedQuery) ||
            String(c.rate_per_kg).includes(lowercasedQuery)
        );
    }, [contracts, searchQuery]);
    
    const filteredContractIds = useMemo(() => new Set(filteredContracts.map(c => c.contract_id)), [filteredContracts]);
    const isAllFilteredSelected = filteredContractIds.size > 0 && Array.from(filteredContractIds).every(id => selectedContractIds.has(id));
    
    if (!isOpen) return null;

    const handleStartEdit = (contract: Contract) => {
        setEditingId(contract.contract_id);
        setEditedContract({ ...contract });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditedContract(null);
    };

    const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        if (!editedContract) return;

        const { name, value } = e.target;
        let finalValue: string | number = value;
        if (e.target.type === 'number') {
            finalValue = parseFloat(value) || 0;
        }

        setEditedContract({
            ...editedContract,
            [name]: finalValue,
        });
    };

    const handleSaveEdit = () => {
        if (!editedContract || editingId === null) return;
        
        const oldContract = contracts.find(c => c.contract_id === editingId);
        setContracts(prev => prev.map(c => c.contract_id === editingId ? editedContract : c));
        logAction('Contract Updated', { contractId: editingId, oldValue: oldContract, newValue: editedContract });
        setNotification({ message: `Contract for '${editedContract.contractor_name}' updated.`, type: 'success' });

        setEditingId(null);
        setEditedContract(null);
    };

    const handleDelete = (id: number) => {
        if (window.confirm('Are you sure you want to delete this contract?')) {
            const contractToDelete = contracts.find(c => c.contract_id === id);
            setContracts(prevContracts => prevContracts.filter(c => c.contract_id !== id));
            setSelectedContractIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(id);
                return newSet;
            });
            if (contractToDelete) {
                logAction('Contract Deleted', { contractId: id, contractor: contractToDelete.contractor_name });
                setNotification({ message: `Contract for '${contractToDelete.contractor_name}' deleted.`, type: 'success' });
            }
        }
    };
    
    const handleDeleteAll = () => {
        if (window.confirm('DANGER: Are you sure you want to delete ALL contracts? This will empty the contract list completely. This action cannot be undone.')) {
            const count = contracts.length;
            setContracts([]);
            logAction('All Contracts Deleted', { count });
            setSelectedContractIds(new Set());
            setNotification({ message: `${count} contracts have been deleted successfully. The list is now empty.`, type: 'success' });
        }
    };

    const handleBulkDeleteSelected = () => {
        if (selectedContractIds.size === 0) return;
        if (window.confirm(`Are you sure you want to delete ${selectedContractIds.size} selected contract(s)? This action cannot be undone.`)) {
            const contractsToDelete = contracts.filter(c => selectedContractIds.has(c.contract_id));
            const count = selectedContractIds.size;
            setContracts(prev => prev.filter(c => !selectedContractIds.has(c.contract_id)));
            logAction('Contracts Bulk Deleted', {
                count: selectedContractIds.size,
                deletedContractIds: Array.from(selectedContractIds),
                deletedContractDetails: contractsToDelete.map(c => ({
                    id: c.contract_id,
                    name: c.contractor_name,
                    route: `${c.from_location} to ${c.to_location}`
                }))
            });
            setSelectedContractIds(new Set());
            setNotification({ message: `${count} selected contracts deleted.`, type: 'success' });
        }
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedContractIds(prev => new Set([...Array.from(prev), ...filteredContractIds]));
        } else {
            const newSet = new Set(selectedContractIds);
            filteredContractIds.forEach(id => newSet.delete(id));
            setSelectedContractIds(newSet);
        }
    };

    const handleSelectOne = (contractId: number) => {
        setSelectedContractIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(contractId)) {
                newSet.delete(contractId);
            } else {
                newSet.add(contractId);
            }
            return newSet;
        });
    };

    const HEADER_MAPPING: { [key in keyof Omit<Contract, 'contract_id'>]: string[] } = {
        sanctioned_no: ['sanctioned no', 'sanctioned_no', 'sanction no'],
        contractor_id: ['contractor id', 'contractor_id'],
        contractor_name: ['contractor name', 'contractor_name', 'contractor'],
        from_location: ['from location', 'from_location', 'from'],
        to_location: ['to location', 'to_location', 'to'],
        rate_per_kg: ['rate per kg', 'rate_per_kg', 'rate', 'rate/kg'],
        effective_date: ['effective date', 'effective_date', 'date'],
        status: ['status'],
    };

    const findValue = (row: any, keys: string[]) => {
        const rowKeys = Object.keys(row).map(k => k.toLowerCase().trim());
        for (const key of keys) {
            const normalizedKey = key.toLowerCase().trim();
            const index = rowKeys.indexOf(normalizedKey);
            if (index > -1) return row[Object.keys(row)[index]];
        }
        return undefined;
    };
    
    const parseFileToContracts = (data: string | ArrayBuffer, fileName: string): Partial<Omit<Contract, 'contract_id'>>[] => {
        let parsedData: any[];

        if (fileName.toLowerCase().endsWith('.json')) {
            parsedData = JSON.parse(data as string);
        } else if (fileName.toLowerCase().endsWith('.csv')) {
            const result = Papa.parse(data as string, { header: true, skipEmptyLines: true, dynamicTyping: true });
            if (result.errors.length > 0) console.warn("CSV parsing errors:", result.errors);
            parsedData = result.data;
        } else { // Excel
            const workbook = XLSX.read(data, { type: 'binary', cellDates: true });
            const sheetName = workbook.SheetNames[0];
            parsedData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
        }
        
        if (!Array.isArray(parsedData)) throw new Error("File must contain an array of contract objects.");

        return parsedData.map((row): Partial<Omit<Contract, 'contract_id'>> | null => {
            const contract: any = {};
            for (const key in HEADER_MAPPING) {
                contract[key] = findValue(row, HEADER_MAPPING[key as keyof typeof HEADER_MAPPING]);
            }
            if (!contract.contractor_name || !contract.from_location || !contract.to_location) return null;
            
            contract.rate_per_kg = contract.rate_per_kg !== undefined ? parseFloat(contract.rate_per_kg) : undefined;
            contract.contractor_id = contract.contractor_id !== undefined ? parseInt(contract.contractor_id) : undefined;
            contract.status = (contract.status === 'Active' || contract.status === 'Inactive') ? contract.status : 'Active';
            
            let parsedDate;
            if (contract.effective_date instanceof Date) parsedDate = contract.effective_date;
            else if (typeof contract.effective_date === 'number') parsedDate = new Date(Date.UTC(1899, 11, 30) + contract.effective_date * 24 * 60 * 60 * 1000);
            else if (contract.effective_date) parsedDate = new Date(contract.effective_date);

            if (parsedDate && !isNaN(parsedDate.getTime())) {
                contract.effective_date = parsedDate.toISOString().split('T')[0];
            } else {
                contract.effective_date = undefined;
            }
            return contract as Partial<Omit<Contract, 'contract_id'>>;
        }).filter((c): c is Partial<Omit<Contract, 'contract_id'>> => c !== null);
    };

    const processFile = (file: File, mode: 'merge' | 'replace') => {
        setUploadStatus({ error: '', success: '', inProgress: true });
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                if (!data) throw new Error("Could not read file.");
                const importedContracts = parseFileToContracts(data, file.name);
                if (importedContracts.length === 0) throw new Error('No valid contract data found. Check file headers.');
                
                if (mode === 'merge') {
                    setContracts(currentContracts => {
                        let updatedCount = 0, addedCount = 0;
                        const contractMap: Map<string, Contract> = new Map(currentContracts.map(c => [`${c.contractor_name}|${c.from_location}|${c.to_location}`.toLowerCase().trim(), c]));
                        let nextId = currentContracts.length > 0 ? Math.max(...currentContracts.map(c => c.contract_id)) + 1 : 1;
                        
                        for (const newContractData of importedContracts) {
                            const key = `${newContractData.contractor_name}|${newContractData.from_location}|${newContractData.to_location}`.toLowerCase().trim();
                            const existing = contractMap.get(key);
                            if (existing) {
                                contractMap.set(key, { ...existing, ...newContractData });
                                updatedCount++;
                            } else {
                                contractMap.set(key, { ...emptyContract, ...newContractData, contract_id: nextId++, contractor_id: newContractData.contractor_id || 0 });
                                addedCount++;
                            }
                        }
                        const newList = Array.from(contractMap.values());
                        logAction('Contracts Merged from File', { filename: file.name, added: addedCount, updated: updatedCount });
                        setUploadStatus({ success: `Merge successful! ${addedCount} added, ${updatedCount} updated.`, error: '', inProgress: false });
                        return newList;
                    });
                } else { // Replace
                    if (window.confirm(`DANGER: This will replace all ${contracts.length} existing contracts with ${importedContracts.length} from "${file.name}". Are you sure?`)) {
                        const newContractsWithIds = importedContracts.map((c, index) => ({...emptyContract, ...c, contract_id: index + 1, contractor_id: c.contractor_id || 0 }));
                        setContracts(newContractsWithIds);
                        logAction('Contracts Replaced from File', { filename: file.name, count: newContractsWithIds.length });
                        setUploadStatus({ success: `Success! Replaced all contracts with ${newContractsWithIds.length} from file.`, error: '', inProgress: false });
                    } else {
                        setUploadStatus({ error: '', success: '', inProgress: false });
                    }
                }
            } catch (error) {
                setUploadStatus({ error: error instanceof Error ? error.message : 'Failed to parse file.', success: '', inProgress: false });
            } finally {
                if(mergeFileInputRef.current) mergeFileInputRef.current.value = "";
                if(replaceFileInputRef.current) replaceFileInputRef.current.value = "";
            }
        };

        reader.onerror = () => setUploadStatus({ error: 'Error reading file.', success: '', inProgress: false });
        if (file.name.toLowerCase().endsWith('.csv') || file.name.toLowerCase().endsWith('.json')) reader.readAsText(file);
        else reader.readAsBinaryString(file);
    };

    const handleDownloadExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(contracts);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Contracts");
        XLSX.writeFile(workbook, `FDBMS-Contracts-Backup-${new Date().toISOString().split('T')[0]}.xlsx`);
        logAction('Contracts Downloaded (Excel)', { count: contracts.length });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-full max-h-[95vh] flex flex-col">
                <header className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-2xl font-bold">Contract Management</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200"><CloseIcon /></button>
                </header>

                <div className="p-4 flex-1 overflow-y-auto">
                    <div className="space-y-6">
                        <div>
                            <div className="mb-4">
                                <h3 className="text-xl font-semibold">All Contracts ({filteredContracts.length})</h3>
                                <input type="text" placeholder="Search by sanctioned no, contractor, location, or rate..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                            </div>
                            
                            {selectedContractIds.size > 0 && (
                                <div className="mb-4 flex items-center gap-4 bg-blue-50 p-3 rounded-lg border border-blue-200">
                                    <p className="text-sm font-semibold text-blue-800 flex-1">{selectedContractIds.size} contract(s) selected.</p>
                                    <button onClick={handleBulkDeleteSelected} className="flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 border rounded-lg shadow-sm hover:bg-red-700"><TrashIcon className="h-5 w-5 mr-2" /> Delete Selected</button>
                                </div>
                            )}
                        </div>

                        <div className="overflow-x-auto border rounded-lg max-h-[40vh]">
                            <table className="min-w-full divide-y"><thead className="bg-gray-50 sticky top-0">
                                <tr>
                                    <th className="px-4 py-2"><input type="checkbox" className="h-4 w-4 rounded" checked={isAllFilteredSelected} onChange={handleSelectAll} disabled={filteredContractIds.size === 0}/></th>
                                    <th className="px-4 py-2 text-left text-xs font-medium uppercase">Contractor</th><th className="px-4 py-2 text-left text-xs font-medium uppercase">Route</th><th className="px-4 py-2 text-left text-xs font-medium uppercase">Rate/Kg</th><th className="px-4 py-2 text-left text-xs font-medium uppercase">Status</th><th className="px-4 py-2 text-center text-xs font-medium uppercase">Actions</th></tr></thead>
                                <tbody className="bg-white divide-y">
                                    {filteredContracts.map(c => (
                                        editingId === c.contract_id && editedContract ? (
                                            <tr key={c.contract_id} className="bg-blue-50">
                                                <td className="px-4 py-2"></td>
                                                <td className="px-4 py-2"><input type="text" name="contractor_name" value={editedContract.contractor_name} onChange={handleFieldChange} className="w-full p-1 border rounded"/></td>
                                                <td className="px-4 py-2"><div className="flex items-center gap-2"><input type="text" name="from_location" value={editedContract.from_location} onChange={handleFieldChange} className="w-full p-1 border rounded"/><span>→</span><input type="text" name="to_location" value={editedContract.to_location} onChange={handleFieldChange} className="w-full p-1 border rounded"/></div></td>
                                                <td className="px-4 py-2"><input type="number" step="0.0001" name="rate_per_kg" value={editedContract.rate_per_kg} onChange={handleFieldChange} className="w-24 p-1 border rounded text-right"/></td>
                                                <td className="px-4 py-2"><select name="status" value={editedContract.status} onChange={handleFieldChange} className="w-full p-1 border rounded bg-white"><option value="Active">Active</option><option value="Inactive">Inactive</option></select></td>
                                                <td className="px-4 py-2 whitespace-nowrap text-center space-x-2">
                                                    <button onClick={handleSaveEdit} className="p-1 text-green-600 hover:text-green-800" title="Save"><ClipboardCheckIcon className="h-6 w-6" /></button>
                                                    <button onClick={handleCancelEdit} className="p-1 text-gray-500 hover:text-gray-700" title="Cancel"><XCircleIcon className="h-6 w-6" /></button>
                                                </td>
                                            </tr>
                                        ) : (
                                            <tr key={c.contract_id} className={`hover:bg-gray-50 ${selectedContractIds.has(c.contract_id) ? 'bg-blue-50' : ''}`}>
                                                <td className="px-4 py-2"><input type="checkbox" className="h-4 w-4 rounded" checked={selectedContractIds.has(c.contract_id)} onChange={() => handleSelectOne(c.contract_id)}/></td>
                                                <td className="px-4 py-2 whitespace-nowrap font-medium">{c.contractor_name}</td>
                                                <td className="px-4 py-2 whitespace-nowrap">{c.from_location} → {c.to_location}</td>
                                                <td className="px-4 py-2 whitespace-nowrap font-mono">{c.rate_per_kg.toFixed(4)}</td>
                                                <td className="px-4 py-2 whitespace-nowrap"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${c.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{c.status}</span></td>
                                                <td className="px-4 py-2 whitespace-nowrap text-center space-x-2">
                                                    <button onClick={() => handleStartEdit(c)} className="p-1 text-blue-600 hover:text-blue-800" title="Edit"><EditIcon className="h-6 w-6" /></button>
                                                    <button onClick={() => handleDelete(c.contract_id)} className="p-1 text-[var(--color-danger)] hover:text-[var(--color-danger-hover)]" title="Delete"><TrashIcon /></button>
                                                </td>
                                            </tr>
                                        )
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="p-4 border-t-2 mt-6">
                            <h3 className="text-xl font-semibold mb-4 text-center">Manage Contracts with Excel</h3>
                            {(uploadStatus.error || uploadStatus.success) && (<div className={`p-3 rounded-md text-center mb-4 ${uploadStatus.error ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>{uploadStatus.error || uploadStatus.success}</div>)}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="p-4 border rounded-lg bg-gray-50 flex flex-col items-center text-center">
                                    <h4 className="font-semibold text-lg">1. Download Template</h4>
                                    <p className="text-sm text-gray-500 my-2 flex-1">Download all current contracts as an Excel file. Use this file as a template for making changes or adding new contracts.</p>
                                    <button onClick={handleDownloadExcel} className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md shadow-sm hover:bg-green-700"><DownloadIcon className="h-5 w-5 mr-2" /> Download Contracts</button>
                                </div>
                                <div className="p-4 border rounded-lg bg-gray-50 flex flex-col items-center text-center">
                                    <h4 className="font-semibold text-lg">2. Upload &amp; Update</h4>
                                    <p className="text-sm text-gray-500 my-2 flex-1">Upload the edited Excel file. The system will add new contracts and update existing ones automatically. This is the recommended way to make bulk changes.</p>
                                    <input type="file" ref={mergeFileInputRef} className="hidden" accept=".xlsx, .xls, .csv, .json" onChange={e => e.target.files && processFile(e.target.files[0], 'merge')} />
                                    <button onClick={() => mergeFileInputRef.current?.click()} disabled={uploadStatus.inProgress} className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 disabled:bg-gray-400"><UploadIcon className="h-5 w-5 mr-2"/> {uploadStatus.inProgress ? 'Processing...' : 'Upload and Merge'}</button>
                                </div>
                                <div className="p-4 border-2 border-red-300 rounded-lg bg-red-50 flex flex-col items-center text-center">
                                    <h4 className="font-semibold text-lg text-red-800">Danger Zone</h4>
                                    <p className="text-sm text-red-600 my-2 flex-1">These actions are destructive and cannot be undone. <strong className="font-bold">Proceed with caution.</strong></p>
                                    <div className="w-full space-y-2">
                                        <input type="file" ref={replaceFileInputRef} className="hidden" accept=".xlsx, .xls, .csv, .json" onChange={e => e.target.files && processFile(e.target.files[0], 'replace')} />
                                        <button onClick={() => replaceFileInputRef.current?.click()} disabled={uploadStatus.inProgress} className="w-full flex items-center justify-center px-4 py-2 bg-orange-600 text-white rounded-md shadow-sm hover:bg-orange-700 disabled:bg-gray-400">Replace All from File</button>
                                        <button onClick={handleDeleteAll} className="w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md shadow-sm hover:bg-red-700"><TrashIcon className="h-5 w-5 mr-2"/> Delete All Contracts</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContractManager;