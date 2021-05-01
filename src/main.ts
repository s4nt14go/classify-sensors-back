type OutputType = {
  [key: string]: string[]
};

const sensors = ['loudness','happiness', 'bumpiness'];

export const evaluate = (text?:  string): OutputType => {
  console.log('text:\n', text);
  if (!text) throw Error('No text retrieved 😟');
  const lines = text.split('\n');
  console.log('lines:\n', lines);
  lines.splice(0, 1);
  console.log('lines without 1srt line:\n', lines);

  const output: OutputType = {};
  for (const line of lines) {
    const words = line.split(' ');
    console.log('words:\n', words);

    if (sensors.includes(words[0])) {
      if (!output[words[1]]) output[words[1]] = [];
      output[words[1]].push(words[0]);
    }
  }

  console.log('output:\n', output);
  return output;
};
