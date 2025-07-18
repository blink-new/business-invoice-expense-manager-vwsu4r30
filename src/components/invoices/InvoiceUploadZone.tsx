import { useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Upload, FileText, X, CheckCircle } from 'lucide-react'
import { useInvoices } from '@/hooks/useInvoices'
import { toast } from 'sonner'

interface InvoiceUploadZoneProps {
  onUploadComplete?: (fileUrl: string, extractedText: string) => void
}

export function InvoiceUploadZone({ onUploadComplete }: InvoiceUploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ name: string; url: string; text: string }>>([])
  
  const { uploadInvoiceFile } = useInvoices()

  const uploadFile = useCallback(async (file: File) => {
    try {
      setIsUploading(true)
      setUploadProgress(0)

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const result = await uploadInvoiceFile(file)
      
      clearInterval(progressInterval)
      setUploadProgress(100)

      const uploadedFile = {
        name: file.name,
        url: result.fileUrl,
        text: result.extractedText
      }

      setUploadedFiles(prev => [...prev, uploadedFile])
      
      if (onUploadComplete) {
        onUploadComplete(result.fileUrl, result.extractedText)
      }

      toast.success(`${file.name} uploaded successfully`)
      
      // Reset progress after a delay
      setTimeout(() => {
        setUploadProgress(0)
        setIsUploading(false)
      }, 1000)

    } catch (error) {
      console.error('Upload failed:', error)
      toast.error(`Failed to upload ${file.name}`)
      setIsUploading(false)
      setUploadProgress(0)
    }
  }, [uploadInvoiceFile, onUploadComplete])

  const handleFiles = useCallback(async (files: File[]) => {
    const validFiles = files.filter(file => {
      const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg']
      const maxSize = 10 * 1024 * 1024 // 10MB
      
      if (!validTypes.includes(file.type)) {
        toast.error(`${file.name}: Unsupported file type. Please use PDF, PNG, or JPG.`)
        return false
      }
      
      if (file.size > maxSize) {
        toast.error(`${file.name}: File too large. Maximum size is 10MB.`)
        return false
      }
      
      return true
    })

    for (const file of validFiles) {
      await uploadFile(file)
    }
  }, [uploadFile])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    await handleFiles(files)
  }, [handleFiles])

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    await handleFiles(files)
  }, [handleFiles])

  const removeUploadedFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Invoice</CardTitle>
        <CardDescription>
          Drag and drop your invoice files here or click to browse
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
            isDragOver
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-muted-foreground/50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-upload')?.click()}
        >
          <Upload className={`h-12 w-12 mx-auto mb-4 ${isDragOver ? 'text-primary' : 'text-muted-foreground'}`} />
          <p className="text-lg font-medium mb-2">
            {isDragOver ? 'Drop files here' : 'Drop files here to upload'}
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            Supports PDF, PNG, JPG files up to 10MB
          </p>
          <Button variant="outline" type="button">
            Browse Files
          </Button>
          <input
            id="file-upload"
            type="file"
            multiple
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {isUploading && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="w-full" />
          </div>
        )}

        {uploadedFiles.length > 0 && (
          <div className="mt-6 space-y-3">
            <h4 className="font-medium">Uploaded Files</h4>
            {uploadedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {file.text ? 'Text extracted successfully' : 'No text extracted'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeUploadedFile(index)
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}