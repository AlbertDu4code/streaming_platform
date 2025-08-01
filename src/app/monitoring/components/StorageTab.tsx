import { Card, Row, Col, Statistic, Table } from "antd";
import { DatabaseOutlined, FolderOpenOutlined } from "@ant-design/icons";
import { formatBytes, formatCount, formatDate } from "@/lib/utils";

interface StorageTabProps {
  storageData: any[];
  loading: boolean;
}

export default function StorageTab({ storageData, loading }: StorageTabProps) {
  // 统计
  const totalStorage = storageData.reduce((sum, s) => sum + (s.size || 0), 0);
  const projectCount = new Set(storageData.map((s) => s.project)).size;
  const domainCount = new Set(storageData.map((s) => s.domain)).size;

  // 表格字段
  const columns = [
    { title: "项目", dataIndex: "project", key: "project" },
    { title: "域名", dataIndex: "domain", key: "domain" },
    {
      title: "存储用量(GB)",
      dataIndex: "size",
      key: "size",
      render: (val: number) => formatBytes(val * 1024 * 1024 * 1024, 2),
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
        <Col span={8}>
          <Card>
            <Statistic
              title="总存储用量(GB)"
              value={formatBytes(totalStorage * 1024 * 1024 * 1024, 2)}
              prefix={<DatabaseOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="项目数"
              value={formatCount(projectCount)}
              prefix={<FolderOpenOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="域名数"
              value={formatCount(domainCount)}
              prefix={<FolderOpenOutlined />}
            />
          </Card>
        </Col>
      </Row>
      <Card title="存储用量明细" style={{ marginTop: 24 }}>
        <Table
          columns={columns}
          dataSource={storageData}
          loading={loading}
          rowKey={(r) => r.id || r.project + "-" + r.domain}
        />
      </Card>
    </div>
  );
}
