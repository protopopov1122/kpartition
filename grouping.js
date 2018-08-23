/*
  Copyright 2018 Jevgenijs Protopopovs

  Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

"use strict";

class AbstractMember {
  getMetric () {
    throw new Error('Not implemented yet')
  }
}

class Member extends AbstractMember {
  constructor (metric) {
    super()
    this.metric = metric
  }

  getMetric () {
    return this.metric
  }
}

class Group {
  constructor () {
    this._members = []
  }

  append (member) {
    this._members.push(member)
  }

  remove (member) {
    this._members.splice(this._members.indexOf(member), 1)
  }

  swap (member1, member2) {
    this.remove(member1)
    this.append(member2)
  }

  members () {
    return this._members
  }

  total () {
    return this._members.reduce((sum, member) => sum + member.getMetric(), 0)
  }
}

function range (from, to) {
  return [ ...Array(to - from).keys() ].map(value => value + from)
}

function greedyGrouping (elements, groupCount) {
  function groupCompare (group1, group2) {
    return group1.total() - group2.total()
  }

  if (groupCount <= 0) {
    throw new Error(`Group count should be above zero`)
  }

  if (elements.length < groupCount) {
    throw new Error(`Can't split ${elements.length} elements into ${groupCount} groups`)
  }

  const groups = range(0, groupCount).map(() => new Group())
  const elementArray = [ ...elements ].sort((member1, member2) => member2.getMetric() - member1.getMetric())
  
  while (elementArray.length > 0) {
    const element = elementArray[0]
    elementArray.splice(0, 1)
    groups[0].append(element)
    groups.sort(groupCompare)
  }
  return groups
}

function levelOffRound (group1, group2) {
  const group1Volume = group1.total()
  const group2Volume = group2.total()
  
  const halfDelta = (group1Volume - group2Volume) / 2
  const halfDeltaSign = Math.sign(halfDelta)
  const halfDeltaAbsolute = Math.abs(halfDelta)

  let maximalDeltaAbsolute = 0
  let swapMembers = null

  for (let member1 of group1.members()) {
    for (let member2 of group2.members()) {
      const memberDelta = member1.getMetric() - member2.getMetric()
      const memberDeltaAbsolute = Math.abs(memberDelta)
      if (Math.sign(memberDelta) === halfDeltaSign &&
        memberDeltaAbsolute > maximalDeltaAbsolute &&
        memberDeltaAbsolute < halfDeltaAbsolute) {
        swapMembers = [member1, member2]
        maximalDeltaAbsolute = memberDeltaAbsolute
      }
    }
  }

  if (swapMembers) {
    const [member1, member2] = swapMembers
    group1.swap(member1, member2)
    group2.swap(member2, member1)
  }
  return maximalDeltaAbsolute
}

const DEFAULT_ROUND_COUNT = 100
const DEFAULT_MIN_PRECISION = 0.01

function levelOffGroupDifferences (group1, group2, { roundCount = DEFAULT_ROUND_COUNT, minPrecision = DEFAULT_MIN_PRECISION }) {
  let precision = Number.POSITIVE_INFINITY
  for (let i = 0; precision > minPrecision && i < roundCount; i++) {
    precision = levelOffRound(group1, group2)
  }
  return precision
}

function levelOffDifferences (groups, parameters = {}) {
  for (let group1 of groups) {
    for (let group2 of groups) {
      if (group1 !== group2) {
        levelOffGroupDifferences(group1, group2, parameters)
      }
    }
  }
}

module.exports = { greedyGrouping, levelOffDifferences, AbstractMember, Member, Group }
