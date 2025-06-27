"use client";

import { Card, Row, Col, Statistic, Table, Empty } from "antd";
import {
  DatabaseOutlined,
  DownOutlined,
  DesktopOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { formatBandwidth, formatBytes } from "@/lib/utils";

interface StreamingTabProps {
  streamingData: any[];
}

export default function StreamingTab({ streamingData }: StreamingTabProps) {
  // 安全计算统计数据
  const totalDuration = streamingData.reduce(
    (sum, s) => sum + (s?.duration || 0),
    0
  );
  const totalDataUsage = streamingData.reduce(
    (sum, s) => sum + (s?.bandwidth || 0),
    0
  );
  const totalCost = streamingData.reduce(
    (sum, s) => sum + (s?.bandwidth || 0),
    0
  );

  const columns = [
    {
      title: "流名称",
      dataIndex: "streamName",
      key: "streamName",
      width: 120,
    },
    {
      title: "类型",
      dataIndex: "type",
      key: "type",
      width: 100,
      render: (type: string) => (
        <span
          className={`px-2 py-1 rounded text-xs ${
            type === "推流"
              ? "bg-blue-100 text-blue-800"
              : "bg-green-100 text-green-800"
          }`}
        >
          {type}
        </span>
      ),
    },
    {
      title: "域名",
      dataIndex: "domain",
      key: "domain",
      width: 150,
    },
    {
      title: "区域",
      dataIndex: "region",
      key: "region",
      width: 100,
    },
    {
      title: "带宽",
      dataIndex: "bandwidth",
      key: "bandwidth",
      width: 120,
      render: (bandwidth: number) => formatBandwidth(bandwidth * 1000000),
    },
    {
      title: "时长(分钟)",
      dataIndex: "duration",
      key: "duration",
      width: 120,
    },
    {
      title: "观看人数",
      dataIndex: "viewers",
      key: "viewers",
      width: 100,
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: string) => (
        <span
          className={`px-2 py-1 rounded text-xs ${
            status === "active"
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {status === "active" ? "活跃" : "结束"}
        </span>
      ),
    },
    {
      title: "开始时间",
      dataIndex: "startTime",
      key: "startTime",
      width: 180,
      render: (startTime: string) => {
        if (!startTime) return "-";
        return new Date(startTime).toLocaleString("zh-CN");
      },
    },
  ];

  // 为表格数据添加唯一键
  const tableData = streamingData.map((item, index) => ({
    ...item,
    key: `${item.id}-${index}`,
  }));

  if (!streamingData || streamingData.length === 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {/* 流媒体统计 */}
        <Row gutter={[16, 16]}>
          <Col span={6}>
            <Card>
              <Statistic
                title="总数据使用"
                value="0 B"
                prefix={<DatabaseOutlined style={{ color: "#00b42a" }} />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="总费用"
                value={0}
                precision={2}
                prefix={<DownOutlined style={{ color: "#f53f3f" }} />}
                suffix="USD"
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="平均画质"
                value="1440P"
                prefix={<DesktopOutlined style={{ color: "#722ed1" }} />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="今日观看"
                value="0"
                suffix="小时"
                prefix={<ClockCircleOutlined style={{ color: "#ff7d00" }} />}
              />
            </Card>
          </Col>
        </Row>

        {/* 空状态 */}
        <Card title="流媒体使用记录">
          <Empty
            description="暂无流媒体数据"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </Card>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* 流媒体统计 */}
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总数据使用"
              value={formatBytes(totalDataUsage * 1024 * 1024 * 1024)}
              prefix={<DatabaseOutlined style={{ color: "#00b42a" }} />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总费用"
              value={totalCost}
              precision={2}
              prefix={<DownOutlined style={{ color: "#f53f3f" }} />}
              suffix="USD"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="平均画质"
              value="1440P"
              prefix={<DesktopOutlined style={{ color: "#722ed1" }} />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="今日观看"
              value="3.2"
              suffix="小时"
              prefix={<ClockCircleOutlined style={{ color: "#ff7d00" }} />}
            />
          </Card>
        </Col>
      </Row>

      {/* 使用记录表格 */}
      <Card title="流媒体使用记录">
        <Table
          columns={columns}
          dataSource={tableData}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
          }}
          scroll={{ x: 1200 }}
          size="middle"
        />
      </Card>
    </div>
  );
}
