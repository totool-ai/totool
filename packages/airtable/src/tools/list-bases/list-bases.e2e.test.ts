import { describe, it, expect, beforeAll } from "vitest";
import { ListBasesTool } from "./list-bases";
import dotenv from "dotenv";

dotenv.config();

describe("ListBasesTool E2E", () => {
  beforeAll(() => {
    // Validate required environment variables
    if (!process.env.AIRTABLE_ACCESS_TOKEN) {
      throw new Error(
        "AIRTABLE_ACCESS_TOKEN environment variable is required for E2E tests"
      );
    }
  });

  it("should list bases from a real Airtable account", async () => {
    const tool = new ListBasesTool({
      auth: { accessToken: process.env.AIRTABLE_ACCESS_TOKEN! },
    });

    const result = await tool.execute({}, {});

    expect(result).toHaveProperty("bases");
    expect(Array.isArray(result.bases)).toBe(true);
    expect(result.bases.length).toBeGreaterThan(0);

    // Verify base structure
    const base = result.bases[0];
    expect(base).toHaveProperty("id");
    expect(base).toHaveProperty("name");
    expect(base).toHaveProperty("permissionLevel");
    expect(typeof base.id).toBe("string");
    expect(typeof base.name).toBe("string");
    expect(typeof base.permissionLevel).toBe("string");
  }, 30000); // 30 second timeout for API calls

  it("should handle invalid access token", async () => {
    const tool = new ListBasesTool({
      auth: { accessToken: "invalid-token" },
    });

    await expect(tool.execute({}, {})).rejects.toThrow();
  }, 30000);
});
