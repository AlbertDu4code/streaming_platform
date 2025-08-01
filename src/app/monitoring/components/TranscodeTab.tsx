import { Card, Row, Col, Statistic, Table } from "antd";
import { ClockCircleOutlined } from "@ant-design/icons";
import { formatDuration, formatCount, formatDate } from "@/lib/utils";

interface TranscodeTabProps {
  transcodeData: any[];
  loading: boolean;
}

export default function TranscodeTab({
  transcodeData,
  loading,
}: TranscodeTabProps) {
  const totalDuration = transcodeData.reduce(
    (sum, t) => sum + (t.duration || 0),
    0
  );
  const jobCount = transcodeData.length;

  const columns = [
    { title: "项目", dataIndex: "project", key: "project" },
    { title: "域名", dataIndex: "domain", key: "domain" },
    {
      title: "转码时长(分钟)",
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
              title="总转码时长"
              value={formatDuration(totalDuration, 0)}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card>
            <Statistic title="转码任务数" value={formatCount(jobCount)} />
          </Card>
        </Col>
      </Row>
      <Card title="转码时长明细" style={{ marginTop: 24 }}>
        <Table
          columns={columns}
          dataSource={transcodeData}
          loading={loading}
          rowKey={(r) => r.id || r.project + "-" + r.domain}
        />
      </Card>
    </div>
  );
}
