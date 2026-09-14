import React, { useState, useRef } from "react";
import { uploadImage } from "../lib/insforge";
import { Upload, Image as ImageIcon, Loader2, CheckCircle, AlertCircle } from "lucide-react";

interface BannerUploadProps {
  onUploadSuccess: (url: string) => void;
  currentImageUrl: string | null;
  bucketName?: string;
  label?: string;
  aspectRatio?: "square" | "video" | "any";
}

export default function BannerUpload({ 
  onUploadSuccess, 
  currentImageUrl, 
  bucketName = "mpc-media", 
  label = "Upload Image",
  aspectRatio = "square"
}: BannerUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setError("Please upload a valid image file (JPG, PNG or WEBP).");
      return;
    }

    // Limit to 5MB for fast loading
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size exceeds 5MB limit.");
      return;
    }

    setIsUploading(true);
    setError(null);
    try {
      const publicUrl = await uploadImage(file, bucketName);
      onUploadSuccess(publicUrl);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Image upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleUpload(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const aspectClass = 
    aspectRatio === "square" ? "aspect-square max-w-[150px]" : 
    aspectRatio === "video" ? "aspect-video w-full" : "h-32 w-32";

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-400">{label}</label>
      
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        {/* Preview Container */}
        {currentImageUrl ? (
          <div className={`relative rounded-xl border border-gray-800 overflow-hidden bg-gray-950/60 ${aspectClass} flex items-center justify-center group`}>
            <img 
              src={currentImageUrl} 
              alt="Preview" 
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer" onClick={triggerFileInput}>
              <span className="text-xs text-[#C5A85C] font-semibold uppercase tracking-wider font-mono">Replace</span>
            </div>
          </div>
        ) : (
          <div className={`rounded-xl border border-dashed border-gray-800 bg-gray-950/20 ${aspectClass} flex flex-col items-center justify-center p-4 text-gray-600`}>
            <ImageIcon className="h-8 w-8 stroke-[1.5]" />
            <span className="text-[10px] uppercase tracking-wider mt-1 font-mono">No Image</span>
          </div>
        )}

        {/* Drag and Drop Zone */}
        <div 
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={triggerFileInput}
          className={`flex-1 w-full min-h-[120px] rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-4 cursor-pointer transition-all duration-200 ${
            dragActive 
              ? "border-[#C5A85C] bg-[#C5A85C]/5" 
              : "border-gray-800 hover:border-gray-700 hover:bg-gray-900/10"
          }`}
        >
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleChange}
            className="hidden" 
            accept="image/*"
          />

          {isUploading ? (
            <div className="flex flex-col items-center text-gray-400">
              <Loader2 className="h-7 w-7 animate-spin text-[#C5A85C] mb-2" />
              <span className="text-xs font-medium">Uploading to InsForge...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center">
              <Upload className="h-6 w-6 text-gray-500 mb-2" />
              <p className="text-xs text-gray-400 font-medium">
                <span className="text-[#C5A85C] font-bold">Click to upload</span> or drag & drop
              </p>
              <p className="text-[10px] text-gray-500 font-mono mt-1">
                JPG, PNG, WEBP (Max 5MB)
              </p>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-1.5 p-2 bg-red-950/20 border border-red-900/40 rounded-lg text-xs text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
