import React from "react";
import { Modal, Upload, Button, Progress, Space, message } from "antd";
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

  React.useEffect(() => {
    if (!open) {
      setFiles([]);
      setProgress([]);
      setInternalUploading(false);
    }
  }, [open]);

  const beforeUpload = (f: File) => {
    setFiles((prev) => {
      const next = prev.slice();
        if (next.length >= allowed) {
          // replace the last
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
    return false; // prevent auto upload
  };

  const handleClear = (index?: number) => {
    if (typeof index === "number") {
      setFiles((prev) => prev.filter((_, i) => i !== index));
      setProgress((prev) => prev.filter((_, i) => i !== index));
    } else {
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
    <Modal title={title} open={open} onCancel={onClose} onOk={handleOk} okButtonProps={{ loading: isUploading || internalUploading }} cancelText="Cancel" okText="Upload">
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
                  <div style={{ fontWeight: 600 }}>{f.name}</div>
                  <Button type="text" icon={<CloseCircleOutlined />} onClick={() => handleClear(i)} />
                </div>
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
