"use client";

import {
  Card,
  Select,
  DatePicker,
  Space,
  Typography,
  Row,
  Col,
  Divider,
  Radio,
} from "antd";
import dayjs from "dayjs";
import { OptionType } from "./types";

const { RangePicker } = DatePicker;
const { Text } = Typography;

import type { Dayjs } from "dayjs";

interface FilterPanelProps {
  project: string;
  tag: string;
  domain: string;
  region: string;
  protocol: string;
  dateRange: [Dayjs, Dayjs] | null;
  granularity: string;
  timeRange: string;
  onProjectChange: (value: string) => void;
  onTagChange: (value: string) => void;
  onDomainChange: (value: string) => void;
  onRegionChange: (value: string) => void;
  onProtocolChange: (value: string) => void;
  onDateRangeChange: (dates: [Dayjs, Dayjs] | null) => void;
  onGranularityChange: (value: string) => void;
  onTimeRangeChange: (value: string) => void;
  projectOptions: OptionType[];
  tagOptions: OptionType[];
  domainOptions: OptionType[];
  regionOptions: OptionType[];
}

export default function FilterPanel({
  project,
  tag,
  domain,
  region,
  protocol,
  dateRange,
  granularity,
  timeRange,
  onProjectChange,
  onTagChange,
  onDomainChange,
  onRegionChange,
  onProtocolChange,
  onDateRangeChange,
  onGranularityChange,
  onTimeRangeChange,
  projectOptions,
  tagOptions,
  domainOptions,
  regionOptions,
}: FilterPanelProps) {
  return (
    <Card
      style={{
        marginBottom: 24,
        background: "#fff",
        borderRadius: 8,
        boxShadow: "0 1px 4px rgba(0,21,41,.08)",
        border: "1px solid #f0f0f0",
      }}
    >
      <Row gutter={[16, 16]} align="middle">
        <Col span={4}>
          <Space>
            <Text>项目</Text>
            <Select
              placeholder="请选择项目"
              style={{ width: 180 }}
              value={project}
              onChange={onProjectChange}
              allowClear
              options={projectOptions}
            />
          </Space>
        </Col>

        <Col span={4}>
          <Space>
            <Text>标签</Text>
            <Select
              placeholder="请选择"
              style={{ width: 120 }}
              value={tag}
              onChange={onTagChange}
              allowClear
              options={tagOptions}
            />
          </Space>
        </Col>

        <Col span={6}>
          <Space>
            <Text>域名</Text>
            <Select
              placeholder="全部域名(含测试域名)"
              style={{ width: 200 }}
              value={domain}
              onChange={onDomainChange}
              allowClear
              options={domainOptions}
            />
          </Space>
        </Col>

        <Col span={4}>
          <Space>
            <Text>大区</Text>
            <Select
              placeholder="请选择"
              style={{ width: 120 }}
              value={region}
              onChange={onRegionChange}
              allowClear
              options={regionOptions}
            />
          </Space>
        </Col>

        <Col span={6}>
          <Space>
            <Text>协议</Text>
            <Select
              placeholder="请选择"
              style={{ width: 120 }}
              value={protocol}
              onChange={onProtocolChange}
              allowClear
              options={[
                { label: "HTTP", value: "http" },
                { label: "HTTPS", value: "https" },
                { label: "RTMP", value: "rtmp" },
              ]}
            />
          </Space>
        </Col>
      </Row>

      <Divider />

      {/* 时间选择和操作按钮 */}
      <Row justify="space-between" align="middle">
        <Col>
          <Space>
            <RangePicker
              showTime
              style={{ width: 300 }}
              value={dateRange}
              onChange={(dates) => {
                if (dates && dates[0] && dates[1]) {
                  onDateRangeChange([dates[0], dates[1]]);
                } else {
                  onDateRangeChange(null);
                }
              }}
            />
            <Text>粒度</Text>
            <Select
              value={granularity}
              style={{ width: 80 }}
              onChange={onGranularityChange}
              options={[
                { label: "1分钟", value: "1min" },
                { label: "5分钟", value: "5min" },
                { label: "1小时", value: "1hour" },
              ]}
            />
          </Space>
        </Col>

        <Col>
          <Space>
            <Radio.Group
              value={timeRange}
              onChange={(e) => onTimeRangeChange(e.target.value)}
              optionType="button"
              size="small"
              options={[
                { label: "今天", value: "today" },
                { label: "昨天", value: "yesterday" },
                { label: "近7天", value: "7days" },
                { label: "近30天", value: "30days" },
              ]}
            />
          </Space>
        </Col>
      </Row>
    </Card>
  );
}
