export const arcade_points = [
    [0, 0],         // [w[0], h[0]]
    [0, 1],         // [w[0], h[6]]
    [0.9, 1],       // [w[3], h[7]]
    [0.9, 0.87],     // [w[3], h[5]]
    [0.7, 0.87],    // [w[1], h[4]]
    [0.7, 0.55],    // [w[2], h[3]]
    [1, 0.45],       // [w[5], h[2]]
    [1, 0.35],       // [w[5], h[1]]
    [0.85, 0],      // [w[4], h[1]]
];

// Function to scale points
export function scale_points(points, wFactor, hFactor) {
    return points.map(([x, y]) => [
        x * wFactor,   // Apply width factor
        y * hFactor    // Apply height factor
    ]);
}
