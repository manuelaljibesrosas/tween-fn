import { expect } from 'chai';
import createMockRaf from 'mock-raf';
import {
  mergeAll,
  unit,
  sequence,
  run,
  computeTransform,
  directions,
} from './index';

const mockRaf = createMockRaf();

describe('computeTransform', function() {
  it('handles unitless values', function() {
    const originalTransform = 'translateX(50px) scale(.5)';
    const ret = computeTransform(originalTransform, 'scale(1)');

    expect(ret).to.equal('translateX(50px) scale(1)');
  });
  it('handles multiple values', function() {
    const originalTransform = 'translateX(50px) scale(.5)';
    const ret = computeTransform(originalTransform, 'translateX(10px) scale(1)');

    expect(ret).to.equal('translateX(10px) scale(1)');
  });
});

describe('mergeAll', function() {
  it('should accept sequences', function() {
    let buffer: Array<string> = [];
    const expected = ['A', 'B1', 'C', 'B2', 'B3'];

    const seq = mergeAll([
      unit({ begin: () => buffer.push('A') }),
      sequence([
        unit({ begin: () => buffer.push('B1') }),
        unit({ begin: () => buffer.push('B2') }),
        unit({ begin: () => buffer.push('B3') }),
      ]),
      unit({ begin: () => buffer.push('C') }),
    ]);
    run(seq, { now: mockRaf.now, requestFrame: mockRaf.raf });
    mockRaf.step({ count: 1000 * 5 });

    expect(buffer).to.deep.equal(expected);
  });
});

describe('directions.ALTERNATE', () => {
  it(
    'should log alternating ones and zeroes starting with 1 ten times',
    () => {
      let buffer: Array<string> = [];
      const expected = '1010101010'.split('');

      const alternate = unit({
        iterations: 10,
        direction: directions.ALTERNATE,
        loop: (value) => buffer.push(String(value)),
        complete: (value) => buffer.push(String(value)),
      });
      run(alternate, { now: mockRaf.now, requestFrame: mockRaf.raf });
      mockRaf.step({ count: 1000 * 5 });

      expect(buffer).to.deep.equal(expected);
    },
  );
  it(
    'should be able to combine with directions.FORWARD using a binary OR',
    () => {
      let buffer: Array<string> = [];
      const expected = '1010101010'.split('');

      const alternate = unit({
        iterations: 10,
        direction: directions.ALTERNATE | directions.FORWARD,
        loop: (value) => buffer.push(String(value)),
        complete: (value) => buffer.push(String(value)),
      });
      run(alternate, { now: mockRaf.now, requestFrame: mockRaf.raf });
      mockRaf.step({ count: 1000 * 5 });

      expect(buffer).to.deep.equal(expected);
    },
  );
  it(
    'should be able to combine with directions.BACKWARD using a binary OR',
    () => {
      let buffer: Array<string> = [];
      const expected = '0101010101'.split('');

      const alternate = unit({
        iterations: 10,
        direction: directions.ALTERNATE | directions.BACKWARD,
        loop: (value) => buffer.push(String(value)),
        complete: (value) => buffer.push(String(value)),
      });
      run(alternate, { now: mockRaf.now, requestFrame: mockRaf.raf });
      mockRaf.step({ count: 1000 * 5 });

      expect(buffer).to.deep.equal(expected);
    },
  );
});

describe('change hook', () => {
  it('should call change on updates and completion', () => {
    let changeBuffer: Array<string> = [];
    let updateCompleteBuffer: Array<string> = [];

    const change = unit({
      duration: 16 * 10,
      change: () => changeBuffer.push('+'),
      update: () => updateCompleteBuffer.push('+'),
      complete: () => updateCompleteBuffer.push('+'),
    });
    run(change, { now: mockRaf.now, requestFrame: mockRaf.raf });
    mockRaf.step({ count: 10 });

    expect(changeBuffer).to.deep.equal(updateCompleteBuffer);
  });
  it('should call change after update and complete', () => {
    let buffer: Array<string> = [];
    const expected = '1010101010'.split('');

    const change = unit({
      duration: 16 * 5,
      change: () => buffer.push('0'),
      update: () => buffer.push('1'),
      complete: () => buffer.push('1'),
    });
    run(change, { now: mockRaf.now, requestFrame: mockRaf.raf });
    mockRaf.step({ count: 5 });
  });
});
