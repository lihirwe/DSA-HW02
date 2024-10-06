const fs = require('fs');

class SparseMatrix {
  constructor(matrixFilePath, numRows = 0, numCols = 0) {
    this.data = {};
    this.numRows = numRows;
    this.numCols = numCols;

    if (matrixFilePath) {
      this.loadFromFile(matrixFilePath);
    }
  }

  loadFromFile(matrixFilePath) {
    const lines = fs.readFileSync(matrixFilePath, 'utf8').split('\n');

    // Read rows and columns
    const [rowsLine, colsLine] = lines.slice(0, 2);
    this.numRows = parseInt(rowsLine.split('=')[1], 10);
    this.numCols = parseInt(colsLine.split('=')[1], 10);

    // Read data triplets
    for (let i = 2; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line) {
        const [row, col, value] = line.slice(1, -1).split(',').map(Number);
        if (!isNaN(row) && !isNaN(col) && !isNaN(value)) {
          this.data[`${row}_${col}`] = value;  // Use the correct key format
        }
      }
    }
  }

  getElement(currRow, currCol) {
    const key = `${currRow}_${currCol}`;
    return this.data.hasOwnProperty(key) ? this.data[key] : 0;
  }

  setElement(currRow, currCol, value) {
    const key = `${currRow}_${currCol}`;
    if (value === 0) {
      delete this.data[key]; // Remove if value becomes 0
    } else {
      this.data[key] = value;
    }
  }

  // Addition of two sparse matrices
  add(otherMatrix) {
    if (this.numRows !== otherMatrix.numRows || this.numCols !== otherMatrix.numCols) {
      throw new Error("Matrices must have the same dimensions for addition");
    }
    const result = new SparseMatrix(null, this.numRows, this.numCols);
    for (let row = 0; row < this.numRows; row++) {
      for (let col = 0; col < this.numCols; col++) {
        const value1 = this.getElement(row, col);
        const value2 = otherMatrix.getElement(row, col);
        result.setElement(row, col, value1 + value2);
      }
    }
    return result;
  }

  // Subtraction of two sparse matrices
  subtract(otherMatrix) {
    if (this.numRows !== otherMatrix.numRows || this.numCols !== otherMatrix.numCols) {
      throw new Error("Matrices must have the same dimensions for subtraction");
    }
    const result = new SparseMatrix(null, this.numRows, this.numCols);
    for (let row = 0; row < this.numRows; row++) {
      for (let col = 0; col < this.numCols; col++) {
        const value1 = this.getElement(row, col);
        const value2 = otherMatrix.getElement(row, col);
        result.setElement(row, col, value1 - value2);
      }
    }
    return result;
  }

  // Multiplication of two sparse matrices
  multiply(otherMatrix) {
    if (this.numCols !== otherMatrix.numRows) {
      throw new Error("Incompatible dimensions for multiplication");
    }
    const result = new SparseMatrix(null, this.numRows, otherMatrix.numCols);
    for (let row = 0; row < this.numRows; row++) {
      for (let col = 0; col < otherMatrix.numCols; col++) {
        let sum = 0;
        for (let k = 0; k < this.numCols; k++) {
          const value1 = this.getElement(row, k);
          const value2 = otherMatrix.getElement(k, col);
          sum += value1 * value2;
        }
        result.setElement(row, col, sum);
      }
    }
    return result;
  }
}

// Example usage
const path = require('path');

const matrix1 = new SparseMatrix(path.join(__dirname, "../../sample_inputs/easy_sample_01_1.txt"));
const matrix2 = new SparseMatrix(path.join(__dirname, "../../sample_inputs/easy_sample_01_2.txt"));

const sum = matrix1.add(matrix2);
const difference = matrix1.subtract(matrix2);
const product = matrix1.multiply(matrix2);

