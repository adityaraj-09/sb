import { analyzeFrame, createSolidImage, paintOvalFace } from '../src/lib/face';
import {
  createLivenessSession,
  LIVENESS_TIMEOUT_MS,
  reduceLiveness,
} from '../src/lib/liveness';

const background = { r: 20, g: 24, b: 30 };

function features(options?: { shiftX?: number; closedEyes?: boolean }) {
  return analyzeFrame(paintOvalFace(createSolidImage(96, 96, background), options));
}

describe('liveness state machine', () => {
  it('passes a left-turn challenge after return to center', () => {
    let session = createLivenessSession(0, 'turn_left');
    session = reduceLiveness(session, features(), 10);
    expect(session.phase).toBe('challenge');

    session = reduceLiveness(session, features({ shiftX: -0.16 }), 200);
    expect(session.phase).toBe('return_center');

    session = reduceLiveness(session, features(), 400);
    expect(session.phase).toBe('passed');
  });

  it('passes a blink challenge', () => {
    let session = createLivenessSession(0, 'blink');
    session = reduceLiveness(session, features(), 10);
    expect(session.phase).toBe('challenge');

    session = reduceLiveness(session, features({ closedEyes: true }), 200);
    expect(session.sawClosedEyes).toBe(true);

    session = reduceLiveness(session, features(), 400);
    expect(session.phase).toBe('passed');
  });

  it('fails after the timeout', () => {
    let session = createLivenessSession(0, 'turn_right');
    session = reduceLiveness(session, features(), 10);
    session = reduceLiveness(session, features(), LIVENESS_TIMEOUT_MS + 20);
    expect(session.phase).toBe('failed');
  });
});
