const { test, expect } = require("@playwright/test");

const FEATURE_INPUT_URL = "/index.html#feature_input";

const openFeatureInput = async (page) => {
  await page.goto(FEATURE_INPUT_URL);
  const input = page.getByRole("textbox", { name: "輸入區" });
  await input.click();
  return input;
};

test.describe("feature_input demo", () => {
  test("converts standard bopomofo keystrokes into 你好", async ({ page }) => {
    const input = await openFeatureInput(page);
    await input.pressSequentially("su3cl3");

    await expect(page.getByText("你好|", { exact: true })).toBeVisible();
  });

  test("offers and commits the special 🔥 candidate for 火", async ({ page }) => {
    const input = await openFeatureInput(page);
    await input.pressSequentially("cji3");
    await input.press("Space");

    await expect(page.getByRole("row", { name: "5 🔥" })).toBeVisible();

    await input.press("5");

    await expect(page.getByText("🔥|", { exact: true })).toBeVisible();
  });

  test("opens the candidate window in plain bopomofo mode before committing", async ({
    page,
  }) => {
    await page.goto(FEATURE_INPUT_URL);
    await page.locator("#use_plainbopomofo").check();

    const input = page.getByRole("textbox", { name: "輸入區" });
    await input.click();
    await input.pressSequentially("cji3");
    await input.press("Space");

    await expect(page.getByRole("row", { name: "1 火" })).toBeVisible();

    await input.press("1");

    await expect(input).toHaveValue("火");
  });

  test("outputs bopomofo readings with Ctrl+Enter when configured", async ({
    page,
  }) => {
    await page.goto(FEATURE_INPUT_URL);
    await page.locator("#ctrl_enter_option").selectOption("1");

    const input = page.getByRole("textbox", { name: "輸入區" });
    await input.click();
    await input.pressSequentially("su3cl3");
    await input.press("Control+Enter");

    await expect(input).toHaveValue("ㄋㄧˇ-ㄏㄠˇ");
  });

  test("outputs HTML ruby with Ctrl+Enter when configured", async ({ page }) => {
    await page.goto(FEATURE_INPUT_URL);
    await page.locator("#ctrl_enter_option").selectOption("2");

    const input = page.getByRole("textbox", { name: "輸入區" });
    await input.click();
    await input.pressSequentially("su3cl3");
    await input.press("Control+Enter");

    await expect(input).toHaveValue(
      "<ruby>你好<rp>(</rp><rt>ㄋㄧˇ ㄏㄠˇ</rt><rp>)</rp></ruby>"
    );
  });

  test("outputs braille with Ctrl+Enter when configured", async ({ page }) => {
    await page.goto(FEATURE_INPUT_URL);
    await page.locator("#ctrl_enter_option").selectOption("3");

    const input = page.getByRole("textbox", { name: "輸入區" });
    await input.click();
    await input.pressSequentially("su3cl3");
    await input.press("Control+Enter");

    await expect(input).toHaveValue("⠝⠡⠈⠗⠩⠈");
  });

  test("outputs pinyin with Ctrl+Enter when configured", async ({ page }) => {
    await page.goto(FEATURE_INPUT_URL);
    await page.locator("#ctrl_enter_option").selectOption("4");

    const input = page.getByRole("textbox", { name: "輸入區" });
    await input.click();
    await input.pressSequentially("su3cl3");
    await input.press("Control+Enter");

    await expect(input).toHaveValue("ni hao");
  });

  test("outputs ASCII braille with Ctrl+Enter when configured", async ({
    page,
  }) => {
    await page.goto(FEATURE_INPUT_URL);
    await page.locator("#ctrl_enter_option").selectOption("5");

    const input = page.getByRole("textbox", { name: "輸入區" });
    await input.click();
    await input.pressSequentially("su3cl3");
    await input.press("Control+Enter");

    await expect(input).toHaveValue("n*`r%`");
  });

  test("cycles punctuation candidates when repeated punctuation mode is enabled", async ({
    page,
  }) => {
    await page.goto(FEATURE_INPUT_URL);
    await page.locator("#repeated_punctuation_choose_candidate").check();

    const input = page.getByRole("textbox", { name: "輸入區" });
    await input.click();
    await input.pressSequentially(">");

    await expect(page.locator("#composing_buffer")).toHaveText("。|");

    await input.pressSequentially(">");

    await expect(page.locator("#composing_buffer")).toHaveText("．|");
  });

  test("uses half-width punctuation when the option is enabled", async ({
    page,
  }) => {
    await page.goto(FEATURE_INPUT_URL);
    await page.locator("#half_width_punctuation").check();

    const input = page.getByRole("textbox", { name: "輸入區" });
    await input.click();
    await input.pressSequentially(">");

    await expect(page.locator("#composing_buffer")).toHaveText(".|");
  });

  test("clears the composing buffer with Escape when ESC clearing is enabled", async ({
    page,
  }) => {
    await page.goto(FEATURE_INPUT_URL);
    await page.locator("#esc_key").check();

    const input = page.getByRole("textbox", { name: "輸入區" });
    await input.click();
    await input.pressSequentially("su");

    await expect(page.locator("#composing_buffer")).toContainText("ㄋ");

    await input.press("Escape");

    await expect(page.locator("#composing_buffer")).toBeHidden();
    await expect(input).toHaveValue("");
  });

  test("keeps committed composing text when Escape clearing is disabled", async ({
    page,
  }) => {
    const input = await openFeatureInput(page);
    await input.pressSequentially("su3cl3");

    await expect(page.locator("#composing_buffer")).toHaveText("你好|");

    await input.press("Escape");

    await expect(page.locator("#composing_buffer")).toHaveText("你好|");
    await expect(input).toHaveValue("");
  });

  test("supports asdfghjkl candidate keys after switching the option", async ({
    page,
  }) => {
    await page.goto(FEATURE_INPUT_URL);
    await page.locator("#use_plainbopomofo").check();
    await page.locator("#keys").selectOption("asdfghjkl");

    const input = page.getByRole("textbox", { name: "輸入區" });
    await input.click();
    await input.pressSequentially("cji3");
    await input.press("Space");

    await expect(page.getByRole("row", { name: "a 火" })).toBeVisible();

    await input.press("a");

    await expect(input).toHaveValue("火");
  });

  test("adds a user phrase through shift-selection and Enter", async ({
    page,
  }) => {
    const input = await openFeatureInput(page);
    await input.pressSequentially("jo65j/ ");
    await input.press("Shift+ArrowLeft");
    await input.press("Shift+ArrowLeft");
    await input.press("Shift+ArrowLeft");
    await input.press("Enter");

    await expect
      .poll(() => page.evaluate(() => window.localStorage.getItem("user_phrases")))
      .toContain("為中 ㄨㄟˊ-ㄓㄨㄥ");
  });
});
