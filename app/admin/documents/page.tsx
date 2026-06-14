'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Trash2, FileText, Image, Video, AudioLines } from 'lucide-react';

type FileItem = {
  id: number;
  filename: string;
  originalName: string;
  mimeType: string | null;
  fileSize: number | null;
  chunkCount: number;
  indexed: boolean;
  includedInRag: boolean;
  uploadedAt: string | null;
};

function getFileIcon(mimeType: string | undefined | null) {
  if (!mimeType) return <FileText className="h-4 w-4 text-muted-foreground" />;
  if (mimeType.startsWith('image/')) return <Image className="h-4 w-4 text-primary" />;
  if (mimeType.startsWith('video/')) return <Video className="h-4 w-4 text-primary" />;
  if (mimeType.startsWith('audio/')) return <AudioLines className="h-4 w-4 text-primary" />;
  return <FileText className="h-4 w-4 text-muted-foreground" />;
}

export default function AdminDocumentsPage() {
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [files, setFiles] = useState<FileItem[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { loadFiles(); }, []);

  async function loadFiles() {
    try {
      const res = await fetch('/api/documents');
      const data = await res.json();
      setFiles(data.files || []);
    } catch { /* ignore */ }
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/documents', { method: 'POST', body: formData });
      const data = await res.json();

      if (data.success) {
        const indexed = data.indexed ? 'Vector indexed' : 'Text stored (keyword search)';
        setUploadResult({
          message: `Uploaded "${data.filename}" (${(data.size / 1024).toFixed(1)} KB) - ${data.chunkCount} chunks - ${indexed}`,
          type: 'success',
        });
      } else {
        setUploadResult({ message: `Error: ${data.error}`, type: 'error' });
      }
      await loadFiles();
    } catch {
      setUploadResult({ message: 'Upload failed', type: 'error' });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this file?')) return;
    await fetch(`/api/documents?id=${id}`, { method: 'DELETE' });
    await loadFiles();
  }

  async function toggleRag(id: number, current: boolean) {
    await fetch('/api/documents', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, includedInRag: !current }),
    });
    await loadFiles();
  }

  function formatSize(bytes: number | null | undefined): string {
    if (!bytes) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function formatDate(dateStr: string | null): string {
    if (!dateStr) return 'Unknown';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Unknown';
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Documents</h1>
        <p className="mt-2 text-muted-foreground">Upload and manage files for RAG. Toggle inclusion in the knowledge base.</p>
      </div>

      <Card className="mb-6">
        <CardHeader><CardTitle>Upload File</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleUpload} className="flex items-end gap-4">
            <div className="flex-1">
              <input
                ref={fileRef}
                type="file"
                className="block w-full text-sm text-muted-foreground file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-primary/90"
                disabled={uploading}
              />
            </div>
            <Button type="submit" disabled={uploading}>
              {uploading ? 'Processing...' : 'Upload & Index'}
            </Button>
          </form>
          {uploadResult && (
            <p className={`mt-3 text-sm ${uploadResult.type === 'success' ? 'text-primary' : 'text-destructive'}`}>
              {uploadResult.message}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Uploaded Files ({files.length})</CardTitle></CardHeader>
        <CardContent>
          {files.length === 0 ? (
            <p className="text-muted-foreground">No files uploaded yet.</p>
          ) : (
            <div className="divide-y divide-border">
              {files.map((f) => (
                <div key={f.id} className="flex items-center justify-between py-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-0.5">{getFileIcon(f.mimeType)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {f.originalName || f.filename}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatSize(f.fileSize)} &middot; {formatDate(f.uploadedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => toggleRag(f.id, f.includedInRag)}
                      className={f.includedInRag ? 'bg-primary/10 text-primary hover:bg-primary/20 border-primary/20' : ''}
                      title={f.includedInRag ? 'Included in RAG' : 'Excluded from RAG'}
                    >
                      <CheckCircle className="h-3.5 w-3.5" />
                      {f.includedInRag ? 'In RAG' : 'Excluded'}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(f.id)} className="text-destructive hover:text-destructive/80 hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
