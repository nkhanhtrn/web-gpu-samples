import { getScreenPixels } from './webgpu.js';

function assertEqual(actual, expected, message) {
    if (actual !== expected) {
        throw new Error(`${message}: expected ${expected}, got ${actual}`);
    }
}

function test_getScreenPixels() {
    // Test center (0,0) NDC
    let result = getScreenPixels(0, 0, 640, 480);
    assertEqual(result.pixelX, 320, 'Center X');
    assertEqual(result.pixelY, 240, 'Center Y');

    // Test top-left (-1, 1) NDC
    result = getScreenPixels(-1, 1, 640, 480);
    assertEqual(result.pixelX, 0, 'Top-left X');
    assertEqual(result.pixelY, 0, 'Top-left Y');

    // Test bottom-right (1, -1) NDC
    result = getScreenPixels(1, -1, 640, 480);
    assertEqual(result.pixelX, 640, 'Bottom-right X');
    assertEqual(result.pixelY, 480, 'Bottom-right Y');

    // Test edge cases
    result = getScreenPixels(-1, -1, 640, 480);
    assertEqual(result.pixelX, 0, 'Bottom-left X');
    assertEqual(result.pixelY, 480, 'Bottom-left Y');

    result = getScreenPixels(1, 1, 640, 480);
    assertEqual(result.pixelX, 640, 'Top-right X');
    assertEqual(result.pixelY, 0, 'Top-right Y');

    console.log('All getScreenPixels tests passed!');
}

test_getScreenPixels();
