export interface TestCase {
    input: any[];
    expected: any;
}

export interface Challenge {
    id: string;
    title: string;
    difficulty: "easy" | "medium" | "hard";
    description: string;
    starterCode: string;
    testCases: TestCase[];
}
