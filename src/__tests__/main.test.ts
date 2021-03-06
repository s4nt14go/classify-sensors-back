import { promises as fs } from 'fs'
import { evaluate } from '../main'

describe('Main', () => {
  for (let i = 1; i < 3; i++) {
    it(`works ${i}`, async () => {
      const text = (await fs.readFile(__dirname + `/test-${i}.log`)).toString();
      const output = evaluate(text);
      const result = JSON.parse(
        (await fs.readFile(__dirname + `/test-${i}.results.json`)).toString()
      )
      expect(Object.keys(output)).toEqual(expect.arrayContaining(Object.keys(result)))
      Object.keys(result).forEach((k) => {
        expect(output[k].sort()).toEqual(result[k].sort())
      })
    })
  }
})
