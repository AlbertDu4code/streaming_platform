import { Card, Row, Col, Statistic, Table } from "antd";
import { ThunderboltOutlined, WarningOutlined } from "@ant-design/icons";

interface LiveTabProps {
  liveData: any[];
  loading: boolean;
}

export default function LiveTab({ liveData, loading }: LiveTabProps) {
  // 统计
  const activeCount = liveData.filter((l) => l.status === "active").length;
  const errorCount = liveData.filter((l) => l.status === "error").length;
  const totalPushDuration = liveData
    .filter((l) => l.type === "推流")
    .reduce((sum, l) => sum + (l.duration || 0), 0);
  const totalPullDuration = liveData
    .filter((l) => l.type === "拉流")
    .reduce((sum, l) => sum + (l.duration || 0), 0);

  // 表格字段
  const columns = [
    { title: "流名称", dataIndex: "streamName", key: "streamName" },
    { title: "类型", dataIndex: "type", key: "type" },
    { title: "域名", dataIndex: "domain", key: "domain" },
    { title: "区域", dataIndex: "region", key: "region" },
    { title: "带宽", dataIndex: "bandwidth", key: "bandwidth" },
    { title: "时长", dataIndex: "duration", key: "duration" },
    { title: "状态", dataIndex: "status", key: "status" },
    { title: "开始时间", dataIndex: "startTime", key: "startTime" },
    { title: "异常", dataIndex: "error", key: "error" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="活跃流数"
              value={activeCount}
              prefix={<ThunderboltOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="异常流数"
              value={errorCount}
              prefix={<WarningOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="推流总时长"
              value={totalPushDuration}
              suffix="分钟"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="拉流总时长"
              value={totalPullDuration}
              suffix="分钟"
            />
          </Card>
        </Col>
      </Row>
      <Card title="推拉流明细" style={{ marginTop: 24 }}>
        <Table
          columns={columns}
          dataSource={liveData}
          loading={loading}
          rowKey={(r) => r.id || r.streamName}
        />
      </Card>
    </div>
  );
}
