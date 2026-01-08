import { useState } from 'react';
import { Layout } from '@/components/layout';
import { UserProfile, ProfileEditor, WalletConnection } from '@/components/profile';
import { useAuth } from '@/hooks/useAuth';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Edit, User, Wallet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

/**
 * ProfileManagement page demonstrates the new profile management components.
 * This page shows how to use UserProfile, ProfileEditor, and WalletConnection components.
 */
export default function ProfileManagement() {
  const { isAuthenticated, userProfile, userId } = useAuth();
  const { registerUser } = useUser();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  // Handle profile save
  const handleSaveProfile = async (updates: { name?: string; avatar?: string }) => {
    if (!userId) {
      toast({
        title: 'Error',
        description: 'User ID not found. Please log in again.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Call API to update user profile
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_BASE}/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const result = await response.json();

      if (result.success) {
        // Update local storage with new profile data
        const updatedProfile = { ...userProfile, ...updates };
        localStorage.setItem('layR_userProfile', JSON.stringify(updatedProfile));
        
        // Refresh user data
        await registerUser();
        
        setIsEditing(false);
      } else {
        throw new Error(result.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
      throw error;
    }
  };

  // Handle wallet connection
  const handleWalletConnected = async (address: string) => {
    console.log('Wallet connected:', address);
    // Refresh user profile to show updated wallet status
    await registerUser();
  };

  // Handle wallet disconnection
  const handleWalletDisconnected = async () => {
    console.log('Wallet disconnected');
    // Refresh user profile to show updated wallet status
    await registerUser();
  };

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Authentication Required</h1>
            <p className="text-neutral-400">Please log in to view your profile.</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!userProfile) {
    return (
      <Layout>
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Loading Profile...</h1>
            <p className="text-neutral-400">Please wait while we load your profile.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-black">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Profile Management</h1>
            <p className="text-neutral-400">
              Manage your profile information and wallet connection
            </p>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="view" className="space-y-6">
            <TabsList className="bg-neutral-900 border border-neutral-800">
              <TabsTrigger value="view" className="data-[state=active]:bg-neutral-800">
                <User className="w-4 h-4 mr-2" />
                View Profile
              </TabsTrigger>
              <TabsTrigger value="edit" className="data-[state=active]:bg-neutral-800">
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </TabsTrigger>
              <TabsTrigger value="wallet" className="data-[state=active]:bg-neutral-800">
                <Wallet className="w-4 h-4 mr-2" />
                Wallet
              </TabsTrigger>
            </TabsList>

            {/* View Profile Tab */}
            <TabsContent value="view" className="space-y-6">
              <UserProfile profile={userProfile} />
              
              <div className="flex justify-end">
                <Button
                  onClick={() => setIsEditing(true)}
                  className="bg-white text-black hover:bg-neutral-200"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            </TabsContent>

            {/* Edit Profile Tab */}
            <TabsContent value="edit" className="space-y-6">
              <ProfileEditor
                profile={userProfile}
                onSave={handleSaveProfile}
                onCancel={() => setIsEditing(false)}
              />
            </TabsContent>

            {/* Wallet Tab */}
            <TabsContent value="wallet" className="space-y-6">
              <WalletConnection
                onWalletConnected={handleWalletConnected}
                onWalletDisconnected={handleWalletDisconnected}
              />
            </TabsContent>
          </Tabs>

          {/* Info Section */}
          <div className="mt-8 p-6 bg-neutral-900/50 border border-neutral-800 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-2">About Profile Management</h3>
            <div className="space-y-2 text-sm text-neutral-400">
              <p>
                • Your profile is based on your authentication (Google/Email), not your wallet
              </p>
              <p>
                • Your wallet is used for payments only and can be connected/disconnected independently
              </p>
              <p>
                • Connecting or disconnecting your wallet does not change your profile name or email
              </p>
              <p>
                • You can edit your name and avatar, but your email cannot be changed
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
