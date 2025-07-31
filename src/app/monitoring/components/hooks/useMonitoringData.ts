import { useState, useEffect, useCallback } from "react";
import { message } from "antd";
import { ChartData, OptionType, FilterState } from "../types";
import { fetcher, ApiResponse } from "@/lib/api-utils";
import { HttpError } from "@/lib/errors";

export const useMonitoringData = () => {
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [streamingData, setStreamingData] = useState<any[]>([]);
  const [storageData, setStorageData] = useState<any[]>([]);
  const [liveData, setLiveData] = useState<any[]>([]);
  const [durationData, setDurationData] = useState<any[]>([]);
  const [screenshotData, setScreenshotData] = useState<any[]>([]);
  const [pushData, setPushData] = useState<any[]>([]);
  const [transcodeData, setTranscodeData] = useState<any[]>([]);
  const [directData, setDirectData] = useState<any[]>([]);
  const [guideData, setGuideData] = useState<any[]>([]);
  const [options, setOptions] = useState({
    projectOptions: [] as OptionType[],
    tagOptions: [] as OptionType[],
    domainOptions: [] as OptionType[],
    regionOptions: [] as OptionType[],
  });

  const handleError = (error: unknown, defaultMessage: string) => {
    if (error instanceof HttpError) {
      message.error(error.message);
    } else {
      message.error(defaultMessage);
    }
    console.error(defaultMessage, error);
  };

  // 加载筛选项
  const loadOptions = useCallback(async () => {
    try {
      const [projects, tags, domains, regions] = await Promise.all([
        fetcher<ApiResponse<OptionType[]>>("/api/data?type=projects"),
        fetcher<ApiResponse<OptionType[]>>(
          "/api/data?type=filters&filterType=tags"
        ),
        fetcher<ApiResponse<OptionType[]>>(
          "/api/data?type=filters&filterType=domains"
        ),
        fetcher<ApiResponse<OptionType[]>>(
          "/api/data?type=filters&filterType=regions"
        ),
      ]);

      setOptions({
        projectOptions: projects.data ?? [],
        tagOptions: tags.data ?? [],
        domainOptions: domains.data ?? [],
        regionOptions: regions.data ?? [],
      });
    } catch (error) {
      handleError(error, "加载筛选项失败");
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
    console.log("🔍 loadBandwidthData 被调用，filters:", filters);

    if (!filters.project) {
      console.log("❌ 没有选择项目，跳过数据加载");
      setChartData([]);
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        type: "bandwidth",
        project: filters.project,
      });

      if (filters.tag && filters.tag !== "all")
        params.append("tag", filters.tag);
      if (filters.domain && filters.domain !== "all")
        params.append("domain", filters.domain);
      if (filters.region && filters.region !== "all")
        params.append("region", filters.region);

      console.log("⏰ 检查 dateRange:", filters.dateRange);
      if (filters.dateRange && filters.dateRange.length === 2) {
        console.log(
          "✅ 添加时间参数:",
          filters.dateRange[0],
          "到",
          filters.dateRange[1]
        );
        params.append("startTime", filters.dateRange[0]);
        params.append("endTime", filters.dateRange[1]);
      } else {
        console.log("❌ dateRange 无效，将使用后端默认值");
      }

      if (filters.granularity)
        params.append("granularity", filters.granularity);

      console.log("🌐 请求 URL:", `/api/data?${params.toString()}`);

      const result = await fetcher<ApiResponse<ChartData[]>>(
        `/api/data?${params.toString()}`
      );
      const newData = result.data ?? [];
      setChartData(newData);

      if (newData.length > 0) {
        message.success(
          `已加载${filters.project}的带宽数据 (共${newData.length}条记录)`
        );
      } else {
        message.warning("当前筛选条件下暂无数据");
      }
    } catch (error) {
      handleError(error, "加载带宽数据失败");
      setChartData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createDataLoader = <T>(
    type: string,
    setter: React.Dispatch<React.SetStateAction<T[]>>,
    errorMessage: string
  ) =>
    useCallback(
      async (filters: FilterState) => {
        if (!filters.project) {
          setter([]);
          return;
        }

        setLoading(true);
        try {
          const params = new URLSearchParams({
            type,
            project: filters.project,
          });

          if (filters.dateRange && filters.dateRange.length === 2) {
            params.append("startTime", filters.dateRange[0]);
            params.append("endTime", filters.dateRange[1]);
          }

          const result = await fetcher<ApiResponse<T[]>>(
            `/api/data?${params.toString()}`
          );
          setter(result.data ?? []);
        } catch (error) {
          handleError(error, errorMessage);
          setter([]);
        } finally {
          setLoading(false);
        }
      },
      [setter, type, errorMessage]
    );

  const loadStreamingData = createDataLoader(
    "streaming",
    setStreamingData,
    "获取流媒体数据失败"
  );
  const loadStorageData = createDataLoader(
    "storage",
    setStorageData,
    "获取存储用量失败"
  );
  const loadLiveData = createDataLoader(
    "live",
    setLiveData,
    "获取直播流数据失败"
  );
  const loadDurationData = createDataLoader(
    "duration",
    setDurationData,
    "获取转码时长失败"
  );
  const loadScreenshotData = createDataLoader(
    "screenshot",
    setScreenshotData,
    "获取截图数据失败"
  );
  const loadPushData = createDataLoader(
    "push",
    setPushData,
    "获取拉流转推数据失败"
  );
  const loadTranscodeData = createDataLoader(
    "transcode",
    setTranscodeData,
    "获取转推带宽失败"
  );
  const loadDirectData = createDataLoader(
    "direct",
    setDirectData,
    "获取直播录制数据失败"
  );
  const loadGuideData = createDataLoader(
    "guide",
    setGuideData,
    "获取虚拟主播数据失败"
  );

  useEffect(() => {
    loadOptions();
  }, [loadOptions]);

  return {
    loading,
    data: {
      chartData,
      streamingData,
      storageData,
      liveData,
      durationData,
      screenshotData,
      pushData,
      transcodeData,
      directData,
      guideData,
    },
    options,
    loadBandwidthData,
    loadStreamingData,
    loadStorageData,
    loadLiveData,
    loadDurationData,
    loadScreenshotData,
    loadPushData,
    loadTranscodeData,
    loadDirectData,
    loadGuideData,
    loadOptions,
  };
};
