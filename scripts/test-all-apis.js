const BASE_URL = "http://localhost:3000";

// 测试所有API端点
async function testAllAPIs() {
  console.log("开始测试所有API端点...\n");

  const apis = [
    { name: "带宽数据", url: "/api/data?type=bandwidth&project=project_1" },
    { name: "流量数据", url: "/api/data?type=streaming" },
    { name: "直播流数据", url: "/api/data?type=live" },
    { name: "存储数据", url: "/api/data?type=storage" },
    { name: "转码时长数据", url: "/api/data?type=duration" },
    { name: "截图数据", url: "/api/data?type=screenshot" },
    { name: "拉流转推数据", url: "/api/data?type=push" },
    { name: "转推带宽数据", url: "/api/data?type=transcode" },
    { name: "直播带宽数据", url: "/api/data?type=direct" },
    { name: "云导播数据", url: "/api/data?type=guide" },
    { name: "项目筛选", url: "/api/data?type=projects" },
    { name: "标签筛选", url: "/api/data?type=filters&filterType=tags" },
    { name: "域名筛选", url: "/api/data?type=filters&filterType=domains" },
    { name: "区域筛选", url: "/api/data?type=filters&filterType=regions" },
  ];

  for (const api of apis) {
    try {
      console.log(`测试 ${api.name}...`);
      const response = await fetch(`${BASE_URL}${api.url}`);
      const data = await response.json();

      if (response.ok && data.success) {
        console.log(`✅ ${api.name}: 成功 (${data.data?.length || 0} 条数据)`);
      } else {
        console.log(`❌ ${api.name}: 失败 - ${data.message || "未知错误"}`);
      }
    } catch (error) {
      console.log(`❌ ${api.name}: 网络错误 - ${error.message}`);
    }
  }

  console.log("\n测试完成！");
}

// 运行测试
testAllAPIs().catch(console.error);
