## k-Partition problem approximation
This library implements approximate solution for number grouping into N buckets with close to equal total sum (an approximation of [Partition problem](https://en.wikipedia.org/wiki/Partition_problem) for N groups). The main idea of the algorithm is simple - it uses greedy approach to get an initial solution and then special group shuffling to level off differences between groups. Shuffling procedure processes group pairs (all group combinations) and minimizes difference between every two groups using "water flow"-like approach - elements are exchanged between two groups if the exchange would level off the difference (the delta between two elements is less than or equal to the half of delta between two group totals, so the exchange of these elements would minimize the difference between two groups). Shuffling procedure uses multiple rounds (library allows regulating maximal round count and/or minimal precision), so, combined with all group pair processing, it's quite computationally expensive. However grouping of large arrays of elements should not require shuffling at all (greedy approach has quite decent precision in these cases), but smaller arrays are grouped quite fast (about 0.5 seconds for 6000 elements, less than 0.16s for 1000 elements).

### Usage
The library provides two grouping methods and two main data structures for grouping. Groupable elements should implement `getMetric` method which returns a positive number (you can also extend `AbstractMember` or `Member` classes). Elements are initially grouped using greedy approach by `greedyGrouping` function, which takes an array of groupable elements and group count and returns an array of `Group` objects (you could use `members()` method to get an array of group elements and `total()` to get total metric of the group). Then this array may be passed to the `levelOffDifferences` function, which performs shuffling (it takes second optional argument - object with parameters `roundCount` and/or `minPrecision`). Library uses CommonJS module system and ES6+ syntax.\
Example:
```javascript
const { greedyGrouping, levelOffDifferences, Member } = require('./grouping')
...
const GROUP_COUNT = 5
const elements = [new Member(1), new Member(2), ...]
const groups = greedyGrouping(elements, GROUP_COUNT)
levelOffDifferences(groups)
// or 
levelOffDifferences(groups, {
  roundCount: 10,
  minPrecision: 0.1
})
```
For more usage examples refer `test.js` file which also performs basic library tests and benchmarks.

### License & Authors
Project code is distributed under the terms of MIT License. See LICENSE for details. \
Author: Jevgēnijs Protopopovs <jprotopopov1122@gmail.com> \
Collaboration, testing and sample providing: Mihails Andžans \
All contributions are welcome.
