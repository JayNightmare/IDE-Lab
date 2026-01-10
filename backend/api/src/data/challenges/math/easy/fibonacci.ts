import { Challenge } from "../../../../types";

export const fibonacci: Challenge = {
    id: "8",
    title: "Fibonacci Number",
    difficulty: "easy",
    description:
        "The Fibonacci numbers are a sequence where F(n) = F(n-1) + F(n-2), with F(0) = 0 and F(1) = 1. Calculate F(n).",
    starterCode: `function fib(n) {
    // Write your code here
}`,
    testCases: [
        { input: [2], expected: 1 },
        { input: [3], expected: 2 },
        { input: [4], expected: 3 },
        { input: [10], expected: 55 },
    ],
};
