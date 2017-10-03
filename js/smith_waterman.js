/*
University of Freiburg WS 2017/2018
Chair for Bioinformatics
Supervisor: Martin Raden
Author: Alexander Mattheis
*/

"use strict";

/**
 * Defines tasks after page-loading.
 */
$(document).ready(function () {
    debugger;
    if (document.title !== UNIT_TEST_WEBTITLE)  // to avoid the execution of the algorithm interfaces during a Unit-Test
        smithWaterman.startSmithWaterman();
});

(function () {  // namespace
    // public methods
    namespace("smithWaterman", startSmithWaterman, SmithWaterman,
        setIO, compute, initializeMatrix, computeMatrixAndScore, recursionFunction, computeTraceback);

    // instances
    var alignmentInstance;
    var smithWatermanInstance;

    /**
     * Function managing objects.
     */
    function startSmithWaterman() {
        imports();

        var alignmentInterface = new interfaces.alignmentInterface.AlignmentInterface();
        alignmentInterface.startAlignmentAlgorithm(SmithWaterman);
    }

    function imports() {
        $.getScript(PATHS.ALIGNMENT_INTERFACE);
        $.getScript(PATHS.ALIGNMENT);
    }

    /*---- ALGORITHM ----*/
    /**
     * Computes the optimal, local alignment.
     * @constructor
     */
    function SmithWaterman() {
        smithWatermanInstance = this;

        // variables
        this.type = ALGORITHMS.SMITH_WATERMAN;

        // inheritance
        alignmentInstance = new procedures.bases.alignment.Alignment(this);

        this.setInput = alignmentInstance.setInput;
        this.compute = alignmentInstance.compute;
        this.getOutput = alignmentInstance.getOutput;

        this.setIO = alignmentInstance.setIO;

        // public methods (linking)
        this.initializeMatrix = initializeMatrix;
        this.computeMatrixAndScore = computeMatrixAndScore;
        this.recursionFunction = recursionFunction;
        this.computeTraceback = computeTraceback;
    }

    // inheritance
    function setIO(input, output) {
        alignmentInstance.setIO(input, output);
    }

    function compute() {
        return alignmentInstance.compute();
    }

    // methods
    function initializeMatrix() {
        var inputData = alignmentInstance.getInput();
        var outputData = alignmentInstance.getOutput();

        // initialize
        outputData.matrix[0][0] = 0;

        for (var i = 1; i < inputData.matrixHeight; i++)
            outputData.matrix[i][0] = 0;

        for (var j = 1; j < inputData.matrixWidth; j++)
            outputData.matrix[0][j] = 0;

        alignmentInstance.setIO(inputData, outputData);
    }

    function computeMatrixAndScore() {
        var inputData = alignmentInstance.getInput();
        var outputData = alignmentInstance.getOutput();

        var maxValue = 0;
        var minValue = 0;

        for (var i = 1; i < inputData.matrixHeight; i++) {
            var bChar = inputData.sequenceB[i - 1];

            for (var j = 1; j < inputData.matrixWidth; j++) {
                var aChar = inputData.sequenceA[j - 1];

                outputData.matrix[i][j] = alignmentInstance.recursionFunction(aChar, bChar, i, j);

                if (maxValue < outputData.matrix[i][j])
                    maxValue = outputData.matrix[i][j];
                else if (minValue > outputData.matrix[i][j])
                    minValue = outputData.matrix[i][j];
            }
        }

        if (inputData.calculationType === ALIGNMENT_TYPES.SIMILARITY)
            outputData.score = maxValue;
        else
            outputData.score = minValue;

        alignmentInstance.setIO(inputData, outputData);
    }

    function recursionFunction(diagonalValue, upValue, leftValue) {
        var inputData = alignmentInstance.getInput();

        var value;
        if (inputData.calculationType === ALIGNMENT_TYPES.DISTANCE)
            value = Math.min(diagonalValue, upValue, leftValue, 0);
        else  // inputData.calculationType === ALIGNMENT_TYPES.SIMILARITY
            value = Math.max(diagonalValue, upValue, leftValue, 0);

        return value;
    }

    function computeTraceback() {
        var inputData = alignmentInstance.getInput();
        var outputData = alignmentInstance.getOutput();

        var backtraceStarts = [];

        if (inputData.calculationType === ALIGNMENT_TYPES.SIMILARITY)
            backtraceStarts = getAllMaxPositions(inputData, outputData);
        else
            backtraceStarts = getAllMinPositions(inputData, outputData);

        var backtracking = new procedures.backtracking.Backtracking();
        outputData.tracebackPaths = [];

        for (var i = 0; i < backtraceStarts.length; i++) {
            var path = [];
            path.push(backtraceStarts[i]);

            var tracebackPaths = backtracking.backtrace(smithWatermanInstance, path, inputData, outputData, -1);
            outputData.tracebackPaths = outputData.tracebackPaths.concat(tracebackPaths);
        }

        alignmentInstance.setIO(inputData, outputData);
    }

    function getAllMaxPositions(inputData, outputData) {
        var maxPositions = [];
        var maxValue = Number.NEGATIVE_INFINITY;

        for (var i = 0; i < inputData.matrixHeight; i++) {
            for (var j = 0; j < inputData.matrixWidth; j++) {
                if (outputData.matrix[i][j] > maxValue) {
                    maxValue = outputData.matrix[i][j];
                    maxPositions = [];
                    maxPositions.push(new procedures.backtracking.Vector(i, j));
                } else if (outputData.matrix[i][j] === maxValue) {
                    maxPositions.push(new procedures.backtracking.Vector(i, j));
                }
            }
        }

        return maxPositions;
    }

    function getAllMinPositions(inputData, outputData) {
        var minPositions = [];
        var minValue = Number.POSITIVE_INFINITY;

        for (var i = 0; i < inputData.matrixHeight; i++) {
            for (var j = 0; j < inputData.matrixWidth; j++) {
                if (outputData.matrix[i][j] < minValue) {
                    minValue = outputData.matrix[i][j];
                    minPositions = [];
                    minPositions.push(new procedures.backtracking.Vector(i, j));
                } else if (outputData.matrix[i][j] === minValue) {
                    minPositions.push(new procedures.backtracking.Vector(i, j));
                }
            }
        }

        return minPositions;
    }
}());