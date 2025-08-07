// src/index.ts を修正して、
// 特定の emote（emote1, emote2 など）だけを許可して表示し、
// それ以外は従来通り除外するようにします。
// さらに、許可された emote をキリル文字に変換します。

import { build } from "./ass";
import {
  download_comments_parallel,
  info_from_url,
  randomize,
} from "./download";

const save = function (filename: string, s: string) {
  const blob = new Blob([s], { type: "text/plain" });
  const a = document.createElement("a");
  a.download = filename;
  a.href = URL.createObjectURL(blob);
  return a.click();
};

const show_downloading = function () {
  const e = document.createElement("div");
  e.id = "orcd-downloading";
  e.innerText = "コメントをダウンロード中...";
  const s = e.style;
  s.position = "fixed";
  s.width = "100%";
  s.top = s.left = "0";
  s.textAlign = "center";
  s.padding = "16px";
  s.fontSize = "32px";
  s.fontWeight = "bold";
  s.zIndex = "99999999";
  s.color = "#333";
  s.backgroundColor = "#fff";
  s.boxShadow = "0 0 40px #000";
  return document.body.append(e);
};

const remove_downloading = function () {
  document.querySelector("#orcd-downloading")?.remove();
};

// ✅ ホワイトリストと変換マップ（今は2つだけ）
const whitelistEmotes: Record<string, string> = {
  "[emote:3175408:oechanOPENREC]": "О",  // キリル O
  "[emote:55886:kickSadge]": "Ж",        // キリル ZH
};

(async function () {
  try {
    show_downloading();
    const info = await info_from_url(window.location.href);
    let comments = await download_comments_parallel(info);

    // ✅ emote除外処理の修正：
    comments = comments.map((chat) => {
      const msg = chat.message;
      // emoteを含むが、ホワイトリストにあるなら変換する
      for (const emote of Object.keys(whitelistEmotes)) {
        if (msg.includes(emote)) {
          chat.message = msg.replaceAll(emote, whitelistEmotes[emote]);
          return chat; // 許可
        }
      }
      // emote: が含まれていてホワイトリストでなければ除外
      if (msg.includes("[emote:")) {
        chat.message = "";
      }
      return chat;
    });

    const randomizedComments = randomize(comments);
    const ass = build(randomizedComments, {
      font_size: 36,
      displayed_time: 5,
      outline: 3,
    });
    save(`${info.livestream.session_title}.ass`, ass);
    return remove_downloading();
  } catch (e) {
    remove_downloading();
    if (e instanceof Error) {
      return alert(e.message);
    }
  }
})();

