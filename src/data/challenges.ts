export interface TestCase {
    input: any[];
    expected: any;
}

export interface Challenge {
    id: string;
    title: string;
    difficulty: "easy" | "medium" | "hard";
    description: string;
    starterCode: string;
    testCases: TestCase[];
}

export const challenges: Challenge[] = [
    {
        id: "1",
        title: "Two Sum",
        difficulty: "easy",
        description:
            "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
        starterCode: `function twoSum(nums, target) {
    // Write your code here
}`,
        testCases: [
            { input: [[2, 7, 11, 15], 9], expected: [0, 1] },
            { input: [[3, 2, 4], 6], expected: [1, 2] },
            { input: [[3, 3], 6], expected: [0, 1] },
        ],
    },
    {
        id: "2",
        title: "Reverse String",
        difficulty: "easy",
        description:
            "Write a function that reverses a string. The input string is given as an array of characters s.",
        starterCode: `function reverseString(s) {
    // Write your code here
}`,
        testCases: [
            {
                input: [["h", "e", "l", "l", "o"]],
                expected: ["o", "l", "l", "e", "h"],
            },
            {
                input: [["H", "a", "n", "n", "a", "h"]],
                expected: ["h", "a", "n", "n", "a", "H"],
            },
        ],
    },
    {
        id: "3",
        title: "Contains Duplicate",
        difficulty: "easy",
        description:
            "Given an integer array nums, return true if any value appears at least twice in the array, and return false if every element is distinct.",
        starterCode: `function containsDuplicate(nums) {
    // Write your code here
}`,
        testCases: [
            { input: [[1, 2, 3, 1]], expected: true },
            { input: [[1, 2, 3, 4]], expected: false },
            { input: [[1, 1, 1, 3, 3, 4, 3, 2, 4, 2]], expected: true },
        ],
    },
];
