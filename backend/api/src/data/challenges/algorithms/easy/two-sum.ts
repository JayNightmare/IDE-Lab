import { Challenge } from "../../../../types";

export const twoSum: Challenge = {
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
};
