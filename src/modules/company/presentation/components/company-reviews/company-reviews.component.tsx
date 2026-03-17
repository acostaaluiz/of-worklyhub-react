import { Avatar, List, Rate, Typography } from "antd";
import styled from "styled-components";
import { useTranslation } from "react-i18next";

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

export function CompanyReviews() {
  const { t } = useTranslation();

  const mock: Review[] = [
    {
      id: "r1",
      author: t("company.profile.reviews.mock.r1.author"),
      rating: 5,
      text: t("company.profile.reviews.mock.r1.text"),
      avatar: "https://i.pravatar.cc/64?img=3",
    },
    {
      id: "r2",
      author: t("company.profile.reviews.mock.r2.author"),
      rating: 4,
      text: t("company.profile.reviews.mock.r2.text"),
      avatar: "https://i.pravatar.cc/64?img=6",
    },
    {
      id: "r3",
      author: t("company.profile.reviews.mock.r3.author"),
      rating: 5,
      text: t("company.profile.reviews.mock.r3.text"),
      avatar: "https://i.pravatar.cc/64?img=10",
    },
  ];

  return (
    <ReviewsShell>
      <Typography.Title level={4}>{t("company.profile.reviews.title")}</Typography.Title>

      <List
        itemLayout="horizontal"
        dataSource={mock}
        renderItem={(review) => (
          <List.Item>
            <List.Item.Meta
              avatar={<Avatar src={review.avatar} />}
              title={
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <strong>{review.author}</strong>
                  <Rate disabled value={review.rating} />
                </div>
              }
              description={<div>{review.text}</div>}
            />
          </List.Item>
        )}
      />
    </ReviewsShell>
  );
}

export default CompanyReviews;
