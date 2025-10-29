import React, { useState, useMemo, useEffect } from 'react';
import { SavedBill, AuthUser, Contract, SavedGrindingBill, FlourMill } from '../types';
import { EditIcon, CashIcon, WalletIcon, DatabaseIcon, DocumentTextIcon, ReportIcon, PlusIcon, ArrowRightIcon, UserGroupIcon, TruckIcon, CurrencyRupeeIcon, BuildingOfficeIcon, ArrowLeftIcon } from './Icons';

type AppView = 'dashboard' | 'newBill' | 'allBills' | 'reports' | 'agOffice';

interface DashboardProps {
    currentUser: AuthUser;
    setCurrentView: (view: AppView) => void;
    onNewBill: () => void;
    savedBills: SavedBill[];
    sanctionedBudget: number;
    setSanctionedBudget: (value: number) => void;
    savedGrindingBills: SavedGrindingBill[];
    grindingSanctionedBudget: number;
    setGrindingSanctionedBudget: (value: number) => void;
    flourMills: FlourMill[];
    contracts: Contract[];
    canCreateAndEdit: boolean;
}

const BudgetSummary: React.FC<{
    savedBills: SavedBill[];
    sanctionedBudget: number;
    setSanctionedBudget: (value: number) => void;
    isAdmin: boolean;
}> = ({ savedBills, sanctionedBudget, setSanctionedBudget, isAdmin }) => {
    const [isEditingBudget, setIsEditingBudget] = useState(false);
    const [budgetInput, setBudgetInput] = useState(sanctionedBudget.toString());
    
    const consumedBudget = useMemo(() => {
        return savedBills.reduce((sum, bill) => sum + bill.netAmount, 0);
    }, [savedBills]);

    const balance = sanctionedBudget - consumedBudget;
    const consumedPercentage = sanctionedBudget > 0 ? (consumedBudget / sanctionedBudget) * 100 : 0;
    
    const handleBudgetSave = () => {
        const newBudgetValue = parseFloat(budgetInput);
        if (!isNaN(newBudgetValue) && newBudgetValue >= 0) {
            setSanctionedBudget(newBudgetValue);
        }
        setIsEditingBudget(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleBudgetSave();
        } else if (e.key === 'Escape') {
            setBudgetInput(sanctionedBudget.toString());
            setIsEditingBudget(false);
        }
    }

    return (
        <div>
            <h3 className="text-lg font-bold text-[var(--color-text-main)] mb-4">TPT Budget Overview</h3>
            
            <div className="space-y-3 text-base mb-4">
                 <div className="flex justify-between items-center group">
                    <span className="text-[var(--color-text-light)] flex items-center"><DatabaseIcon className="h-4 w-4 mr-2 text-[var(--color-text-light)]"/>Sanctioned Budget:</span>
                     {isEditingBudget ? (
                         <input
                             type="number"
                             value={budgetInput}
                             onChange={e => setBudgetInput(e.target.value)}
                             onBlur={handleBudgetSave}
                             onKeyDown={handleKeyDown}
                             className="w-40 text-right px-2 py-0.5"
                             autoFocus
                         />
                     ) : (
                         <div className="flex items-center gap-2">
                            <span className="font-semibold text-[var(--color-text-main)]">Rs. {sanctionedBudget.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                            {isAdmin && <button onClick={() => { setBudgetInput(sanctionedBudget.toString()); setIsEditingBudget(true); }} className="text-[var(--color-text-light)] hover:text-[var(--color-primary)] opacity-0 group-hover:opacity-100 transition-opacity"><EditIcon /></button>}
                         </div>
                     )}
                </div>
                 <div className="flex justify-between">
                    <span className="text-[var(--color-text-light)] flex items-center"><CashIcon className="h-4 w-4 mr-2 text-[var(--color-text-light)]"/>Amount Consumed:</span>
                    <span className="font-semibold text-orange-500">Rs. {consumedBudget.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                 <div className="flex justify-between">
                    <span className="text-[var(--color-text-light)] flex items-center"><WalletIcon className="h-4 w-4 mr-2 text-[var(--color-text-light)]"/>Remaining Balance:</span>
                    <span className={`font-semibold ${balance < 0 ? 'text-[var(--color-danger)]' : 'text-[var(--color-primary)]'}`}>Rs. {balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
            </div>

            <div>
                <div className="w-full bg-slate-200 rounded-full h-2.5">
                    <div 
                        className="bg-[var(--color-primary)] h-2.5 rounded-full" 
                        style={{ width: `${Math.min(consumedPercentage, 100)}%` }}
                    ></div>
                </div>
                <p className="text-sm text-right text-[var(--color-text-light)] mt-1">{consumedPercentage.toFixed(1)}% Consumed</p>
            </div>
        </div>
    );
};


const GrindingBudgetSummary: React.FC<{
    savedGrindingBills: SavedGrindingBill[];
    grindingSanctionedBudget: number;
    setGrindingSanctionedBudget: (value: number) => void;
    isAdmin: boolean;
}> = ({ savedGrindingBills, grindingSanctionedBudget, setGrindingSanctionedBudget, isAdmin }) => {
    const [isEditingBudget, setIsEditingBudget] = useState(false);
    const [budgetInput, setBudgetInput] = useState(grindingSanctionedBudget.toString());

    const consumedBudget = useMemo(() => {
        return savedGrindingBills.reduce((sum, bill) => sum + bill.finalAmountToMill, 0);
    }, [savedGrindingBills]);

    const balance = grindingSanctionedBudget - consumedBudget;
    const consumedPercentage = grindingSanctionedBudget > 0 ? (consumedBudget / grindingSanctionedBudget) * 100 : 0;

    const handleBudgetSave = () => {
        const newBudgetValue = parseFloat(budgetInput);
        if (!isNaN(newBudgetValue) && newBudgetValue >= 0) {
            setGrindingSanctionedBudget(newBudgetValue);
        }
        setIsEditingBudget(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') handleBudgetSave();
        else if (e.key === 'Escape') {
            setBudgetInput(grindingSanctionedBudget.toString());
            setIsEditingBudget(false);
        }
    };

    return (
        <div>
            <h3 className="text-lg font-bold text-green-800 mb-4">Grinding Budget Overview</h3>
            <div className="space-y-3 text-base mb-4">
                <div className="flex justify-between items-center group">
                    <span className="text-gray-500 flex items-center"><DatabaseIcon className="h-4 w-4 mr-2"/>Sanctioned Budget:</span>
                    {isEditingBudget ? (
                        <input type="number" value={budgetInput} onChange={e => setBudgetInput(e.target.value)} onBlur={handleBudgetSave} onKeyDown={handleKeyDown} className="w-40 text-right px-2 py-0.5" autoFocus />
                    ) : (
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-800">Rs. {grindingSanctionedBudget.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                            {isAdmin && <button onClick={() => { setBudgetInput(grindingSanctionedBudget.toString()); setIsEditingBudget(true); }} className="text-gray-400 hover:text-green-600 opacity-0 group-hover:opacity-100 transition-opacity"><EditIcon /></button>}
                        </div>
                    )}
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-500 flex items-center"><CashIcon className="h-4 w-4 mr-2"/>Amount Consumed:</span>
                    <span className="font-semibold text-orange-500">Rs. {consumedBudget.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-500 flex items-center"><WalletIcon className="h-4 w-4 mr-2"/>Remaining Balance:</span>
                    <span className={`font-semibold ${balance < 0 ? 'text-red-600' : 'text-green-700'}`}>Rs. {balance.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                </div>
            </div>
            <div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${Math.min(consumedPercentage, 100)}%` }}></div>
                </div>
                <p className="text-sm text-right text-gray-500 mt-1">{consumedPercentage.toFixed(1)}% Consumed</p>
            </div>
        </div>
    );
};


const StatCard: React.FC<{icon: React.ReactNode; title: string; value: string | number; color: string; delay?: string;}> = ({ icon, title, value, color, delay = '0ms' }) => (
    <div className="card p-5 flex items-center gap-4 animate-fade-in" style={{animationDelay: delay}}>
        <div className={`p-3 rounded-full bg-[${color}]/10 text-[${color}]`}>
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-[var(--color-text-light)]">{title}</p>
            <p className="text-2xl font-bold text-[var(--color-text-main)]">{value}</p>
        </div>
    </div>
);

const ActionButton: React.FC<{icon: React.ReactNode; title: string; description: string; onClick: () => void;}> = ({ icon, title, description, onClick }) => (
    <button onClick={onClick} className="w-full text-left p-4 rounded-lg bg-slate-50 hover:bg-slate-100 hover:border-[var(--color-primary)]/50 transition-all duration-200 group border border-[var(--color-border)] flex justify-between items-center">
        <div className="flex items-center">
            <div className="mr-4 text-[var(--color-primary)]">
                {icon}
            </div>
            <div>
                <h4 className="font-bold text-[var(--color-text-main)]">{title}</h4>
                <p className="text-sm text-[var(--color-text-light)]">{description}</p>
            </div>
        </div>
        <ArrowRightIcon className="h-6 w-6 text-gray-400 group-hover:text-[var(--color-primary)] transition-colors transform group-hover:translate-x-1" />
    </button>
);

const DailyActivityChart: React.FC<{data: { date: string; label: string; amount: number; bills: { bill_number: string; netAmount: number; contractor_name: string }[]; heightPercent: number }[]}> = ({ data }) => {
    if (!data || data.every(d => d.amount === 0)) {
        return <div className="h-64 flex items-center justify-center"><p className="text-center text-gray-500 py-10">No recent bill activity in the last 7 days.</p></div>;
    }

    const maxAmount = Math.max(...data.map(d => d.amount));
    const effectiveMaxAmount = maxAmount === 0 ? 1 : maxAmount;

    const yAxisLabels = [
        { value: effectiveMaxAmount, label: effectiveMaxAmount > 1000 ? `${(effectiveMaxAmount/1000).toFixed(0)}k` : effectiveMaxAmount.toFixed(0) },
        { value: effectiveMaxAmount / 2, label: effectiveMaxAmount > 2000 ? `${(effectiveMaxAmount/2000).toFixed(0)}k` : (effectiveMaxAmount/2).toFixed(0) },
    ];

    return (
        <div className="h-64 flex items-end gap-3 md:gap-4 relative pt-6">
            {/* Y-Axis labels and grid lines */}
            <div className="absolute top-6 left-0 right-0" style={{bottom: '24px'}}>
                {yAxisLabels.map(label => (
                    label.value > 0 &&
                    <div key={label.value} className="absolute w-full" style={{ bottom: `${(label.value / effectiveMaxAmount) * 100}%` }}>
                        <div className="border-t border-dashed border-gray-200 w-full"></div>
                        <span className="absolute -top-3 -left-1 text-xs text-gray-400 bg-white pr-1">{label.label}</span>
                    </div>
                ))}
            </div>
            {/* Bars and X-Axis labels */}
            {data.map(day => (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group relative">
                    {/* Tooltip */}
                    {day.bills.length > 0 && (
                        <div className="absolute bottom-full mb-2 w-max max-w-xs bg-gray-800 text-white text-xs rounded-lg py-2 px-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                            <h4 className="font-bold border-b border-gray-600 pb-1 mb-1">{new Date(day.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</h4>
                            <ul className="space-y-1 max-h-40 overflow-y-auto">
                                {day.bills.map(bill => (
                                    <li key={bill.bill_number} className="flex justify-between gap-2">
                                        <span className="truncate">{bill.contractor_name} ({bill.bill_number})</span>
                                        <span className="font-semibold whitespace-nowrap">Rs. {bill.netAmount.toLocaleString(undefined, {minimumFractionDigits:0, maximumFractionDigits:0})}</span>
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-2 pt-1 border-t border-gray-600 font-bold flex justify-between">
                                <span>Total:</span>
                                <span>Rs. {day.amount.toLocaleString(undefined, {minimumFractionDigits:0, maximumFractionDigits:0})}</span>
                            </div>
                            <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-gray-800 -mb-1"></div>
                        </div>
                    )}
                    {/* Bar */}
                    <div 
                        className="w-full bg-[var(--color-primary-light)] hover:bg-[var(--color-primary)] rounded-t-md transition-all duration-300 cursor-pointer" 
                        style={{ height: `${day.heightPercent}%` }}
                    ></div>
                    {/* Label */}
                    <span className="text-xs font-medium text-gray-500">{day.label}</span>
                </div>
            ))}
        </div>
    );
};

const AGOfficeStats: React.FC<{savedBills: SavedBill[], savedGrindingBills: SavedGrindingBill[], setCurrentView: (view: AppView) => void}> = ({ savedBills, savedGrindingBills, setCurrentView }) => {
    const { sentToday, processedToday } = useMemo(() => {
        const todayStr = new Date().toISOString().split('T')[0];
        const allBills = [...savedBills, ...savedGrindingBills];
        return {
            sentToday: allBills.filter(b => b.agOfficeSentAt?.startsWith(todayStr)).length,
            processedToday: allBills.filter(b => b.agOfficeProcessedAt?.startsWith(todayStr)).length,
        }
    }, [savedBills, savedGrindingBills]);

    return (
        <div className="card p-6 bg-amber-50 border-amber-200 animate-fade-in" style={{animationDelay: '700ms'}}>
            <h3 className="text-lg font-bold text-amber-800 mb-4">AG Office Daily Summary</h3>
            <div className="flex justify-around items-center text-center">
                <div>
                    <p className="text-4xl font-extrabold text-amber-700">{sentToday}</p>
                    <p className="text-sm font-semibold text-amber-600">Bills Sent Today</p>
                </div>
                <div>
                    <p className="text-4xl font-extrabold text-green-700">{processedToday}</p>
                    <p className="text-sm font-semibold text-green-600">Bills Processed Today</p>
                </div>
            </div>
            <button onClick={() => setCurrentView('agOffice')} className="mt-6 w-full flex items-center justify-center gap-2 text-sm font-bold text-amber-800 bg-amber-200/50 hover:bg-amber-200/80 rounded-lg py-2.5 transition-colors">
                Go to AG Office Tray <ArrowRightIcon className="h-5 w-5"/>
            </button>
        </div>
    );
}


const Dashboard: React.FC<DashboardProps> = ({ currentUser, setCurrentView, onNewBill, savedBills, sanctionedBudget, setSanctionedBudget, savedGrindingBills, grindingSanctionedBudget, setGrindingSanctionedBudget, flourMills, contracts, canCreateAndEdit }) => {
    const isAdmin = currentUser.role === 'Admin';
    const isAGOfficeUser = currentUser.role === 'AG Office';

    const stats = useMemo(() => {
        const totalNetAmount = savedBills.reduce((sum, bill) => sum + bill.netAmount, 0);
        const uniqueContractors = new Set(contracts.map(c => c.contractor_name)).size;
        return {
            totalBills: savedBills.length,
            totalNetAmount: `Rs. ${totalNetAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            totalContractors: uniqueContractors,
            totalContracts: contracts.length,
        };
    }, [savedBills, contracts]);
    
    const grindingStats = useMemo(() => {
        const totalNetAmount = savedGrindingBills.reduce((sum, bill) => sum + bill.finalAmountToMill, 0);
        return {
            totalBills: savedGrindingBills.length,
            totalNetAmount: `Rs. ${totalNetAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            totalFlourMills: flourMills.length,
        };
    }, [savedGrindingBills, flourMills]);

    const dailyChartData = useMemo(() => {
        const dailyData = new Map<string, { totalAmount: number, bills: SavedBill[] }>();
        const dates: {date: Date, label: string}[] = [];

        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateString = date.toISOString().split('T')[0];
            dates.push({ date, label: i === 0 ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short' }) });
            dailyData.set(dateString, { totalAmount: 0, bills: [] });
        }

        savedBills.forEach(bill => {
            const billDate = bill.bill_date;
            if (dailyData.has(billDate)) {
                const dayData = dailyData.get(billDate)!;
                dayData.totalAmount += bill.netAmount;
                dayData.bills.push(bill);
            }
        });

        const dataPoints = dates.map(d => {
            const dateString = d.date.toISOString().split('T')[0];
            const dayData = dailyData.get(dateString)!;
            return {
                date: dateString,
                label: d.label,
                amount: dayData.totalAmount,
                bills: dayData.bills.map(b => ({ bill_number: b.bill_number, netAmount: b.netAmount, contractor_name: b.contractor_name }))
            };
        });

        const maxAmount = Math.max(...dataPoints.map(d => d.amount));

        return dataPoints.map(d => ({
            ...d,
            heightPercent: maxAmount > 0 ? (d.amount / maxAmount) * 100 : 0
        }));
    }, [savedBills]);

    return (
        <div className="animate-fade-in">
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-[var(--color-text-main)]">Dashboard</h1>
                <p className="text-lg text-[var(--color-text-light)] mt-1">Welcome back, {currentUser.username}! Here's an overview of your billing activity.</p>
            </div>
            
            {(isAdmin || isAGOfficeUser) && (
                <div className="mb-8">
                    <AGOfficeStats savedBills={savedBills} savedGrindingBills={savedGrindingBills} setCurrentView={setCurrentView} />
                </div>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 card p-6 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                         <BudgetSummary 
                            savedBills={savedBills}
                            sanctionedBudget={sanctionedBudget}
                            setSanctionedBudget={setSanctionedBudget}
                            isAdmin={isAdmin}
                        />
                         <GrindingBudgetSummary
                            savedGrindingBills={savedGrindingBills}
                            grindingSanctionedBudget={grindingSanctionedBudget}
                            setGrindingSanctionedBudget={setGrindingSanctionedBudget}
                            isAdmin={isAdmin}
                         />
                    </div>
                </div>

                <div className="card p-6 flex flex-col justify-between animate-fade-in" style={{animationDelay: '100ms'}}>
                    <h3 className="text-lg font-bold text-[var(--color-text-main)] mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                        {canCreateAndEdit && (
                             <ActionButton 
                                icon={<PlusIcon />}
                                title="Create New Bill"
                                description="Start a new transportation bill."
                                onClick={() => {
                                    onNewBill();
                                    setCurrentView('newBill');
                                }}
                            />
                        )}
                         <ActionButton 
                            icon={<DatabaseIcon className="h-5 w-5" />}
                            title="Manage All Bills"
                            description="View, edit or delete existing bills."
                            onClick={() => setCurrentView('allBills')}
                        />
                         <ActionButton 
                            icon={<ReportIcon className="h-5 w-5" />}
                            title="View Reports"
                            description="Analyze billing data and trends."
                            onClick={() => setCurrentView('reports')}
                        />
                    </div>
                </div>
            </div>

            <div className="mt-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Transportation At a Glance</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                    <StatCard 
                        icon={<DocumentTextIcon className="h-6 w-6" />}
                        title="Total Bills Created"
                        value={stats.totalBills}
                        color="var(--color-primary)"
                        delay="200ms"
                    />
                     <StatCard 
                        icon={<CurrencyRupeeIcon className="h-6 w-6" />}
                        title="Total Net Paid"
                        value={stats.totalNetAmount}
                        color="var(--color-primary)"
                        delay="300ms"
                    />
                     <StatCard 
                        icon={<UserGroupIcon />}
                        title="Total Contractors"
                        value={stats.totalContractors}
                        color="var(--color-accent)"
                        delay="400ms"
                    />
                     <StatCard 
                        icon={<TruckIcon />}
                        title="Active Contracts"
                        value={stats.totalContracts}
                        color="var(--color-danger)"
                        delay="500ms"
                    />
                </div>
            </div>

            <div className="mt-8 card p-6 animate-fade-in" style={{animationDelay: '600ms'}}>
                <h3 className="text-lg font-bold text-[var(--color-text-main)] mb-4">Daily Bill Activity (Last 7 Days)</h3>
                <DailyActivityChart data={dailyChartData} />
            </div>
            
            <div className="mt-8">
                <h2 className="text-2xl font-bold text-green-800 mb-4">Grinding Bills At a Glance</h2>
                 <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                    <StatCard 
                        icon={<DocumentTextIcon className="h-6 w-6" />}
                        title="Total Grinding Bills"
                        value={grindingStats.totalBills}
                        color="#059669" /* green-600 */
                        delay="200ms"
                    />
                    <StatCard 
                        icon={<CurrencyRupeeIcon className="h-6 w-6" />}
                        title="Total Grinding Net Paid"
                        value={grindingStats.totalNetAmount}
                        color="#059669" /* green-600 */
                        delay="300ms"
                    />
                    <StatCard 
                        icon={<BuildingOfficeIcon className="h-6 w-6 mr-0" />}
                        title="Total Flour Mills"
                        value={grindingStats.totalFlourMills}
                        color="#047857" /* green-700 */
                        delay="400ms"
                    />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;