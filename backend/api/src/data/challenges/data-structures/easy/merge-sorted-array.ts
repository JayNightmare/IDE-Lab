import { Challenge } from "../../../../types";

export const mergeSortedArray: Challenge = {
    id: "9",
    title: "Merge Sorted Array",
    difficulty: "easy",
    description:
        "You are given two sorted arrays, nums1 and nums2. Merge nums2 into nums1 as one sorted array. Return the merged array. Note: In this version, just return the new merged array.",
    starterCode: `function merge(nums1, m, nums2, n) {
    // Write your code here
}`,
    testCases: [
        { input: [[1, 2, 3], 3, [2, 5, 6], 3], expected: [1, 2, 2, 3, 5, 6] },
        { input: [[1], 1, [], 0], expected: [1] },
    ],
};
