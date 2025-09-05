import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload, Save, X, Eye, Image, Globe } from 'lucide-react';

interface Setting {
  id: number;
  setting_key: string;
  setting_value: string | null;
  setting_type: 'text' | 'file' | 'json' | 'boolean';
  file_path: string | null;
  description: string | null;
}

interface SettingsFormProps {
  setting: Setting;
  onClose: () => void;
  onUpdate: (updatedSetting: Setting) => void;
}

export const SettingsForm: React.FC<SettingsFormProps> = ({ 
  setting, 
  onClose, 
  onUpdate 
}) => {
  const [loading, setLoading] = useState(false);
  const [formValue, setFormValue] = useState(setting.setting_value || '');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    setting.file_path ? `http://localhost:4000${setting.file_path}` : null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      let updatedSetting = { ...setting };

      if (setting.setting_type === 'file' && selectedFile) {
        // Handle file upload
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('settingKey', setting.setting_key);

        const uploadResponse = await fetch('/api/upload-settings-file', {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload file');
        }

        const uploadResult = await uploadResponse.json();
        
        // Update setting with file path
        const updateResponse = await fetch('/api/settings', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: setting.id,
            setting_key: setting.setting_key,
            setting_value: uploadResult.filePath,
            file_path: uploadResult.filePath,
          }),
        });

        if (!updateResponse.ok) {
          throw new Error('Failed to update setting');
        }

        updatedSetting = {
          ...setting,
          setting_value: uploadResult.filePath,
          file_path: uploadResult.filePath,
        };

        // If this is a favicon, refresh it immediately
        if (setting.setting_key === 'website_favicon') {
          setTimeout(() => {
            window.location.reload();
          }, 500);
        }

      } else if (setting.setting_type === 'text') {
        // Handle text value update
        const updateResponse = await fetch('/api/settings', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: setting.id,
            setting_key: setting.setting_key,
            setting_value: formValue,
          }),
        });

        if (!updateResponse.ok) {
          throw new Error('Failed to update setting');
        }

        updatedSetting = {
          ...setting,
          setting_value: formValue,
        };

        // If this is website title, update document title immediately
        if (setting.setting_key === 'website_title') {
          document.title = formValue;
        }
      }

      onUpdate(updatedSetting);
      toast({
        title: "Setting Updated",
        description: `${setting.setting_key.replace(/_/g, ' ')} has been updated successfully.`,
      });
      onClose();

    } catch (error) {
      console.error('Error updating setting:', error);
      toast({
        title: "Error",
        description: "Failed to update setting. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderFileUpload = () => {
    const isImage = setting.setting_key.includes('favicon') || setting.setting_key.includes('logo');
    
    return (
      <div className="space-y-4">
        {/* Current File Preview */}
        {previewUrl && (
          <div className="border rounded-lg p-4 bg-gray-50">
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              Current {setting.setting_key.includes('favicon') ? 'Favicon' : 'File'}:
            </Label>
            <div className="flex items-center gap-3">
              {isImage ? (
                <img 
                  src={previewUrl} 
                  alt="Current file" 
                  className="w-12 h-12 object-cover border rounded"
                />
              ) : (
                <div className="w-12 h-12 bg-blue-100 border rounded flex items-center justify-center">
                  <Image className="w-6 h-6 text-blue-600" />
                </div>
              )}
              <div>
                <p className="text-sm font-medium">{setting.file_path?.split('/').pop()}</p>
                <p className="text-xs text-gray-500">
                  {setting.setting_key.includes('favicon') ? 'Website Tab Icon' : 'Uploaded File'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* File Upload */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            Upload New {setting.setting_key.includes('favicon') ? 'Favicon' : 'File'}:
          </Label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
            <input
              ref={fileInputRef}
              type="file"
              accept={isImage ? '.ico,.png,.jpg,.jpeg,.svg,.webp' : '*'}
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="mb-2"
            >
              <Upload className="w-4 h-4 mr-2" />
              Choose File
            </Button>
            <p className="text-sm text-gray-500">
              {isImage 
                ? 'Supported formats: ICO, PNG, JPG, JPEG, SVG, WEBP' 
                : 'Choose a file to upload'
              }
            </p>
            {selectedFile && (
              <p className="text-sm text-green-600 mt-2">
                Selected: {selectedFile.name}
              </p>
            )}
          </div>
        </div>

        {setting.setting_key === 'website_favicon' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <Globe className="w-4 h-4 inline mr-1" />
              This will change the icon shown in browser tabs. For best results, use a 32x32 or 16x16 pixel icon.
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderTextInput = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="setting-value" className="text-sm font-medium text-gray-700 mb-2 block">
          {setting.setting_key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
        </Label>
        <Input
          id="setting-value"
          type="text"
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
          placeholder={`Enter ${setting.setting_key.replace(/_/g, ' ')}`}
          className="w-full"
        />
      </div>
      
      {setting.description && (
        <p className="text-sm text-gray-600">
          {setting.description}
        </p>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-white">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              Edit {setting.setting_key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          {setting.setting_type === 'file' ? renderFileUpload() : renderTextInput()}
          
          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1"
              disabled={loading || (setting.setting_type === 'text' && formValue === setting.setting_value)}
            >
              {loading ? (
                "Saving..."
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsForm;
