import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  Download, 
  Upload, 
  Trash2, 
  Image, 
  File,
  X
} from 'lucide-react';
import { useLabWork, LabWorkFile } from '@/hooks/useLabWork';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface LabWorkFilesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  labWorkId: string;
  labWorkTitle: string;
}

export const LabWorkFilesDialog: React.FC<LabWorkFilesDialogProps> = ({ 
  open, 
  onOpenChange, 
  labWorkId, 
  labWorkTitle 
}) => {
  const { getLabWorkFiles, uploadLabWorkFile, downloadLabWorkFile } = useLabWork();
  const { toast } = useToast();
  
  const [files, setFiles] = useState<LabWorkFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (open && labWorkId) {
      fetchFiles();
    }
  }, [open, labWorkId]);

  const fetchFiles = async () => {
    try {
      setIsLoading(true);
      const labWorkFiles = await getLabWorkFiles(labWorkId);
      setFiles(labWorkFiles);
    } catch (error) {
      console.error('Error fetching files:', error);
      toast({
        title: "Error",
        description: "Failed to load files.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = event.target.files;
    if (!uploadedFiles) return;

    setIsUploading(true);
    
    try {
      for (const file of Array.from(uploadedFiles)) {
        if (file.size > 50 * 1024 * 1024) { // 50MB limit
          toast({
            title: "File Too Large",
            description: `${file.name} is larger than 50MB and was skipped.`,
            variant: "destructive",
          });
          continue;
        }

        await uploadLabWorkFile(labWorkId, file);
      }

      toast({
        title: "Success",
        description: "Files uploaded successfully!",
      });
      
      await fetchFiles();
    } catch (error) {
      console.error('Error uploading files:', error);
      toast({
        title: "Error",
        description: "Failed to upload files.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Reset the input
      event.target.value = '';
    }
  };

  const handleDownload = async (file: LabWorkFile) => {
    try {
      await downloadLabWorkFile(file.file_path, file.file_name);
      toast({
        title: "Download Started",
        description: `Downloading ${file.file_name}...`,
      });
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: "Error",
        description: "Failed to download file.",
        variant: "destructive",
      });
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <Image className="w-5 h-5 text-blue-600" />;
    }
    return <File className="w-5 h-5 text-slate-600" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <div className="flex flex-col space-y-1.5 text-center sm:text-left">
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-600" />
            Lab Work Files
          </DialogTitle>
          <DialogDescription>
            Files for: {labWorkTitle}
          </DialogDescription>
        </div>
        
        <div className="space-y-6">
          {/* Upload Section */}
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
            <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-slate-600 mb-2">Upload additional files</p>
            <p className="text-sm text-slate-500 mb-4">
              Supported formats: Images, PDFs, Documents (Max 50MB each)
            </p>
            <input
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload-dialog"
              disabled={isUploading}
            />
            <Button 
              variant="outline" 
              onClick={() => document.getElementById('file-upload-dialog')?.click()}
              disabled={isUploading}
            >
              {isUploading ? 'Uploading...' : 'Choose Files'}
            </Button>
          </div>

          <Separator />

          {/* Files List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Uploaded Files ({files.length})</h3>
              {files.length > 0 && (
                <Badge variant="secondary">
                  Total: {formatFileSize(files.reduce((sum, file) => sum + file.file_size, 0))}
                </Badge>
              )}
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                <p className="mt-2 text-slate-600">Loading files...</p>
              </div>
            ) : files.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <FileText className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                <p>No files uploaded yet</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {files.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {getFileIcon(file.file_type)}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-slate-900 truncate">
                          {file.file_name}
                        </div>
                        <div className="text-sm text-slate-500">
                          {formatFileSize(file.file_size)} • 
                          Uploaded {format(new Date(file.uploaded_at), 'MMM dd, yyyy HH:mm')}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(file)}
                        title="Download File"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};