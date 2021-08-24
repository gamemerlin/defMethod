import { transformLine, parseFileContent, sortOutput } from "./index";

enum DelimiterTypes {
  comma = "comma",
  space = "space",
  pipe = "pipe",
}

test("parseFileContent - should parse file contents", () => {
  const mockFileContents = {
    comma: "a, b, c, d, e, f",
    space: "1 2 3 4 5 6",
    pipe: "g | h | i | j | k | l",
  };
  expect(parseFileContent(mockFileContents)).toEqual([
    "a b c e d",
    "1 2 4 5 6",
    "g h j l k",
  ]);
});

test("transformLine - should transform a line", () => {
  const mockLine = ["a", "b", "c", "d", "e", "f"];

  expect(transformLine(DelimiterTypes.comma, mockLine)).toEqual([
    "a",
    "b",
    "c",
    "e",
    "d",
  ]);
  expect(transformLine(DelimiterTypes.pipe, mockLine)).toEqual([
    "a",
    "b",
    "d",
    "f",
    "e",
  ]);
  expect(transformLine(DelimiterTypes.space, mockLine)).toEqual([
    "a",
    "b",
    "d",
    "e",
    "f",
  ]);
});

test("transformLine - should transform f to female", () => {
  const mockLine = ["a", "b", "F", "d", "e", "g"];

  expect(transformLine(DelimiterTypes.comma, mockLine)).toEqual([
    "a",
    "b",
    "Female",
    "e",
    "d",
  ]);
});

test("transformLine - should m to male", () => {
  const mockLine = ["a", "b", "M", "d", "e", "g"];

  expect(transformLine(DelimiterTypes.comma, mockLine)).toEqual([
    "a",
    "b",
    "Male",
    "e",
    "d",
  ]);
});

test("transformLine - should a date", () => {
  const mockLineComma = ["a", "b", "c", "d", "5/2/1977", "f"];
  const mockLinePipe = ["a", "b", "c", "e", "f", "5-2-1977"];
  const mockLineSpace = ["a", "b", "c", "d", "5-2-1977", "f"];

  expect(transformLine(DelimiterTypes.comma, mockLineComma)).toEqual([
    "a",
    "b",
    "c",
    "5/2/1977",
    "d",
  ]);
  expect(transformLine(DelimiterTypes.pipe, mockLinePipe)).toEqual([
    "a",
    "b",
    "e",
    "5/2/1977",
    "f",
  ]);
  expect(transformLine(DelimiterTypes.space, mockLineSpace)).toEqual([
    "a",
    "b",
    "d",
    "5/2/1977",
    "f",
  ]);
});

test("sortOutput - should sort lines", () => {
  const mockItems = [
    "a1 3 1",
    "a2 3 2",
    "b1 2 3",
    "b2 2 4",
    "c1 1 5",
    "c2 1 6",
  ];
  
  expect(sortOutput(mockItems, [{ col: 2, dir: "asc" }])).toEqual([
    "a1 3 1",
    "a2 3 2",
    "b1 2 3",
    "b2 2 4",
    "c1 1 5",
    "c2 1 6",
  ]);

  expect(sortOutput(mockItems, [{ col: 2, dir: "desc" }])).toEqual([
    "c2 1 6",
    "c1 1 5",
    "b2 2 4",
    "b1 2 3",
    "a2 3 2",
    "a1 3 1",
  ]);

  expect(sortOutput(mockItems, [{ col: 1, dir: "asc" }, { col: 0, dir: "asc" }])).toEqual([
    "c1 1 5",
    "c2 1 6",
    "b1 2 3",
    "b2 2 4",
    "a1 3 1",
    "a2 3 2",
  ]);
});
