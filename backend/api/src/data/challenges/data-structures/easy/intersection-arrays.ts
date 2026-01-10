import { Challenge } from "../../../../types";

export const intersection: Challenge = {
    id: "10",
    title: "Intersection of Two Arrays",
    difficulty: "easy",
    description:
        "Given two integer arrays nums1 and nums2, return an array of their intersection. Each element in the result must be unique and you may return the result in any order.",
    starterCode: `function intersection(nums1, nums2) {
    // Write your code here
}`,
    testCases: [
        {
            input: [
                [1, 2, 2, 1],
                [2, 2],
            ],
            expected: [2],
        },
        {
            input: [
                [4, 9, 5],
                [9, 4, 9, 8, 4],
            ],
            expected: [9, 4],
        },
    ],
};
