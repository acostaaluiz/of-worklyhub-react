import React from "react";
import { Modal, Upload, Button, Progress, Space, message, Spin } from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import { InboxOutlined, CloseCircleOutlined } from "@ant-design/icons";

const { Dragger } = Upload;

export type AvatarUploadModalProps = {
  open: boolean;
  title?: string;
  subtitle?: string;
  onClose: () => void;
  /**
   * Called when user confirms upload. Receives all selected files and an optional progress callback.
   * Progress callback signature: (index, percent) => void
   */
  onUpload: (files: File[], onProgress?: (index: number, percent: number) => void) => Promise<void> | void;
  isUploading?: boolean;
  /** max number of files allowed (default 1) */
  maxFiles?: number;
};

export const AvatarUploadModal: React.FC<AvatarUploadModalProps> = ({ open, title = "Upload file", subtitle, onClose, onUpload, isUploading, maxFiles = 1 }) => {
  const [files, setFiles] = React.useState<File[]>([]);
  const [progress, setProgress] = React.useState<number[]>([]);
  const [internalUploading, setInternalUploading] = React.useState(false);
  const allowed = Math.max(1, maxFiles ?? 1);
  const readersRef = React.useRef(new Map<File, FileReader>());

  React.useEffect(() => {
    if (!open) {
      setFiles([]);
      setProgress([]);
      setInternalUploading(false);
      // abort any active readers
      readersRef.current.forEach((r) => {
        try {
          r.abort();
        } catch {
          // ignore
        }
      });
      readersRef.current.clear();
    }
  }, [open]);


  const beforeUpload = (f: File) => {
    // determine intended index based on current files
    const idx = files.length >= allowed ? files.length - 1 : files.length;

    setFiles((prev) => {
      const next = prev.slice();
      if (next.length >= allowed) {
        next.splice(next.length - 1, 1, f);
      } else {
        next.push(f);
      }
      return next;
    });

    setProgress((prev) => {
      const next = prev.slice();
      if (next.length >= allowed) {
        next.splice(next.length - 1, 1, 0);
      } else {
        next.push(0);
      }
      return next;
    });

    // start reading file to track device->browser progress
    try {
      const reader = new FileReader();
      readersRef.current.set(f, reader);
      reader.onprogress = (ev) => {
        if (ev.lengthComputable) {
          const percent = Math.max(0, Math.min(100, Math.round((ev.loaded / ev.total) * 100)));
          setProgress((prev) => {
            const next = prev.slice();
            if (idx >= 0 && idx < next.length) next[idx] = percent;
            return next;
          });
        }
      };
      reader.onload = () => {
        setProgress((prev) => {
          const next = prev.slice();
          if (idx >= 0 && idx < next.length) next[idx] = 100;
          return next;
        });
        readersRef.current.delete(f);
      };
      reader.onerror = () => {
        readersRef.current.delete(f);
        message.error("Failed to read file");
      };
      reader.readAsArrayBuffer(f);
    } catch {
      // ignore
    }

    return false; // prevent auto upload
  };

  const handleClear = (index?: number) => {
    if (typeof index === "number") {
      // abort reader for removed file if present
      const file = files[index];
      if (file) {
        const r = readersRef.current.get(file);
        if (r) {
          try {
            r.abort();
          } catch {
            // ignore
          }
          readersRef.current.delete(file);
        }
      }

      setFiles((prev) => prev.filter((_, i) => i !== index));
      setProgress((prev) => prev.filter((_, i) => i !== index));
    } else {
      // clear all
      readersRef.current.forEach((r) => {
        try {
          r.abort();
        } catch {
          // ignore
        }
      });
      readersRef.current.clear();
      setFiles([]);
      setProgress([]);
    }
  };

  const handleOk = async () => {
    if (!files || files.length === 0) return onClose();

    const progressCb = (index: number, p: number) => {
      setProgress((prev) => {
        const next = prev.slice();
        next[index] = Math.max(0, Math.min(100, Math.round(p)));
        return next;
      });
    };

    function isPromise<T = unknown>(v: unknown): v is Promise<T> {
      return !!v && typeof (v as { then?: unknown }).then === "function";
    }

    try {
      setInternalUploading(true);
      const res = onUpload(files, progressCb) as unknown;
      if (isPromise(res)) {
        await res;
      }
      // mark all as complete
      setProgress(() => files.map(() => 100));
      message.success("File(s) uploaded successfully");
      onClose();
    } catch (err) {
      console.error(err);
      message.error("Failed to upload file(s)");
    } finally {
      setInternalUploading(false);
    }
  };

  return (
    <Modal title={title} open={open} onCancel={onClose} onOk={handleOk} okButtonProps={{ disabled: files.length === 0, loading: isUploading || internalUploading }} cancelText="Cancel" okText="Upload">
      {subtitle ? <div style={{ marginBottom: 8, color: "var(--color-text-muted)" }}>{subtitle}</div> : null}

      <Dragger multiple={allowed > 1} beforeUpload={beforeUpload} accept="image/*" fileList={files.map((f, i) => ({ uid: String(i), name: f.name, size: f.size } as UploadFile))}>
        <p style={{ textAlign: "center", margin: 12 }}>
          <InboxOutlined style={{ fontSize: 32, color: "var(--color-text-muted)" }} />
        </p>
        <p style={{ textAlign: "center" }}>Click or drag file to this area to upload</p>
        <p style={{ textAlign: "center", color: "var(--color-text-muted)" }}>PNG, JPG, GIF up to 5MB</p>
      </Dragger>

      {files.length > 0 ? (
        <div style={{ marginTop: 12 }}>
          <Space direction="vertical" style={{ width: "100%" }}>
            {files.map((f, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ fontWeight: 600 }}>{f.name}</div>
                    {(internalUploading || isUploading) ? <Spin size="small" /> : null}
                  </div>
                  <Button type="text" icon={<CloseCircleOutlined />} onClick={() => handleClear(i)} />
                </div>
                {/* show percent upload from device->browser; spinner indicates overall upload activity */}
                <Progress percent={progress[i] ?? 0} />
              </div>
            ))}
          </Space>
        </div>
      ) : null}
    </Modal>
  );
};

export default AvatarUploadModal;
