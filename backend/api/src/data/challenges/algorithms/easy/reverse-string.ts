import { Challenge } from "../../../../types";

export const reverseString: Challenge = {
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
};
