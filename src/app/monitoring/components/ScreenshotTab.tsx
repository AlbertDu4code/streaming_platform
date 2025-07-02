import { Card, Row, Col, Statistic, Table } from "antd";
import { PictureOutlined } from "@ant-design/icons";

interface ScreenshotTabProps {
  screenshotData: any[];
  loading: boolean;
}

export default function ScreenshotTab({
  screenshotData,
  loading,
}: ScreenshotTabProps) {
  const totalScreenshots = screenshotData.reduce(
    (sum, s) => sum + (s.count || 0),
    0
  );
  const projectCount = new Set(screenshotData.map((s) => s.project)).size;

  const columns = [
    { title: "项目", dataIndex: "project", key: "project" },
    { title: "域名", dataIndex: "domain", key: "domain" },
    { title: "截图张数", dataIndex: "count", key: "count" },
    { title: "更新时间", dataIndex: "updateTime", key: "updateTime" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <Row gutter={16}>
        <Col span={12}>
          <Card>
            <Statistic
              title="总截图张数"
              value={totalScreenshots}
              prefix={<PictureOutlined />}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card>
            <Statistic title="项目数" value={projectCount} />
          </Card>
        </Col>
      </Row>
      <Card title="截图明细" style={{ marginTop: 24 }}>
        <Table
          columns={columns}
          dataSource={screenshotData}
          loading={loading}
          rowKey={(r) => r.id || r.project + "-" + r.domain}
        />
      </Card>
    </div>
  );
}
