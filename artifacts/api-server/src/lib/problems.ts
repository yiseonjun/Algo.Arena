import type { Challenge } from "@workspace/api-zod";

export interface JudgeTestCase {
  args: unknown[];
  expected: unknown;
}

const challengeData: Challenge[] = [
  {
    id: "two-sum",
    title: "두 수의 합",
    difficulty: "BRONZE",
    points: 100,
    summary: "목표값을 만드는 두 수의 인덱스를 찾으세요.",
    description:
      "정수 목록과 목표값이 주어집니다. 합이 목표값과 같은 서로 다른 두 수의 인덱스를 반환하세요. 정답은 정확히 하나이며 같은 원소를 두 번 사용할 수 없습니다.",
    inputFormat: "함수 인자로 nums: list[int], target: int이 전달됩니다.",
    outputFormat: "조건을 만족하는 인덱스 두 개를 리스트로 반환하세요.",
    examples: [
      {
        input: "nums = [2, 7, 11, 15], target = 9",
        output: "[0, 1]",
        explanation: "nums[0] + nums[1]의 결과는 9입니다.",
      },
      {
        input: "nums = [3, 2, 4], target = 6",
        output: "[1, 2]",
        explanation: "값 2와 4를 더하면 6입니다.",
      },
    ],
    constraints: [
      "2 <= len(nums) <= 100,000",
      "각 입력에는 정답이 정확히 하나 있습니다.",
      "인덱스는 어떤 순서로 반환해도 됩니다.",
    ],
    starterCode:
      "def two_sum(nums, target):\n    # 합이 목표값과 같은 두 수의 인덱스를 반환하세요.\n    pass\n",
    functionName: "two_sum",
  },
  {
    id: "valid-parentheses",
    title: "괄호 짝 맞추기",
    difficulty: "SILVER",
    points: 200,
    summary: "모든 괄호가 올바른 순서로 닫히는지 확인하세요.",
    description:
      "(), {}, []로만 이루어진 문자열이 주어집니다. 괄호가 올바르게 짝을 이루는지 판단하세요. 여는 괄호는 같은 종류의 닫는 괄호로 올바른 순서에 맞게 닫혀야 합니다.",
    inputFormat: "함수 인자로 s: str이 전달됩니다.",
    outputFormat: "괄호가 모두 올바르게 짝을 이루면 True, 그렇지 않으면 False를 반환하세요.",
    examples: [
      {
        input: 's = "([])"',
        output: "True",
        explanation: "모든 여는 괄호가 마지막에 열린 순서부터 닫힙니다.",
      },
      {
        input: 's = "([)]"',
        output: "False",
        explanation: "대괄호가 소괄호보다 먼저 닫혀 순서가 맞지 않습니다.",
      },
    ],
    constraints: [
      "0 <= len(s) <= 10,000",
      "s에는 괄호 문자만 들어 있습니다.",
    ],
    starterCode:
      "def is_valid_parentheses(s):\n    # 괄호가 모두 올바르게 짝을 이루는지 반환하세요.\n    pass\n",
    functionName: "is_valid_parentheses",
  },
  {
    id: "longest-substring",
    title: "중복 없는 가장 긴 부분 문자열",
    difficulty: "GOLD",
    points: 300,
    summary: "문자가 반복되지 않는 가장 긴 부분 문자열의 길이를 구하세요.",
    description:
      "문자열 s가 주어집니다. 같은 문자가 반복되지 않는 연속 부분 문자열 중 가장 긴 것의 길이를 반환하세요.",
    inputFormat: "함수 인자로 s: str이 전달됩니다.",
    outputFormat: "가장 긴 부분 문자열의 길이를 정수로 반환하세요.",
    examples: [
      {
        input: 's = "abcabcbb"',
        output: "3",
        explanation: '"abc"는 같은 문자가 반복되지 않는 가장 긴 부분 문자열입니다.',
      },
      {
        input: 's = "bbbbb"',
        output: "1",
        explanation: '모든 문자가 "b"이므로 길이가 1인 부분 문자열이 가장 깁니다.',
      },
    ],
    constraints: [
      "0 <= len(s) <= 100,000",
      "s에는 문자, 숫자, 기호, 공백이 포함될 수 있습니다.",
    ],
    starterCode:
      "def longest_unique_substring(s):\n    # 중복 문자가 없는 가장 긴 부분 문자열의 길이를 반환하세요.\n    pass\n",
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
