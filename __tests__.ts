import { expect } from 'chai';
import {
  mergeAll,
  unit,
  sequence,
  run,
  computeTransform,
} from './index';

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

// TODO: either mock performance.now and requestAnimationFrame
// or install Puppetter to run these tests
// describe('mergeAll', function() {
//   it('should accept sequences', function(done) {
//     let buffer = [];
//     const expected = ['A', 'B1', 'C', 'B2', 'B3'];
// 
//     const seq = mergeAll([
//       unit({ begin: () => buffer.push('A') }),
//       sequence([
//         unit({ begin: () => buffer.push('B1') }),
//         unit({ begin: () => buffer.push('B2') }),
//         unit({
//           begin: () => buffer.push('B3'),
//           complete: () => done(buffer.toString() === expected.toString()),
//         }),
//       ]),
//       unit({ begin: () => buffer.push('C') }),
//     ]);
//     run(seq);
//   });
// });
// 
// {
//   // should log alternating ones and zeroes starting with 1
//   // ten times
//   const alternate = unit({
//     iterations: 10,
//     direction: directions.ALTERNATE,
//     loop: (value) => console.log(`loop: ${value}`),
//     complete: (value) => console.log(`complete: ${value}`),
//   });
//   // run(alternate);
// }
// 
// {
//   // should log alternating ones and zeroes starting with 1
//   // ten times
//   const alternate = unit({
//     iterations: 10,
//     direction: directions.ALTERNATE | directions.FORWARD,
//     loop: (value) => console.log(`loop: ${value}`),
//     complete: (value) => console.log(`complete: ${value}`),
//   });
//   // run(alternate);
// }
// 
// {
//   // should log alternating ones and zeroes starting with 0
//   // ten times
//   const alternate = unit({
//     iterations: 10,
//     direction: directions.ALTERNATE | directions.BACKWARD,
//     loop: (value) => console.log(`loop: ${value}`),
//     complete: (value) => console.log(`complete: ${value}`),
//   });
//   // run(alternate);
// }
// 
// {
//   // should call change on updates and completion
//   const change = unit({
//     change: (value) => console.log(`change: ${value}`),
//   });
// //   run(change);
// }
// 
// {
//   // should call change after update and complete
//   const change = unit({
//     change: (value) => console.log(`change: ${value}`),
//     update: (value) => console.log(`update: ${value}`),
//     complete: (value) => console.log(`complete: ${value}`),
//   });
//   run(change);
// }
