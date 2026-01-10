import { Challenge } from "../../../../types";

export const factorial: Challenge = {
    id: "7",
    title: "Factorial",
    difficulty: "easy",
    description:
        "Write a function to calculate the factorial of a non-negative integer n. The factorial of n is the product of all positive integers less than or equal to n.",
    starterCode: `function factorial(n) {
    // Write your code here
}`,
    testCases: [
        { input: [5], expected: 120 },
        { input: [0], expected: 1 },
        { input: [3], expected: 6 },
    ],
};
