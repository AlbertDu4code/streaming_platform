import { Card, Row, Col, Statistic, Table } from "antd";
import { SwapOutlined } from "@ant-design/icons";
import { formatCount, formatDuration, formatDate } from "@/lib/utils";

interface PushTabProps {
  pushData: any[];
  loading: boolean;
}

export default function PushTab({ pushData, loading }: PushTabProps) {
  const totalPush = pushData.length;
  const totalDuration = pushData.reduce((sum, p) => sum + (p.duration || 0), 0);

  const columns = [
    { title: "流名称", dataIndex: "streamName", key: "streamName" },
    { title: "域名", dataIndex: "domain", key: "domain" },
    {
      title: "转推时长(分钟)",
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
              title="转推流数"
              value={formatCount(totalPush)}
              prefix={<SwapOutlined />}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card>
            <Statistic
              title="总转推时长"
              value={formatDuration(totalDuration, 0)}
            />
          </Card>
        </Col>
      </Row>
      <Card title="拉流转推明细" style={{ marginTop: 24 }}>
        <Table
          columns={columns}
          dataSource={pushData}
          loading={loading}
          rowKey={(r) => r.id || r.streamName}
        />
      </Card>
    </div>
  );
}
