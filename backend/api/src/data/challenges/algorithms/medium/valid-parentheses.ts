import { Challenge } from "../../../../types";

export const validParentheses: Challenge = {
    id: "5",
    title: "Valid Parentheses",
    difficulty: "medium",
    description:
        "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
    starterCode: `function isValid(s) {
    // Write your code here
}`,
    testCases: [
        { input: ["()"], expected: true },
        { input: ["()[]{}"], expected: true },
        { input: ["(]"], expected: false },
    ],
};
