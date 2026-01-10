import { Challenge } from "../../../../types";

export const palindromeNumber: Challenge = {
    id: "4",
    title: "Palindrome Number",
    difficulty: "easy",
    description:
        "Given an integer x, return true if x is a palindrome, and false otherwise.",
    starterCode: `function isPalindrome(x) {
    // Write your code here
}`,
    testCases: [
        { input: [121], expected: true },
        { input: [-121], expected: false },
        { input: [10], expected: false },
    ],
};
