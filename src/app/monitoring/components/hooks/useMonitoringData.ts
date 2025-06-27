import { useState, useEffect, useCallback } from "react";
import { message } from "antd";
import { ChartData, OptionType, FilterState } from "../types";

// API 调用函数
const fetchData = async (url: string) => {
  try {
    const response = await fetch(url);
    if (response.ok) {
      const result = await response.json();
      return result.success ? result.data : [];
    }
  } catch (error) {
    console.error("API调用失败:", error);
  }
  return [];
};

const fetchStreamingData = async (): Promise<any[]> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch("/api/data?type=streaming", {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const result = await response.json();
      return result.success ? result.data : [];
    }
  } catch (error) {
    console.error("获取流媒体数据失败:", error);
  }
  return [];
};

export const useMonitoringData = () => {
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [streamingData, setStreamingData] = useState<any[]>([]);
  const [options, setOptions] = useState({
    projectOptions: [] as OptionType[],
    tagOptions: [] as OptionType[],
    domainOptions: [] as OptionType[],
    regionOptions: [] as OptionType[],
  });

  // 加载筛选项
  const loadOptions = useCallback(async () => {
    try {
      const [projectsRes, tagsRes, domainsRes, regionsRes] = await Promise.all([
        fetch("/api/data?type=projects"),
        fetch("/api/data?type=filters&filterType=tags"),
        fetch("/api/data?type=filters&filterType=domains"),
        fetch("/api/data?type=filters&filterType=regions"),
      ]);

      const [projects, tags, domains, regions] = await Promise.all([
        projectsRes.ok ? projectsRes.json() : { success: false, data: [] },
        tagsRes.ok ? tagsRes.json() : { success: false, data: [] },
        domainsRes.ok ? domainsRes.json() : { success: false, data: [] },
        regionsRes.ok ? regionsRes.json() : { success: false, data: [] },
      ]);

      setOptions({
        projectOptions: projects.success ? projects.data : [],
        tagOptions: tags.success ? tags.data : [],
        domainOptions: domains.success ? domains.data : [],
        regionOptions: regions.success ? regions.data : [],
      });
    } catch (error) {
      console.error("加载筛选项失败:", error);
      setOptions({
        projectOptions: [],
        tagOptions: [],
        domainOptions: [],
        regionOptions: [],
      });
    }
  }, []);

  // 加载带宽数据
  const loadBandwidthData = useCallback(async (filters: FilterState) => {
    if (!filters.project) {
      setChartData([]);
      return;
    }

    setLoading(true);
    try {
      let startTime: string | undefined;
      let endTime: string | undefined;
      if (filters.dateRange && filters.dateRange.length === 2) {
        startTime = filters.dateRange[0];
        endTime = filters.dateRange[1];
      }

      const params = new URLSearchParams();
      params.append("type", "bandwidth");
      params.append("project", filters.project);
      if (filters.tag && filters.tag !== "all")
        params.append("tag", filters.tag);
      if (filters.domain && filters.domain !== "all")
        params.append("domain", filters.domain);
      if (filters.region && filters.region !== "all")
        params.append("region", filters.region);
      if (startTime) params.append("startTime", startTime);
      if (endTime) params.append("endTime", endTime);
      if (filters.granularity)
        params.append("granularity", filters.granularity);

      const response = await fetch(`/api/data?${params.toString()}`);
      if (response.ok) {
        const result = await response.json();
        const newData = result.success ? result.data : [];
        setChartData(newData);

        if (newData.length > 0) {
          message.success(
            `已加载${filters.project}的带宽数据 (共${newData.length}条记录)`
          );
        } else {
          message.warning("当前筛选条件下暂无数据");
        }
      } else {
        setChartData([]);
        message.error("加载数据失败");
      }
    } catch (error) {
      message.error("加载数据失败");
      setChartData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // 加载流媒体数据
  const loadStreamingData = useCallback(async () => {
    const data = await fetchStreamingData();
    setStreamingData(data);
  }, []);

  // 初始化数据
  useEffect(() => {
    loadOptions();
    loadStreamingData();
  }, [loadOptions, loadStreamingData]);

  return {
    loading,
    chartData,
    streamingData,
    options,
    loadBandwidthData,
    loadStreamingData,
  };
};
