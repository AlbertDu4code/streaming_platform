import { Card, Row, Col, Statistic, Table } from "antd";
import { BarChartOutlined } from "@ant-design/icons";
import { formatBandwidth, formatCount, formatDate } from "@/lib/utils";

interface TranscodeBandwidthTabProps {
  transcodeBandwidthData: any[];
  loading: boolean;
}

export default function TranscodeBandwidthTab({
  transcodeBandwidthData,
  loading,
}: TranscodeBandwidthTabProps) {
  const totalBandwidth = transcodeBandwidthData.reduce(
    (sum, t) => sum + (t.bandwidth || 0),
    0
  );
  const streamCount = transcodeBandwidthData.length;

  const columns = [
    { title: "流名称", dataIndex: "streamName", key: "streamName" },
    {
      title: "带宽(Mbps)",
      dataIndex: "bandwidth",
      key: "bandwidth",
      render: (val: number) => formatBandwidth(val * 1000000, 2),
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
              title="总转推带宽"
              value={formatBandwidth(totalBandwidth * 1000000, 2)}
              prefix={<BarChartOutlined />}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card>
            <Statistic title="转推流数" value={formatCount(streamCount)} />
          </Card>
        </Col>
      </Row>
      <Card title="转推带宽明细" style={{ marginTop: 24 }}>
        <Table
          columns={columns}
          dataSource={transcodeBandwidthData}
          loading={loading}
          rowKey={(r) => r.id || r.streamName}
        />
      </Card>
    </div>
  );
}
