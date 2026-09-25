import {
  analyzeFrame,
  cosineSimilarity,
  createSolidImage,
  embeddingFromImage,
  facesMatch,
  hasUsableFace,
  paintOvalFace,
} from '../src/lib/face';

describe('face analysis', () => {
  it('rejects a blank wall', () => {
    const wall = createSolidImage(96, 96, { r: 40, g: 80, b: 160 });
    expect(hasUsableFace(analyzeFrame(wall))).toBe(false);
  });

  it('accepts a painted face and tracks a head turn', () => {
    const center = paintOvalFace(createSolidImage(96, 96, { r: 20, g: 24, b: 30 }));
    const left = paintOvalFace(createSolidImage(96, 96, { r: 20, g: 24, b: 30 }), {
      shiftX: -0.12,
    });
    expect(hasUsableFace(analyzeFrame(center))).toBe(true);
    expect(analyzeFrame(left).centroidX).toBeLessThan(analyzeFrame(center).centroidX);
  });

  it('sees blink as a drop in eye brightness', () => {
    const open = analyzeFrame(paintOvalFace(createSolidImage(96, 96, { r: 20, g: 24, b: 30 })));
    const closed = analyzeFrame(
      paintOvalFace(createSolidImage(96, 96, { r: 20, g: 24, b: 30 }), { closedEyes: true }),
    );
    expect(closed.eyeBrightness).toBeLessThan(open.eyeBrightness);
  });

  it('matches the same face and rejects a different tone', () => {
    const asha = embeddingFromImage(
      paintOvalFace(createSolidImage(64, 64, { r: 18, g: 20, b: 26 }), {
        tone: { r: 210, g: 160, b: 130 },
      }),
    );
    const ashaAgain = embeddingFromImage(
      paintOvalFace(createSolidImage(64, 64, { r: 18, g: 20, b: 26 }), {
        tone: { r: 208, g: 158, b: 128 },
      }),
    );
    const other = embeddingFromImage(
      paintOvalFace(createSolidImage(64, 64, { r: 18, g: 20, b: 26 }), {
        tone: { r: 90, g: 60, b: 40 },
      }),
    );

    expect(cosineSimilarity(asha, ashaAgain)).toBeGreaterThan(0.9);
    expect(facesMatch(asha, ashaAgain)).toBe(true);
    expect(facesMatch(asha, other)).toBe(false);
  });
});
