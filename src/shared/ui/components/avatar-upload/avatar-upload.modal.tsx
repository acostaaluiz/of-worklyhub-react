import React from "react";
import { Modal, Upload, Button } from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import { InboxOutlined } from "@ant-design/icons";

const { Dragger } = Upload;

export type AvatarUploadModalProps = {
  open: boolean;
  onClose: () => void;
  onUpload: (file: File) => Promise<void> | void;
  isUploading?: boolean;
};

export const AvatarUploadModal: React.FC<AvatarUploadModalProps> = ({ open, onClose, onUpload, isUploading }) => {
  const [file, setFile] = React.useState<File | undefined>(undefined);

  React.useEffect(() => {
    if (!open) setFile(undefined);
  }, [open]);

  const beforeUpload = (f: File) => {
    setFile(f);
    return false; // prevent auto upload
  };

  const handleOk = async () => {
    if (!file) return onClose();
    await onUpload(file);
    onClose();
  };

  return (
    <Modal title="Upload profile photo" visible={open} onCancel={onClose} onOk={handleOk} okButtonProps={{ loading: isUploading }}>
      <Dragger multiple={false} beforeUpload={beforeUpload} accept="image/*" fileList={file ? [{ uid: "1", name: file.name, size: file.size } as UploadFile] : []}>
        <p style={{ textAlign: "center", margin: 12 }}>
          <InboxOutlined style={{ fontSize: 32, color: "var(--color-text-muted)" }} />
        </p>
        <p style={{ textAlign: "center" }}>Click or drag file to this area to upload</p>
        <p style={{ textAlign: "center", color: "var(--color-text-muted)" }}>PNG, JPG, GIF up to 5MB</p>
      </Dragger>
      <div style={{ marginTop: 12, textAlign: "right" }}>
        <Button onClick={() => setFile(undefined)}>Clear</Button>
      </div>
    </Modal>
  );
};

export default AvatarUploadModal;
