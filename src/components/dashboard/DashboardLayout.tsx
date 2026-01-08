import { useState } from 'react';
import { Layout } from '@/components/layout';
import { DashboardStats } from './DashboardStats';
import { MyProjectsTab } from './MyProjectsTab';
import { MyPurchasesTab } from './MyPurchasesTab';
import { TransactionsTab } from './TransactionsTab';
import { LayoutDashboard, FolderGit2, ShoppingBag, ArrowLeftRight } from 'lucide-react';

interface DashboardLayoutProps {
  userId: string;
}

type TabId = 'overview' | 'my-projects' | 'purchases' | 'transactions';

interface Tab {
  id: TabId;
  label: string;
  icon: typeof LayoutDashboard;
}

const tabs: Tab[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'my-projects', label: 'My Projects', icon: FolderGit2 },
  { id: 'purchases', label: 'Purchases', icon: ShoppingBag },
  { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
];

export function DashboardLayout({ userId }: DashboardLayoutProps) {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="font-heading text-2xl font-bold text-white mb-2">
                Welcome to your Dashboard
              </h2>
              <p className="text-neutral-400">
                Manage your projects, track purchases, and view your transaction history
              </p>
            </div>
            
            {/* Quick Stats Overview */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="relative bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 rounded-sm p-6">
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent rounded-sm pointer-events-none" />
                <div className="relative">
                  <h3 className="font-heading text-lg font-semibold text-white mb-4">
                    Quick Actions
                  </h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => setActiveTab('my-projects')}
                      className="w-full flex items-center gap-3 p-3 bg-neutral-800/50 hover:bg-neutral-800 border border-neutral-700 hover:border-neutral-600 rounded-sm transition-colors text-left"
                    >
                      <FolderGit2 className="w-5 h-5 text-white" />
                      <span className="text-white">View My Projects</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('purchases')}
                      className="w-full flex items-center gap-3 p-3 bg-neutral-800/50 hover:bg-neutral-800 border border-neutral-700 hover:border-neutral-600 rounded-sm transition-colors text-left"
                    >
                      <ShoppingBag className="w-5 h-5 text-white" />
                      <span className="text-white">View Purchases</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('transactions')}
                      className="w-full flex items-center gap-3 p-3 bg-neutral-800/50 hover:bg-neutral-800 border border-neutral-700 hover:border-neutral-600 rounded-sm transition-colors text-left"
                    >
                      <ArrowLeftRight className="w-5 h-5 text-white" />
                      <span className="text-white">View Transactions</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="relative bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 rounded-sm p-6">
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent rounded-sm pointer-events-none" />
                <div className="relative">
                  <h3 className="font-heading text-lg font-semibold text-white mb-4">
                    Getting Started
                  </h3>
                  <ul className="space-y-2 text-sm text-neutral-400">
                    <li className="flex items-start gap-2">
                      <span className="text-white">•</span>
                      <span>Upload your first project to start earning</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-white">•</span>
                      <span>Browse the marketplace to discover projects</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-white">•</span>
                      <span>Connect your wallet to make purchases</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-white">•</span>
                      <span>Track your earnings in the transactions tab</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );
      case 'my-projects':
        return <MyProjectsTab userId={userId} />;
      case 'purchases':
        return <MyPurchasesTab userId={userId} />;
      case 'transactions':
        return <TransactionsTab userId={userId} />;
      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-black">
        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar with Stats */}
            <div className="lg:col-span-1">
              <div className="relative bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 rounded-sm p-6 sticky top-24">
                {/* Glass effect overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent rounded-sm pointer-events-none" />
                
                <div className="relative">
                  <h2 className="font-heading text-xl font-bold text-white mb-6">
                    Dashboard
                  </h2>
                  
                  {/* User Stats */}
                  <DashboardStats userId={userId} />
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Tab Navigation */}
              <div className="flex items-center gap-2 mb-8 border-b border-neutral-800 pb-4 overflow-x-auto">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        flex items-center gap-2 px-4 py-2 rounded-sm transition-colors whitespace-nowrap
                        ${isActive 
                          ? 'bg-white text-black font-medium' 
                          : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
                        }
                      `}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Tab Content */}
              <div className="space-y-6">
                {renderTabContent()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
