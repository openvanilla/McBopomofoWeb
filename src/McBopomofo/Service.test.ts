import { Service } from "./Service";

describe("Test service", () => {
  test("Test convertBrailleToText", () => {
    let service = new Service();
    let result = service.convertBrailleToText("⠋⠞⠄⠚⠡⠐⠗⠩⠈");
    expect(result).toBe("天氣好");
  });

  test("Test convertBrailleToText", () => {
    let service = new Service();
    let result = service.convertBrailleToText("⠋⠞⠄⠚⠡⠐⠁⠥⠄⠙⠮⠁⠗⠥⠈⠗⠩⠈");
    expect(result).toBe("天氣真的很好");
  });

  test("Test convertTextToBraille 1", () => {
    let service = new Service();
    let result = service.convertTextToBraille("天氣好");
    expect(result).toBe("⠋⠞⠄⠚⠡⠐⠗⠩⠈");
  });

  test("Test convertTextToBraille 2", () => {
    let service = new Service();
    let result = service.convertTextToBraille("天氣真的很好");
    expect(result).toBe("⠋⠞⠄⠚⠡⠐⠁⠥⠄⠙⠮⠁⠗⠥⠈⠗⠩⠈");
  });

  test("Test convertTextToBraille 3", () => {
    let service = new Service();
    let result = service.convertTextToBraille("今天天氣好清爽");
    expect(result).toBe("⠅⠹⠄⠋⠞⠄⠋⠞⠄⠚⠡⠐⠗⠩⠈⠚⠽⠄⠊⠸⠈");
  });
});
