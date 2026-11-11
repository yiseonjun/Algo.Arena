import type { Challenge } from "@workspace/api-zod";

export interface JudgeTestCase {
  args: unknown[];
  expected: unknown;
}

const challengeData: Challenge[] = [
  {
    id: "two-sum",
    title: "Find the Pair",
    difficulty: "BRONZE",
    points: 100,
    summary: "Find two indices whose values add up to the target.",
    description:
      "Given an integer list and a target, return the indices of two distinct numbers that add up to the target. Exactly one valid answer exists, and you may not use the same element twice.",
    inputFormat: "Your function receives nums: list[int] and target: int.",
    outputFormat: "Return a two-item list containing the matching indices.",
    examples: [
      {
        input: "nums = [2, 7, 11, 15], target = 9",
        output: "[0, 1]",
        explanation: "nums[0] + nums[1] equals 9.",
      },
      {
        input: "nums = [3, 2, 4], target = 6",
        output: "[1, 2]",
        explanation: "The values 2 and 4 add up to 6.",
      },
    ],
    constraints: [
      "2 <= len(nums) <= 100,000",
      "Each input has exactly one solution.",
      "Return indices in any order.",
    ],
    starterCode:
      "def two_sum(nums, target):\n    # Return the indices of two values that add up to target.\n    pass\n",
    functionName: "two_sum",
  },
  {
    id: "valid-parentheses",
    title: "Bracket Check",
    difficulty: "SILVER",
    points: 200,
    summary: "Decide whether every bracket closes in the right order.",
    description:
      "Given a string containing only (), {}, and [], determine whether the brackets are balanced. Each opening bracket must be closed by the same type, in the correct order.",
    inputFormat: "Your function receives s: str.",
    outputFormat: "Return True when all brackets are balanced; otherwise return False.",
    examples: [
      {
        input: 's = "([])"',
        output: "True",
        explanation: "Every opening bracket is closed in last-in, first-out order.",
      },
      {
        input: 's = "([)]"',
        output: "False",
        explanation: "The square bracket closes before the parenthesis.",
      },
    ],
    constraints: [
      "0 <= len(s) <= 10,000",
      "s contains only bracket characters.",
    ],
    starterCode:
      "def is_valid_parentheses(s):\n    # Return True only when the brackets are balanced.\n    pass\n",
    functionName: "is_valid_parentheses",
  },
  {
    id: "longest-substring",
    title: "Unique Window",
    difficulty: "GOLD",
    points: 300,
    summary: "Find the longest substring with no repeated characters.",
    description:
      "Given a string s, return the length of its longest contiguous substring that contains no repeated characters.",
    inputFormat: "Your function receives s: str.",
    outputFormat: "Return the maximum substring length as an integer.",
    examples: [
      {
        input: 's = "abcabcbb"',
        output: "3",
        explanation: '"abc" is the longest substring without repeated characters.',
      },
      {
        input: 's = "bbbbb"',
        output: "1",
        explanation: 'Every character is "b", so a single character is the longest.',
      },
    ],
    constraints: [
      "0 <= len(s) <= 100,000",
      "s may contain letters, digits, symbols, and spaces.",
    ],
    starterCode:
      "def longest_unique_substring(s):\n    # Return the length of the longest unique-character substring.\n    pass\n",
    functionName: "longest_unique_substring",
  },
];

const tests: Record<string, { public: JudgeTestCase[]; hidden: JudgeTestCase[] }> = {
  "two-sum": {
    public: [
      { args: [[2, 7, 11, 15], 9], expected: [0, 1] },
      { args: [[3, 2, 4], 6], expected: [1, 2] },
      { args: [[3, 3], 6], expected: [0, 1] },
    ],
    hidden: [
      { args: [[1, 5, 3, 7], 10], expected: [2, 3] },
      { args: [[-4, 8, 2, 1], -3], expected: [0, 3] },
      { args: [[0, 4, 9, 2], 11], expected: [2, 3] },
      { args: [[6, 1, 8, 2], 3], expected: [1, 3] },
      { args: [[10, -2, 7, 4], 8], expected: [0, 1] },
      { args: [[5, 12, 3, 9], 14], expected: [0, 3] },
      { args: [[-8, -1, -6, -3], -9], expected: [0, 1] },
      { args: [[100, 20, 50, 30], 80], expected: [2, 3] },
      { args: [[2, 5, 5, 11], 10], expected: [1, 2] },
      { args: [[7, 14, 1, 9], 16], expected: [0, 3] },
    ],
  },
  "valid-parentheses": {
    public: [
      { args: ["()"], expected: true },
      { args: ["([])"], expected: true },
      { args: ["([)]"], expected: false },
    ],
    hidden: [
      { args: [""], expected: true },
      { args: ["{}[]()"], expected: true },
      { args: ["(((())))"], expected: true },
      { args: ["((((()))"], expected: false },
      { args: ["[(])"], expected: false },
      { args: ["{{[[(())]]}}"], expected: true },
      { args: ["]"], expected: false },
      { args: ["(()))"], expected: false },
      { args: ["[{}({[]})]"], expected: true },
      { args: ["{{{{"], expected: false },
    ],
  },
  "longest-substring": {
    public: [
      { args: ["abcabcbb"], expected: 3 },
      { args: ["bbbbb"], expected: 1 },
      { args: ["pwwkew"], expected: 3 },
    ],
    hidden: [
      { args: [""], expected: 0 },
      { args: ["a"], expected: 1 },
      { args: ["abcdef"], expected: 6 },
      { args: ["abba"], expected: 2 },
      { args: ["tmmzuxt"], expected: 5 },
      { args: ["dvdf"], expected: 3 },
      { args: ["a! b! c"], expected: 4 },
      { args: ["12312345"], expected: 5 },
      { args: ["🙂🙃🙂"], expected: 2 },
      { args: ["anviaj"], expected: 5 },
    ],
  },
};

export function listChallenges(): Challenge[] {
  return structuredClone(challengeData);
}

export function findChallenge(id: string): Challenge | undefined {
  const challenge = challengeData.find((entry) => entry.id === id);
  return challenge ? structuredClone(challenge) : undefined;
}

export function getTestCases(
  challengeId: string,
  includeHidden: boolean,
): JudgeTestCase[] {
  const suite = tests[challengeId];
  if (!suite) return [];
  return [...suite.public, ...(includeHidden ? suite.hidden : [])];
}
