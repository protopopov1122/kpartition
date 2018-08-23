/*
  Copyright 2018 Jevgenijs Protopopovs

  Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

"use strict";

const { greedyGrouping, levelOffDifferences, Member } = require('./grouping')

const SAMPLE = [
  new Member(29.875),
  new Member(30.301),
  new Member(30.57),
  new Member(32.4),
  new Member(32.76),
  new Member(32.89),
  new Member(33.21),
  new Member(33.32),
  new Member(33.47),
  new Member(33.63),
  new Member(34.09),
  new Member(34.12),
  new Member(34.66),
  new Member(34.73),
  new Member(34.81),
  new Member(35.4),
  new Member(35.53),
  new Member(35.95),
  new Member(36.26),
  new Member(36.33),
  new Member(36.64),
  new Member(36.76),
  new Member(36.8),
  new Member(36.9),
  new Member(36.98),
  new Member(37.29),
  new Member(37.56),
  new Member(37.74),
  new Member(37.94),
  new Member(38),
  new Member(38.49),
  new Member(38.5),
  new Member(38.77),
  new Member(38.8),
  new Member(39.8),
  new Member(39.96),
  new Member(40.11),
  new Member(40.18),
  new Member(40.2),
  new Member(40.37),
  new Member(40.66),
  new Member(40.7),
  new Member(40.77),
  new Member(40.82),
  new Member(41.11),
  new Member(41.5),
  new Member(41.59),
  new Member(42.15),
  new Member(42.76),
  new Member(42.81),
  new Member(42.84),
  new Member(43.25),
  new Member(43.27),
  new Member(44.44),
  new Member(45.15),
  new Member(45.2),
  new Member(45.31),
  new Member(45.42),
  new Member(45.71),
  new Member(45.79),
  new Member(46.427),
  new Member(48.77),
  new Member(48.78),
  new Member(49.28),
  new Member(49.51),
  new Member(50.25),
  new Member(50.33),
  new Member(52.22),
  new Member(60.03),
  new Member(60.95),
  new Member(63.86),
  new Member(64.19),
  new Member(73)
].map((member, index) => {
  member.index = index
  return member
})

function randomArbitrary (min, max) {
  return Math.floor(Math.random() * (max - min)) + min
}

function randomArbitraryFloat (min, max) {
  return Math.round((Math.random() * (max - min) + min) * 1e6) / 1e6
}

function collectRandomSample (allMembers, length) {
  const members = [ ...allMembers ]
  const sample = []

  for (let i = 0; i < length; i++) {
    const index = randomArbitrary(0, members.length)
    sample.push(members[index])
    members.splice(index, 1)
  }
  return sample
}

function generateRandomSample (length, min, max) {
  const sample = []

  for (let i = 0; i < length; i++) {
    const member = new Member(randomArbitraryFloat(min, max))
    member.index = i
    sample.push(member)
  }

  return sample
}

const PRECISION = {
  roundCount: 100,
  minPrecision: 0.1
}

function groupSample (sample, groupCount) {
  const groups = greedyGrouping(sample, groupCount)
  levelOffDifferences(groups, PRECISION)
  return groups
}

function groupsAverage (groups) {
  return groups.reduce((sum, group) => sum + group.total(), 0) / groups.length
}

function groupsStandardDeviation (groups) {
  const average = groupsAverage(groups)
  const deltas = groups.map(group => group.total() - average)
  const squareDeltas = deltas.map(delta => Math.pow(delta, 2))
  const deltaSum = squareDeltas.reduce((sum, sqDelta) => sum + sqDelta, 0)
  return Math.sqrt(deltaSum / groups.length)
}

function analyzeGrouping (prefix, sample, groups) {
  console.groupCollapsed(prefix)

  console.log(`Group count: ${groups.length}`)
  console.log(`Sample length: ${sample.length}`)
  console.log(`Group average total: ${groupsAverage(groups)}`)
  console.log(`Group total standard deviation: ${groupsStandardDeviation(groups)}`)
  console.log()

  groups.forEach((group, index) => {
    console.log(`Group #${index + 1} ${group.total()}`)
    const elements = group.members().map(member => `${member.index}(${member.getMetric()})`)
    console.log(`\tMembers (${group.members().length}): ${elements.join(', ')}`)
  })

  console.log()
  console.groupEnd()
}

function testFromSample (prefix, sampleLength, groupCount) {
  const sample = collectRandomSample(SAMPLE, sampleLength)
  const groups = groupSample(sample, groupCount)
  analyzeGrouping(prefix, sample, groups)
}

function testRandom (prefix, sampleLength, { from, to }, groupCount) {
  const sample = generateRandomSample(sampleLength, from, to)
  const groups = groupSample(sample, groupCount)
  analyzeGrouping(prefix, sample, groups)
}

testFromSample('Full sample with few groups', SAMPLE.length, 4)
testFromSample('Full sample with many groups', SAMPLE.length, 18)
testFromSample('Subsample with few groups', SAMPLE.length / 3, 5)
testRandom('Random sample', 100, { from: 0.1, to: 10 }, 5)
testRandom('Random sample', 6000, { from: 0.1, to: 100 }, 15)
