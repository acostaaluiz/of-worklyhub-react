import {
  Button,
  Divider,
  List,
  Modal,
  Popconfirm,
  Space,
  Upload,
  type UploadProps,
} from "antd";
import {
  CloseOutlined,
  DeleteOutlined,
  EyeOutlined,
  InboxOutlined,
  PaperClipOutlined,
} from "@ant-design/icons";

import type { WorkOrderAttachment } from "@modules/work-order/interfaces/work-order.model";
import { i18n as appI18n } from "@core/i18n";
import { formatAttachmentSize, formatDateTime } from "./work-order-form.helpers";

type WorkOrderFormAttachmentsModalProps = {
  open: boolean;
  attachments: WorkOrderAttachment[];
  attachmentsLoading: boolean;
  attachmentsUploading: number;
  attachmentBusyId: string | null;
  canManageActivity: boolean;
  isAttachmentUploadRunning: boolean;
  attachmentAccept: string;
  maxAttachmentSizeMb: number;
  onClose: () => void;
  onBeforeUpload: NonNullable<UploadProps["beforeUpload"]>;
  onOpenPreview: (attachment: WorkOrderAttachment) => void;
  onDeleteAttachment: (attachment: WorkOrderAttachment) => void;
  resolveEmployeeLabel: (uid?: string | null) => string;
};

export function WorkOrderFormAttachmentsModal({
  open,
  attachments,
  attachmentsLoading,
  attachmentsUploading,
  attachmentBusyId,
  canManageActivity,
  isAttachmentUploadRunning,
  attachmentAccept,
  maxAttachmentSizeMb,
  onClose,
  onBeforeUpload,
  onOpenPreview,
  onDeleteAttachment,
  resolveEmployeeLabel,
}: WorkOrderFormAttachmentsModalProps) {
  return (
    <Modal
      title={
        <Space size={8}>
          <PaperClipOutlined />
          {`${appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k058")} (${attachments.length})`}
        </Space>
      }
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="cancel" icon={<CloseOutlined />} onClick={onClose}>
          {appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k059")}
        </Button>,
      ]}
      width={760}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ color: "var(--color-text-muted)", fontSize: 12 }}>
          {canManageActivity
            ? appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k060")
            : appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k061")}
        </div>

        <Upload.Dragger
          multiple
          accept={attachmentAccept}
          beforeUpload={onBeforeUpload}
          showUploadList={false}
          disabled={!canManageActivity}
        >
          <InboxOutlined style={{ fontSize: 28, color: "var(--color-text-muted)", marginBottom: 8 }} />
          <p style={{ marginBottom: 8, fontWeight: 600 }}>
            {appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k062")}
          </p>
          <p style={{ margin: 0, color: "var(--color-text-muted)" }}>
            {appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k063")} {maxAttachmentSizeMb} MB {appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k064")}
          </p>
        </Upload.Dragger>

        {isAttachmentUploadRunning ? (
          <div style={{ color: "var(--color-text-muted)", fontSize: 12 }}>
            {appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k065")} {attachmentsUploading}{" "}
            {attachmentsUploading > 1
              ? appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k066")
              : appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k067")}
            ...
          </div>
        ) : null}

        <Divider style={{ margin: "4px 0" }} />

        <div style={{ fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6 }}>
          <PaperClipOutlined />
          {appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k068")}
        </div>
        <List
          loading={attachmentsLoading}
          dataSource={attachments}
          locale={{
            emptyText: appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k069"),
          }}
          renderItem={(attachment) => {
            const fileSize = formatAttachmentSize(attachment.sizeBytes);
            const createdBy = attachment.authorUid
              ? resolveEmployeeLabel(attachment.authorUid)
              : appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k070");
            const isBusy = attachmentBusyId === attachment.id;

            return (
              <List.Item
                actions={[
                  <Button
                    key={`view-${attachment.id}`}
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={() => onOpenPreview(attachment)}
                    disabled={!attachment.downloadUrl || isBusy}
                  >
                    {appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k071")}
                  </Button>,
                  <Popconfirm
                    key={`remove-${attachment.id}`}
                    title={appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k072")}
                    okText={appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k073")}
                    okButtonProps={{ danger: true }}
                    onConfirm={() => onDeleteAttachment(attachment)}
                  >
                    <Button
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      disabled={isBusy || isAttachmentUploadRunning}
                    >
                      {appI18n.t("legacyInline.work_order.presentation_components_work_order_form_work_order_form_component.k074")}
                    </Button>
                  </Popconfirm>,
                ]}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <div style={{ fontWeight: 500 }}>{attachment.fileName}</div>
                  <div style={{ color: "var(--color-text-muted)", fontSize: 12 }}>
                    {attachment.contentType || "application/octet-stream"}
                    {fileSize ? ` | ${fileSize}` : ""}
                    {` | ${formatDateTime(attachment.createdAt)}`}
                    {` | ${createdBy}`}
                  </div>
                </div>
              </List.Item>
            );
          }}
        />
      </div>
    </Modal>
  );
}

export default WorkOrderFormAttachmentsModal;
