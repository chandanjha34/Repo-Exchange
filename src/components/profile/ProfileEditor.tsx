import { useState } from 'react';
import { UserProfile } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProfileEditorProps {
  profile: UserProfile;
  onSave: (updates: { name?: string; avatar?: string }) => Promise<void>;
  onCancel?: () => void;
}

/**
 * ProfileEditor component allows editing user name and avatar.
 * Email is disabled and cannot be edited.
 * 
 * Requirements: 3.2 - Allow editing name and avatar, disable email editing
 */
export function ProfileEditor({ profile, onSave, onCancel }: ProfileEditorProps) {
  const [name, setName] = useState(profile.name);
  const [avatar, setAvatar] = useState(profile.avatar || '');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Get initials for avatar fallback
  const getInitials = (nameStr: string) => {
    return nameStr
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Check if there are changes
  const hasChanges = name !== profile.name || avatar !== (profile.avatar || '');

  // Handle save
  const handleSave = async () => {
    if (!hasChanges) {
      toast({
        title: 'No changes',
        description: 'No changes were made to your profile.',
      });
      return;
    }

    // Validate name
    if (!name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Name cannot be empty.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);

    try {
      const updates: { name?: string; avatar?: string } = {};
      
      if (name !== profile.name) {
        updates.name = name.trim();
      }
      
      if (avatar !== (profile.avatar || '')) {
        updates.avatar = avatar.trim() || undefined;
      }

      await onSave(updates);

      toast({
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated.',
      });
    } catch (error) {
      console.error('Failed to save profile:', error);
      toast({
        title: 'Save Failed',
        description: 'Failed to update your profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setName(profile.name);
    setAvatar(profile.avatar || '');
    onCancel?.();
  };

  return (
    <Card className="bg-neutral-900/50 border-neutral-800">
      <CardHeader>
        <CardTitle className="text-white">Edit Profile</CardTitle>
        <CardDescription className="text-neutral-400">
          Update your name and avatar. Your email cannot be changed.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar Preview */}
        <div className="flex items-center gap-4">
          <Avatar className="w-20 h-20 border-2 border-neutral-700">
            <AvatarImage src={avatar || profile.avatar} alt={name} />
            <AvatarFallback className="bg-neutral-800 text-white text-lg">
              {getInitials(name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Label htmlFor="avatar" className="text-white">Avatar URL</Label>
            <Input
              id="avatar"
              type="url"
              placeholder="https://example.com/avatar.jpg"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              className="bg-neutral-800 border-neutral-700 text-white mt-1"
            />
            <p className="text-xs text-neutral-400 mt-1">
              Enter a URL to your profile picture
            </p>
          </div>
        </div>

        {/* Name Field */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-white">
            Name <span className="text-red-400">*</span>
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-neutral-800 border-neutral-700 text-white"
            required
          />
        </div>

        {/* Email Field (Disabled) */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-white">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={profile.email}
            disabled
            className="bg-neutral-800/50 border-neutral-700 text-neutral-500 cursor-not-allowed"
          />
          <p className="text-xs text-neutral-400">
            Email cannot be changed
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className="flex-1 bg-white text-black hover:bg-neutral-200"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
          {onCancel && (
            <Button
              onClick={handleCancel}
              variant="outline"
              disabled={isSaving}
              className="border-neutral-700 text-white hover:bg-neutral-800"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
