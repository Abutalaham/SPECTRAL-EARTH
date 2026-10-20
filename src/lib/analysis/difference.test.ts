import { describe, expect, it } from "vitest";
import { computeDifference, sensitivityToThreshold, MAX_RGB_DISTANCE } from "./difference";

const px = (...rgb: number[][]) => new Uint8ClampedArray(rgb.flatMap((c) => [...c, 255]));

describe("sensitivity mapping", () => {
  it("higher sensitivity gives a lower threshold", () => {
    expect(sensitivityToThreshold(100)).toBeLessThan(sensitivityToThreshold(50));
    expect(sensitivityToThreshold(50)).toBeLessThan(sensitivityToThreshold(1));
  });
  it("maps sensitivity 100 to 2 and 50 to ~134.5", () => {
    expect(sensitivityToThreshold(100)).toBeCloseTo(2);
    expect(sensitivityToThreshold(50)).toBeCloseTo(MAX_RGB_DISTANCE * 0.3 + 2);
  });
});

describe("computeDifference", () => {
  it("reports no changed pixels for identical images", () => {
    const image = px([20, 40, 60], [100, 120, 140]);
    const out = computeDifference(image, image, 10);

    expect(out.changedPixels).toBe(0);
    expect(out.totalPixels).toBe(2);
  });

  it("counts pixels whose RGB distance exceeds the threshold", () => {
    const a = px([0, 0, 0], [100, 100, 100], [10, 10, 10]);
    const b = px([255, 255, 255], [100, 100, 100], [12, 10, 10]);
    const out = computeDifference(a, b, 10);
    expect(out.changedPixels).toBe(1);
    expect(out.totalPixels).toBe(3);
  });
  it("skips pixels outside the valid area", () => {
    const a = px([0, 0, 0], [0, 0, 0]);
    const b = px([255, 0, 0], [255, 0, 0]);
    const out = computeDifference(a, b, 10, new Uint8Array([1, 0]));
    expect(out.totalPixels).toBe(1);
    expect(out.changedPixels).toBe(1);
  });
});
