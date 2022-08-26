/* eslint-disable no-console */
/* eslint-disable no-param-reassign */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const runCode = createAsyncThunk(
  'terminal/runCode',
  async (code) => {
    const response = await new Promise((resolve) => {
      setTimeout(() => {
        let result;
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        document.body.appendChild(iframe);

        try {
          const internalLogs = [];
          // eslint-disable-next-line func-names
          iframe.contentWindow.console.log = function (value) {
            internalLogs.push(value);
          };

          // eslint-disable-next-line no-eval
          iframe.contentWindow.eval(code);
          result = internalLogs.join('\n');
        } catch (err) {
          result = err.toString();
        }
        document.body.removeChild(iframe);
        resolve(result);
      }, 1000);
    });
    return response;
  },
  {
    condition: (code, { getState }) => {
      const {
        terminal: { codeExecutionState },
      } = getState();
      return codeExecutionState !== 'executing';
    },
  },
);

const slice = createSlice({
  name: 'terminal',
  initialState: {
    codeExecutionState: 'idle',
    output: '',
  },
  reducers: {},
  extraReducers: {
    [runCode.pending]: (state) => {
      state.codeExecutionState = 'executing';
    },
    [runCode.fulfilled]: (state, { payload }) => {
      state.codeExecutionState = 'idle';
      state.output = payload;
    },
    [runCode.rejected]: (state, { payload }) => {
      state.output = payload;
      state.codeExecutionState = 'idle';
    },
  },
});

export const { actions } = slice;

export default slice.reducer;
