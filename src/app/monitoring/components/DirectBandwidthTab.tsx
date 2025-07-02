import { Card, Row, Col, Statistic, Table } from "antd";
import { BarChartOutlined } from "@ant-design/icons";

interface DirectBandwidthTabProps {
  directBandwidthData: any[];
  loading: boolean;
}

export default function DirectBandwidthTab({
  directBandwidthData,
  loading,
}: DirectBandwidthTabProps) {
  const totalBandwidth = directBandwidthData.reduce(
    (sum, t) => sum + (t.bandwidth || 0),
    0
  );
  const streamCount = directBandwidthData.length;

  const columns = [
    { title: "流名称", dataIndex: "streamName", key: "streamName" },
    { title: "带宽(Mbps)", dataIndex: "bandwidth", key: "bandwidth" },
    { title: "更新时间", dataIndex: "updateTime", key: "updateTime" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <Row gutter={16}>
        <Col span={12}>
          <Card>
            <Statistic
              title="总直播带宽"
              value={totalBandwidth}
              suffix="Mbps"
              prefix={<BarChartOutlined />}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card>
            <Statistic title="直播流数" value={streamCount} />
          </Card>
        </Col>
      </Row>
      <Card title="直播带宽明细" style={{ marginTop: 24 }}>
        <Table
          columns={columns}
          dataSource={directBandwidthData}
          loading={loading}
          rowKey={(r) => r.id || r.streamName}
        />
      </Card>
    </div>
  );
}
