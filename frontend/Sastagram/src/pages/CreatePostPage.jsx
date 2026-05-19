import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { Upload, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { postsApi } from '../services/api';
import toast from 'react-hot-toast';

const styles = `
  .create-page {
    max-width: 700px;
    margin: 0 auto;
    padding: 24px 16px 80px;
  }
  .create-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
  }
  .create-title { font-size: 16px; font-weight: 600; }
  .create-submit-btn {
    color: var(--blue);
    font-weight: 600;
    font-size: 14px;
    background: none;
    border: none;
    cursor: pointer;
  }
  .create-submit-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .dropzone {
    border: 2px dashed var(--border);
    border-radius: var(--radius-md);
    padding: 60px 20px;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s;
    background: var(--bg-secondary);
  }
  .dropzone:hover, .dropzone.active {
    border-color: var(--blue);
    background: rgba(0, 149, 246, 0.04);
  }
  .dropzone-icon { color: var(--text-tertiary); margin: 0 auto 16px; }
  .dropzone-text { font-size: 20px; font-weight: 300; color: var(--text-secondary); margin-bottom: 8px; }
  .dropzone-sub { font-size: 14px; color: var(--text-tertiary); }
  .dropzone-btn {
    background: var(--blue);
    color: white;
    border-radius: var(--radius-sm);
    padding: 8px 20px;
    font-size: 14px;
    font-weight: 600;
    margin-top: 16px;
    display: inline-block;
    cursor: pointer;
  }
  .preview-area {
    position: relative;
    background: #000;
    border-radius: var(--radius-md);
    overflow: hidden;
    margin-bottom: 20px;
    aspect-ratio: 1;
  }
  .preview-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  .preview-nav {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(255,255,255,0.8);
    border-radius: 50%;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border: none;
  }
  .preview-nav.left { left: 12px; }
  .preview-nav.right { right: 12px; }
  .preview-remove {
    position: absolute;
    top: 12px;
    right: 12px;
    background: rgba(0,0,0,0.5);
    color: white;
    border-radius: 50%;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border: none;
  }
  .preview-dots {
    position: absolute;
    bottom: 12px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 4px;
  }
  .preview-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: rgba(255,255,255,0.5);
  }
  .preview-dot.active { background: white; }
  .create-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-top: 16px;
  }
  .create-input {
    width: 100%;
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 12px;
    font-size: 14px;
    color: var(--text-primary);
    resize: none;
    font-family: var(--font-body);
    transition: border-color 0.2s;
  }
  .create-input:focus { border-color: var(--text-tertiary); }
  .create-input::placeholder { color: var(--text-tertiary); }
  .char-count {
    text-align: right;
    font-size: 12px;
    color: var(--text-tertiary);
    margin-top: -10px;
  }
  .create-options {
    display: flex;
    flex-direction: column;
    gap: 0;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    overflow: hidden;
  }
  .create-option {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
    font-size: 14px;
    border-bottom: 1px solid var(--border-light);
    cursor: pointer;
  }
  .create-option:last-child { border-bottom: none; }
  .toggle {
    width: 36px;
    height: 20px;
    background: var(--border);
    border-radius: 10px;
    position: relative;
    transition: background 0.2s;
  }
  .toggle.on { background: var(--blue); }
  .toggle::after {
    content: '';
    position: absolute;
    width: 16px;
    height: 16px;
    background: white;
    border-radius: 50%;
    top: 2px;
    left: 2px;
    transition: transform 0.2s;
  }
  .toggle.on::after { transform: translateX(16px); }
  .uploading-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    color: white;
    font-size: 18px;
    font-weight: 500;
    flex-direction: column;
    gap: 16px;
  }
  .upload-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(255,255,255,0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
`;

export function CreatePostPage() {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [mediaIndex, setMediaIndex] = useState(0);
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [commentsDisabled, setCommentsDisabled] = useState(false);
  const [likesHidden, setLikesHidden] = useState(false);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback((accepted) => {
    setFiles(accepted);
    setPreviews(accepted.map(f => URL.createObjectURL(f)));
    setMediaIndex(0);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [], 'video/*': [] },
    multiple: true,
    maxFiles: 10
  });

  const removeFile = (i) => {
    const newFiles = files.filter((_, idx) => idx !== i);
    const newPreviews = previews.filter((_, idx) => idx !== i);
    setFiles(newFiles);
    setPreviews(newPreviews);
    setMediaIndex(Math.min(mediaIndex, newFiles.length - 1));
  };

  const handleSubmit = async () => {
    if (files.length === 0) return;
    setUploading(true);
    try {
      const fd = new FormData();
      if (caption) fd.append('caption', caption);
      if (location) fd.append('location', location);
      fd.append('commentsDisabled', String(commentsDisabled));
      fd.append('likesHidden', String(likesHidden));
      files.forEach(f => fd.append('media', f));

      const res = await postsApi.createPost(fd);
      toast.success('Post shared!');
      navigate(`/p/${res.data.id}`);
    } catch {
      toast.error('Failed to create post');
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
      {uploading && (
        <div className="uploading-overlay">
          <div className="upload-spinner" />
          Sharing your post...
        </div>
      )}
      <div className="create-page">
        <div className="create-header">
          <h1 className="create-title">Create new post</h1>
          {files.length > 0 && (
            <button className="create-submit-btn" onClick={handleSubmit} disabled={uploading}>
              Share
            </button>
          )}
        </div>

        {files.length === 0 ? (
          <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
            <input {...getInputProps()} />
            <Upload className="dropzone-icon" size={64} strokeWidth={1} />
            <div className="dropzone-text">Drag photos and videos here</div>
            <div className="dropzone-sub">Share up to 10 photos or videos</div>
            <div className="dropzone-btn">Select from device</div>
          </div>
        ) : (
          <>
            <div className="preview-area">
              {files[mediaIndex]?.type.startsWith('video/') ? (
                <video src={previews[mediaIndex]} className="preview-img" controls />
              ) : (
                <img src={previews[mediaIndex]} alt="preview" className="preview-img" />
              )}

              {previews.length > 1 && (
                <>
                  {mediaIndex > 0 && (
                    <button className="preview-nav left" onClick={() => setMediaIndex(i => i - 1)}>
                      <ChevronLeft size={18} />
                    </button>
                  )}
                  {mediaIndex < previews.length - 1 && (
                    <button className="preview-nav right" onClick={() => setMediaIndex(i => i + 1)}>
                      <ChevronRight size={18} />
                    </button>
                  )}
                  <div className="preview-dots">
                    {previews.map((_, i) => (
                      <div key={i} className={`preview-dot ${i === mediaIndex ? 'active' : ''}`} />
                    ))}
                  </div>
                </>
              )}

              <button className="preview-remove" onClick={() => removeFile(mediaIndex)}>
                <X size={14} />
              </button>
            </div>

            <div className="create-form">
              <textarea
                className="create-input"
                placeholder="Write a caption..."
                rows={4}
                value={caption}
                onChange={e => setCaption(e.target.value)}
                maxLength={2200}
              />
              <div className="char-count">{caption.length}/2,200</div>

              <input
                className="create-input"
                placeholder="Add location"
                value={location}
                onChange={e => setLocation(e.target.value)}
              />

              <div className="create-options">
                <div className="create-option" onClick={() => setCommentsDisabled(v => !v)}>
                  <span>Turn off commenting</span>
                  <div className={`toggle ${commentsDisabled ? 'on' : ''}`} />
                </div>
                <div className="create-option" onClick={() => setLikesHidden(v => !v)}>
                  <span>Hide like and view counts</span>
                  <div className={`toggle ${likesHidden ? 'on' : ''}`} />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
