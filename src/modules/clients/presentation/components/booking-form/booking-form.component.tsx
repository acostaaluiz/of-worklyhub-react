import React from "react";
import { Button, DatePicker, Input, TimePicker, Form, message } from "antd";
import dayjs from "dayjs";
import { getDateFormat } from "@core/utils/mask";
import { BaseComponent } from "@shared/base/base.component";
import type { ServiceModel } from "@modules/clients/interfaces/service.model";
import type { ScheduleEvent } from "@modules/schedule/interfaces/schedule-event.model";
import { ScheduleService } from "@modules/schedule/services/schedule.service";

type Props = {
  service: ServiceModel;
  onBooked?: (ev: ScheduleEvent) => void;
};

type State = {
  isSubmitting: boolean;
};

export class BookingForm extends BaseComponent<Props, State> {
  private serviceApi = new ScheduleService();
  private dateFormat = getDateFormat();

  protected override state: State = { isSubmitting: false };

  private handleFinish = async (values: any) => {
    try {
      this.setState({ isSubmitting: true });

      const date = (values.date as dayjs.Dayjs).format("YYYY-MM-DD");
      const startTime = (values.timeRange[0] as dayjs.Dayjs).format("HH:mm");
      const endTime = (values.timeRange[1] as dayjs.Dayjs).format("HH:mm");

      const payload: Omit<ScheduleEvent, "id"> = {
        title: `${this.props.service.title} — ${this.props.service.providerName}`,
        date,
        startTime,
        endTime,
        categoryId: "schedule",
        description: values.notes || this.props.service.description || "",
      };

      const created = await this.serviceApi.createEvent(payload as any);
      message.success("Agendamento criado");
      this.props.onBooked?.(created);
    } catch (err) {
      message.error("Erro ao criar agendamento");
    } finally {
      this.setState({ isSubmitting: false });
    }
  };

  protected override renderView(): React.ReactNode {
    return (
      <Form layout="vertical" onFinish={this.handleFinish} initialValues={{ timeRange: [dayjs().hour(10), dayjs().hour(11)] }}>
        <Form.Item label="Data" name="date" rules={[{ required: true }]}>
          <DatePicker style={{ width: "100%" }} format={this.dateFormat} />
        </Form.Item>

        <Form.Item label="Horário" name="timeRange" rules={[{ required: true }]}>
          <TimePicker.RangePicker format="HH:mm" style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item label="Seu nome" name="name" rules={[{ required: false }]}>
          <Input placeholder="Nome para o agendamento" />
        </Form.Item>

        <Form.Item label="Observações" name="notes">
          <Input.TextArea rows={3} />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={this.state.isSubmitting}>
            Confirmar agendamento
          </Button>
        </Form.Item>
      </Form>
    );
  }
}

export default BookingForm;
