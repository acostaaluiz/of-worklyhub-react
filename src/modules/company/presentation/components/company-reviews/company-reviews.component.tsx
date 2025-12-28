import React from "react";
import { List, Avatar, Rate, Typography } from "antd";
import styled from "styled-components";

const ReviewsShell = styled.div`
  margin-top: var(--space-6);
`;

type Review = {
  id: string;
  author: string;
  avatar?: string;
  rating: number;
  text?: string;
};

const MOCK: Review[] = [
  { id: "r1", author: "João Silva", rating: 5, text: "Ótimo atendimento e preço justo.", avatar: "https://i.pravatar.cc/64?img=3" },
  { id: "r2", author: "Maria Costa", rating: 4, text: "Profissionais atenciosos.", avatar: "https://i.pravatar.cc/64?img=6" },
  { id: "r3", author: "Pedro Souza", rating: 5, text: "Ambiente agradável e serviço rápido.", avatar: "https://i.pravatar.cc/64?img=10" },
];

export function CompanyReviews() {
  return (
    <ReviewsShell>
      <Typography.Title level={4}>Avaliações</Typography.Title>

      <List
        itemLayout="horizontal"
        dataSource={MOCK}
        renderItem={(r) => (
          <List.Item>
            <List.Item.Meta
              avatar={<Avatar src={r.avatar} />}
              title={<div style={{ display: "flex", alignItems: "center", gap: 8 }}><strong>{r.author}</strong><Rate disabled value={r.rating} /></div>}
              description={<div>{r.text}</div>}
            />
          </List.Item>
        )}
      />
    </ReviewsShell>
  );
}

export default CompanyReviews;
