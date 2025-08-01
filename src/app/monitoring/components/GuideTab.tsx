import { Card, Row, Col, Statistic, Table } from "antd";
import { CloudOutlined } from "@ant-design/icons";
import { formatCount, formatDuration, formatDate } from "@/lib/utils";

interface GuideTabProps {
  guideData: any[];
  loading: boolean;
}

export default function GuideTab({ guideData, loading }: GuideTabProps) {
  const totalGuide = guideData.length;
  const totalDuration = guideData.reduce(
    (sum, g) => sum + (g.duration || 0),
    0
  );

  const columns = [
    { title: "导播名称", dataIndex: "guideName", key: "guideName" },
    { title: "项目", dataIndex: "project", key: "project" },
    {
      title: "导播时长(分钟)",
      dataIndex: "duration",
      key: "duration",
      render: (val: number) => formatDuration(val, 0),
    },
    {
      title: "更新时间",
      dataIndex: "updateTime",
      key: "updateTime",
      render: (val: string) => formatDate(val),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <Row gutter={16}>
        <Col span={12}>
          <Card>
            <Statistic
              title="导播任务数"
              value={formatCount(totalGuide)}
              prefix={<CloudOutlined />}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card>
            <Statistic
              title="总导播时长"
              value={formatDuration(totalDuration, 0)}
            />
          </Card>
        </Col>
      </Row>
      <Card title="云导播明细" style={{ marginTop: 24 }}>
        <Table
          columns={columns}
          dataSource={guideData}
          loading={loading}
          rowKey={(r) => r.id || r.guideName}
        />
      </Card>
    </div>
  );
}
