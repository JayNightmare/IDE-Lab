import { Challenge } from "../../../../types";

export const maximumSubarray: Challenge = {
    id: "6",
    title: "Maximum Subarray",
    difficulty: "medium",
    description:
        "Given an integer array nums, find the subarray with the largest sum, and return its sum.",
    starterCode: `function maxSubArray(nums) {
    // Write your code here
}`,
    testCases: [
        { input: [[-2, 1, -3, 4, -1, 2, 1, -5, 4]], expected: 6 },
        { input: [[1]], expected: 1 },
        { input: [[5, 4, -1, 7, 8]], expected: 23 },
    ],
};
