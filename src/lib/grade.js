// One gentle, warm grade for every photograph (CSS and WebGL) so the collection reads as one series.
export const GRADE = { sepia: 0.1, saturation: 1.0, contrast: 1.03, brightness: 1.01, warmth: 0.0 }
export const CSS_GRADE = `sepia(${GRADE.sepia}) saturate(${GRADE.saturation}) contrast(${GRADE.contrast}) brightness(${GRADE.brightness})`
