import fs from "fs";

export const TextDelimiters: any = {
  comma: ",",
  space: " ",
  pipe: "|",
};

export const DateDelimiter: any = {
  comma: "/",
  space: "-",
  pipe: "-",
};

export interface FileContents {
  [key: string]: string;
}

export const ColumnIndexes: { [key: string]: number[] } = {
  pipe: [0, 1, 3, 5, 4],
  comma: [0, 1, 2, 4, 3],
  space: [0, 1, 3, 4, 5],
};

export interface SortCriteria {
  col: number;
  dir: "asc" | "desc";
  formatter?: (text: string) => string;
}

export async function readFilesToList(dirname: string) {
  const output: FileContents = {};

  const fileNames = await fs.readdirSync(dirname);
  for (let i = 0; i < fileNames.length; i++) {
    const fileName = fileNames[i];
    output[fileName] = await fs.readFileSync(`${dirname}/${fileName}`, "utf-8");
  }
  return output;
}

export function parseFileContent(fileContent: FileContents) {
  const output: string[] = [];
  Object.entries(fileContent).forEach(([fileName, fileContent]) => {
    const fileKey = fileName.replace(".txt", "");
    const delimiter: string = TextDelimiters[fileKey];
    const lines = fileContent.split("\n");
    lines.forEach((line) => {
      output.push(transformLine(fileKey, line.split(delimiter)).join(" "));
    });
  });

  return output;
}

export function transformLine(fileKey: string, line: string[]) {
  return ColumnIndexes[fileKey].reduce<string[]>((output, colIndex, index) => {
    let column = line[colIndex].trim();
    if (index === 2) {
      if (column === "F") {
        column = "Female";
      }
      if (column === "M") {
        column = "Male";
      }
    }
    if (index === 3) {
      column = column.split(DateDelimiter[fileKey]).join("/");
    }
    output.push(column);
    return output;
  }, []);
}

export function sortOutput(items: string[], sortCriteria: SortCriteria[]) {
  return items.sort((a, b) => {
    const left = a.split(/\s+/);
    const right = b.split(/\s+/);
    for (let i = 0; i < sortCriteria.length; i++) {
      const { col, dir, formatter } = sortCriteria[i];
      const textFormatter = formatter ? formatter : (text: string) => text;
      const sortValAsc = textFormatter(left[col])
        .toLowerCase()
        .localeCompare(textFormatter(right[col]).toLowerCase());
      if (sortValAsc !== 0) {
        return dir === "asc"
          ? sortValAsc
          : textFormatter(right[col])
              .toLowerCase()
              .localeCompare(textFormatter(left[col]).toLowerCase());
      } else if (i === sortCriteria.length) {
        return 0;
      }
    }
    return 0;
  });
}

async function main() {
  const fileContent = await readFilesToList("input_files");
  const parsedContent = parseFileContent(fileContent);
  const output1 = sortOutput([...parsedContent], [
    { col: 2, dir: "asc" },
    { col: 0, dir: "asc" },
  ]);

  const output2 = sortOutput([...parsedContent], [
    {
      col: 3,
      dir: "asc",
      formatter: (text: string) => {
        const tokens = text.split("/");
        return [tokens[2], tokens[1], tokens[0]].join("/");
      },
    },
    { col: 0, dir: "asc" },
  ]);
  const output3 = sortOutput([...parsedContent], [{ col: 0, dir: "desc" }]);

  fs.writeFile('expected_output.txt', ['Output 1:', ...output1, '\nOutput 2:', ...output2, '\nOutput 3:', ...output3].join('\n'), err => {
    if (err) {
      console.error(err)
      return
    }
    //file written successfully
  });
  console.log(
    "##### file content output 1  ",
    output1
  );

  console.log(
    "##### file content output 2  ",
    output2
  );

  console.log(
    "##### file content output 3  ",
    output3
  );
}

main();
