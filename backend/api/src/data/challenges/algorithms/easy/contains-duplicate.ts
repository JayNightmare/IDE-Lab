import { Challenge } from "../../../../types";

export const containsDuplicate: Challenge = {
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
};
