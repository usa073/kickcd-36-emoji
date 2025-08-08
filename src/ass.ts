// src/ass.ts

export function make_ass(comments: any[]) {
  // ASSファイルの基本構造
  let ass = `
[Script Info]
ScriptType: v4.00+
Collisions: Normal
PlayResX: 1920
PlayResY: 1080
Timer: 100.0000

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Arial,48,&H00FFFFFF,&H000000FF,&H00000000,&H64000000,-1,0,0,0,100,100,0,0,1,1,0,2,10,10,10,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

  // コメントをASS形式に変換
  for (const c of comments) {
    const start = formatTime(c.vpos);
    const end = formatTime(c.vpos + 400); // 4秒表示
    ass += `Dialogue: 0,${start},${end},Default,,0,0,0,,${c.message}\n`;
  }

  return ass;
}

// ASSのタイムフォーマット変換
function formatTime(vpos: number) {
  const totalSeconds = Math.floor(vpos / 100);
  const cs = vpos % 100;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(cs).padStart(2, "0")}`;
}
